# Project: land-in

## Git 커밋 / 푸시 규칙

### 반드시 확인할 것
커밋 전 항상 로컬 git config가 아래와 같이 설정되어 있는지 확인한다:

```
user.name  = tmdrb0130
user.email = dltmdrb310@naver.com
```

확인 명령:
```bash
git config user.name && git config user.email
```

틀려 있으면 커밋 전에 먼저 수정:
```bash
git config user.name "tmdrb0130"
git config user.email "dltmdrb310@naver.com"
```

### 커밋 메시지
- `Co-Authored-By:` 줄을 절대 포함하지 않는다.

### 스테이징 범위
- `.env` 파일은 절대 커밋하지 않는다 (실제 IP/시크릿 포함).
- `../.claude/`, `../docs/`, `../frontend/package-lock.json`, `../frontend-admin/package-lock.json`, `../scripts/start-local.ps1` 등 무관한 파일은 포함하지 않는다.
- mobile 작업이면 `mobile/src/**`, `mobile/App.jsx`, `mobile/app.json`, `mobile/package.json`, `mobile/.env.example` 위주로 스테이징한다.
