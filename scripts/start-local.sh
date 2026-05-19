#!/bin/bash
# Land-In 로컬 전체 스택 시작 스크립트 (Linux/macOS)
# 사용법: ./scripts/start-local.sh [옵션]
#   --skip-install       npm install 생략
#   --no-docker-mysql    Docker MySQL 자동 시작 안 함
#   --no-mobile          Expo 모바일 앱 제외
#   --backend-port N     (기본: 8080)
#   --frontend-port N    (기본: 5173)
#   --admin-port N       (기본: 5174)
#   --mysql-port N       (기본: 3306)

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
RUNTIME_DIR="$ROOT/.landin-runtime"
LOG_DIR="$RUNTIME_DIR/logs"
mkdir -p "$LOG_DIR"

# ── 기본값 ────────────────────────────────────────────────────────────────────
SKIP_INSTALL=false
NO_DOCKER_MYSQL=false
NO_MOBILE=false
BACKEND_PORT=8080
FRONTEND_PORT=5173
ADMIN_PORT=5174
MYSQL_PORT=3306

while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-install)    SKIP_INSTALL=true ;;
        --no-docker-mysql) NO_DOCKER_MYSQL=true ;;
        --no-mobile)       NO_MOBILE=true ;;
        --backend-port)    BACKEND_PORT="$2"; shift ;;
        --frontend-port)   FRONTEND_PORT="$2"; shift ;;
        --admin-port)      ADMIN_PORT="$2"; shift ;;
        --mysql-port)      MYSQL_PORT="$2"; shift ;;
        *) echo "알 수 없는 옵션: $1"; exit 1 ;;
    esac
    shift
done

# ── 유틸 ─────────────────────────────────────────────────────────────────────
BG_PIDS=()

port_in_use() { nc -z 127.0.0.1 "$1" 2>/dev/null; }

require_cmd() {
    command -v "$1" &>/dev/null || { echo "오류: '$1' 이(가) 필요합니다. $2"; exit 1; }
}

start_bg() {
    local name=$1 workdir=$2; shift 2
    (cd "$workdir" && exec "$@") >"$LOG_DIR/$name.out.log" 2>"$LOG_DIR/$name.err.log" &
    local pid=$!
    echo "$pid" > "$RUNTIME_DIR/$name.pid"
    BG_PIDS+=("$pid")
    echo "  [$name] PID $pid — 로그: $LOG_DIR/$name.out.log"
}

