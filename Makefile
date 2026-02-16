# 测试脚本
test:frontend:
  cd frontend && npm run test

test:backend:
  cd services/user && npm run test
  cd services/chat && npm run test
  cd services/group && npm run test

test:all:
  npm run test:frontend && npm run test:backend

# 构建脚本
build:frontend:
  cd frontend && npm run build

build:backend:
  cd services/user && npm run build
  cd services/chat && npm run build
  cd services/group && npm run build

build:admin:
  cd admin && npm run build

build:all:
  npm run build:frontend && npm run build:backend && npm run build:admin

# Docker 操作
docker:up:
  docker-compose up -d

docker:down:
  docker-compose down

docker:logs:
  docker-compose logs -f

docker:restart:
  docker-compose restart

# 开发脚本
dev:frontend:
  cd frontend && npm run dev

dev:websocket:
  cd websocket && npm run dev

dev:admin:
  cd admin && npm run dev

dev:all:
  npm run dev:websocket

# 代码质量
lint:frontend:
  cd frontend && npm run lint

lint:backend:
  cd services/user && npm run lint
  cd services/chat && npm run lint
  cd services/group && npm run lint

lint:all:
  npm run lint:frontend && npm run lint:backend

format:
  npx prettier --write "**/*.{js,ts,tsx,jsx,json,md}"