#!/bin/sh
ulimit -n ${BYTEFAAS_FUNC_ULIMIT:-2048}
node index.js
