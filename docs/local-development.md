# 本地运行 Cloud Mail Pro

准备 Node.js 22.12 或更高版本、pnpm 10，以及生成随机密钥时使用的 OpenSSL。

```bash
git clone https://github.com/cs15714243477/cloud-mail-pro.git
cd cloud-mail-pro
pnpm --dir mail-vue install --frozen-lockfile
pnpm --dir mail-worker install --frozen-lockfile
```

## 启动 Worker

首次运行时生成自己的本地密钥。`.dev.vars` 已被 Git 忽略；不要把它上传到仓库。重复生成会让已有登录会话失效。

```bash
cd mail-worker
printf 'jwt_secret="%s"\n' "$(openssl rand -hex 32)" > .dev.vars
pnpm dev --ip 127.0.0.1 --port 8787 --compatibility-flags nodejs_compat --assets ../mail-vue/public
```

Worker 默认使用本地 D1/KV，不需要生产资源 ID。管理员邮箱为 `admin@example.com`，开发域名为 `example.com`。本地运行用于界面与 API 开发；真实收发邮件还需要部署并配置 Cloudflare Email Routing、发件服务和附件存储。

另开终端，在仓库根目录初始化本地数据库：

```bash
python3 - <<'PY'
from pathlib import Path
import re
from urllib.request import urlopen
secret = re.search(r'jwt_secret="([^"]+)"', Path('mail-worker/.dev.vars').read_text()).group(1)
with urlopen('http://127.0.0.1:8787/api/init/' + secret) as response:
    print(response.read().decode())
PY
```

## 启动前端

另开终端，在仓库根目录执行：

```bash
pnpm --dir mail-vue dev --host 127.0.0.1
```

打开 [http://127.0.0.1:3001](http://127.0.0.1:3001)，用 `admin@example.com` 注册管理员账号并自行设置密码。没有默认管理员密码。

## 检查代码

```bash
pnpm --dir mail-vue build
pnpm --dir mail-worker exec vitest run --config vitest.unit.config.js
bash -n scripts/deploy.sh
```

前端构建产物写入 `mail-worker/dist/`，本地 Worker 状态写入 `.wrangler/`，均不会提交到 Git。