# ── Cleanup ───────────────────────────────────────────────────────────────────
cleanup() {
    trap - EXIT INT TERM
    echo ""
    echo "종료 중..."
    for pid in "${BG_PIDS[@]}"; do
        kill "$pid" 2>/dev/null && echo "  PID $pid 종료" || true
    done
    rm -f "$RUNTIME_DIR"/*.pid
    echo "완료."
    exit 0
}
trap cleanup EXIT INT TERM

# ── 사전 점검 ─────────────────────────────────────────────────────────────────
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " Land-In 로컬 스택 시작"
echo " 워크스페이스: $ROOT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if ! command -v java &>/dev/null; then
    if [[ -d "$HOME/.sdkman/candidates/java/current/bin" ]]; then
        export JAVA_HOME="$HOME/.sdkman/candidates/java/current"
        export PATH="$JAVA_HOME/bin:$PATH"
    else
        echo "오류: Java 21이 필요합니다."; exit 1
    fi
fi
require_cmd node "Node.js 20+를 설치하세요."
require_cmd npm  "Node.js 20+를 설치하세요."

# ── npm install ───────────────────────────────────────────────────────────────
if [[ "$SKIP_INSTALL" == false ]]; then
    echo "[설치] 프론트엔드..."
    (cd "$ROOT/frontend"       && npm install --silent)
    echo "[설치] 관리자 프론트..."
    (cd "$ROOT/frontend-admin" && npm install --silent)
    if [[ "$NO_MOBILE" == false ]]; then
        echo "[설치] 모바일..."
        (cd "$ROOT/mobile" && npm install --silent)
    fi
fi

# ── MySQL ─────────────────────────────────────────────────────────────────────
if [[ "$NO_DOCKER_MYSQL" == false ]] && ! port_in_use "$MYSQL_PORT"; then
    if command -v docker &>/dev/null; then
        echo "[MySQL] Docker 컨테이너 시작..."
        EXISTING=$(docker ps -a --filter "name=^/land-in-mysql$" --format "{{.Names}}" 2>/dev/null || true)
        if [[ "$EXISTING" == "land-in-mysql" ]]; then
            docker start land-in-mysql >/dev/null
        else
            docker run --name land-in-mysql \
                -e MYSQL_ROOT_PASSWORD=1234 -e MYSQL_DATABASE=landin_db \
                -p "${MYSQL_PORT}:3306" -d mysql:8.4 >/dev/null
        fi
        DEADLINE=$(( $(date +%s) + 90 ))
        while ! port_in_use "$MYSQL_PORT" && [[ $(date +%s) -lt $DEADLINE ]]; do sleep 2; done
    fi
fi
! port_in_use "$MYSQL_PORT" && echo "경고: MySQL 미응답 — root/1234/landin_db 확인" || true

# ── 환경 변수 ─────────────────────────────────────────────────────────────────
export SPRING_PROFILES_ACTIVE="${SPRING_PROFILES_ACTIVE:-local}"
export SPRING_DATASOURCE_URL="${SPRING_DATASOURCE_URL:-jdbc:mysql://localhost:${MYSQL_PORT}/landin_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Seoul&characterEncoding=UTF-8}"
export SPRING_DATASOURCE_USERNAME="${SPRING_DATASOURCE_USERNAME:-root}"
export SPRING_DATASOURCE_PASSWORD="${SPRING_DATASOURCE_PASSWORD:-1234}"
export APP_PUBLIC_BASE_URL="${APP_PUBLIC_BASE_URL:-http://localhost:$BACKEND_PORT}"
export PORT="$BACKEND_PORT"
chmod +x "$ROOT/backend/gradlew" 2>/dev/null || true

# ── 백그라운드 서비스 시작 ────────────────────────────────────────────────────
echo ""
echo "[서비스] 백그라운드 시작..."

BACKEND_READY=false; FRONTEND_READY=false; ADMIN_READY=false

if port_in_use "$BACKEND_PORT"; then
    echo "  [백엔드] 포트 $BACKEND_PORT 이미 사용 중 — 건너뜀"
    BACKEND_READY=true
else
    start_bg "backend" "$ROOT/backend" ./gradlew bootRun
fi

if port_in_use "$FRONTEND_PORT"; then
    echo "  [사용자 프론트] 포트 $FRONTEND_PORT 이미 사용 중 — 건너뜀"
    FRONTEND_READY=true
else
    start_bg "frontend" "$ROOT/frontend" npm run dev -- --host 0.0.0.0 --port "$FRONTEND_PORT"
fi

if port_in_use "$ADMIN_PORT"; then
    echo "  [관리자 프론트] 포트 $ADMIN_PORT 이미 사용 중 — 건너뜀"
    ADMIN_READY=true
else
    start_bg "frontend-admin" "$ROOT/frontend-admin" npm run dev -- --host 0.0.0.0 --port "$ADMIN_PORT"
fi

# ── 포트 체크 루프로 대기 (wait 미사용) ───────────────────────────────────────
if [[ $BACKEND_READY == false || $FRONTEND_READY == false || $ADMIN_READY == false ]]; then
    echo ""
    echo "[대기] 서비스 포트 응답 대기 중..."
    DEADLINE=$(( $(date +%s) + 90 ))
    while [[ $(date +%s) -lt $DEADLINE ]]; do
        [[ $BACKEND_READY  == false ]] && port_in_use "$BACKEND_PORT"  && BACKEND_READY=true  && echo "  [백엔드] 준비 완료"
        [[ $FRONTEND_READY == false ]] && port_in_use "$FRONTEND_PORT" && FRONTEND_READY=true && echo "  [사용자 프론트] 준비 완료"
        [[ $ADMIN_READY    == false ]] && port_in_use "$ADMIN_PORT"    && ADMIN_READY=true    && echo "  [관리자 프론트] 준비 완료"
        [[ $BACKEND_READY == true && $FRONTEND_READY == true && $ADMIN_READY == true ]] && break
        sleep 1
    done
fi

# ── 요약 출력 ─────────────────────────────────────────────────────────────────
status() { [[ $1 == true ]] && echo "준비" || echo "시작 중"; }
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " 백엔드 API    : http://localhost:$BACKEND_PORT  [$(status $BACKEND_READY)]"
echo " 사용자 프론트 : http://localhost:$FRONTEND_PORT  [$(status $FRONTEND_READY)]"
echo " 관리자 프론트 : http://localhost:$ADMIN_PORT  [$(status $ADMIN_READY)]"
echo " 관리자 계정   : admin@landin.local / admin1234!"
echo " 로그 경로     : $LOG_DIR"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── Expo 모바일 (포그라운드 — QR 코드가 이 터미널에 출력) ────────────────────
if [[ "$NO_MOBILE" == false ]]; then
    # 로컬 네트워크 IP 자동 감지 (VirtualBox/Wi-Fi 포함)
    LOCAL_IP=$(ip route get 1.1.1.1 2>/dev/null | awk '{for(i=1;i<=NF;i++) if($i=="src") print $(i+1)}' | head -1)
    [[ -z "$LOCAL_IP" ]] && LOCAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}')
    [[ -z "$LOCAL_IP" ]] && LOCAL_IP="127.0.0.1"

    # .env의 API URL을 현재 IP로 자동 갱신
    ENV_FILE="$ROOT/mobile/.env"
    if [[ -f "$ENV_FILE" ]]; then
        sed -i "s|EXPO_PUBLIC_API_BASE_URL=.*|EXPO_PUBLIC_API_BASE_URL=http://${LOCAL_IP}:${BACKEND_PORT}/api|" "$ENV_FILE"
        echo "  .env 업데이트: EXPO_PUBLIC_API_BASE_URL=http://${LOCAL_IP}:${BACKEND_PORT}/api"
    fi

    echo ""
    echo " Expo 모바일 시작 (LAN 모드) — QR 코드가 아래에 표시됩니다."
    echo " 핸드폰과 PC가 같은 Wi-Fi에 연결되어 있어야 합니다."
    echo " 호스트 IP: $LOCAL_IP"
    echo " Land-In 앱으로 QR 코드를 스캔하세요.  종료: Ctrl+C"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    cd "$ROOT/mobile"
    # Land-In 커스텀 앱(dev client)용 — Development Build 모드로 시작
    REACT_NATIVE_PACKAGER_HOSTNAME="$LOCAL_IP" npx expo start --clear
else
    echo ""
    echo " 모바일 없이 실행 중.  종료: Ctrl+C 또는 $ROOT/scripts/stop-local.sh"
    # sleep 루프 — wait 사용 시 서버 프로세스까지 기다리는 문제 회피
    while true; do sleep 60; done
fi
