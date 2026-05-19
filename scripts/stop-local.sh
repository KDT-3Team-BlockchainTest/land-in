#!/bin/bash
# Land-In 로컬 스택 종료 스크립트

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
RUNTIME_DIR="$ROOT/.landin-runtime"

SERVICES=(backend frontend frontend-admin mobile)

for name in "${SERVICES[@]}"; do
    PID_FILE="$RUNTIME_DIR/$name.pid"
    if [[ -f "$PID_FILE" ]]; then
        PID=$(cat "$PID_FILE")
        if kill -0 "$PID" 2>/dev/null; then
            echo "종료: $name (PID $PID)"
            kill "$PID"
        else
            echo "이미 종료됨: $name (PID $PID)"
        fi
        rm -f "$PID_FILE"
    fi
done

echo "완료."
