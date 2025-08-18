import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import axios from 'axios';
import morgan from 'morgan';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

const PORT = process.env.PORT || 8080;
const MODEL_DIR = path.resolve(__dirname, process.env.MODEL_DIR || './data/models');

const URLS = {
  yolov8: process.env.URL_YOLO,
  nms: process.env.URL_NMS,
  ortWasm: process.env.URL_ORT_WASM
};

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

async function downloadToFile(url, destPath) {
  const writer = fs.createWriteStream(destPath);
  const res = await axios.get(url, { responseType: 'stream', timeout: 60000 });
  await new Promise((resolve, reject) => {
    res.data.pipe(writer);
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

async function warmup() {
  ensureDir(MODEL_DIR);
  const tasks = [
    { url: URLS.yolov8, local: path.join(MODEL_DIR, 'yolov8n.onnx') },
    { url: URLS.nms, local: path.join(MODEL_DIR, 'nms-yolov8.onnx') },
    { url: URLS.ortWasm, local: path.join(MODEL_DIR, 'ort-wasm-simd-threaded.wasm') }
  ];

  for (const t of tasks) {
    if (!t.url) throw new Error(`missing url for ${t.local}`);
    if (fs.existsSync(t.local) && fs.statSync(t.local).size > 0) {
      console.log('[warmup] skip exists:', path.basename(t.local));
      continue;
    }
    console.log('[warmup] downloading:', t.url);
    await downloadToFile(t.url, t.local);
    console.log('[warmup] saved:', t.local);
  }
  return { ok: true, files: tasks.map(t => t.local) };
}

// 健康检查
app.get('/health', (req, res) => {
  res.json({ ok: true, time: Date.now() });
});

// 预下载模型
app.post('/warmup', async (req, res) => {
  try {
    const result = await warmup();
    res.json(result);
  } catch (err) {
    console.error('[warmup] error', err);
    res.status(500).json({ ok: false, message: err.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`AI service listening on http://0.0.0.0:${PORT}`);
}); 
