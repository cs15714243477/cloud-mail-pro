# GitHub Actions 部署 Cloud Mail Pro

克隆或 Fork [Cloud Mail Pro](https://github.com/cs15714243477/cloud-mail-pro)，在自己的仓库中配置 Cloudflare 凭据。

普通提交会运行 CI，检查前端构建和 Worker 单元测试。Cloudflare 部署通过 **Actions → Deploy Cloud Mail Pro to Cloudflare Workers → Run workflow** 手动触发。

## 仓库配置

进入 **Settings → Secrets and variables → Actions**。密钥必须放在 Secrets 中；不要把它们写入源代码或公开的 Variables。

| 配置 | 类型 | 说明 |
| --- | --- | --- |
| `CLOUDFLARE_API_TOKEN` | Secret，必需 | Cloudflare Workers、D1、KV、R2 等资源的部署权限 |
| `CLOUDFLARE_ACCOUNT_ID` | Secret，必需 | Cloudflare 账户 ID |
| `JWT_SECRET` | Secret，必需 | 自己生成的随机长字符串 |
| `DOMAIN` | Variable 或 Secret，必需 | JSON 数组，例如 `["example.com"]` |
| `ADMIN` | Variable 或 Secret，必需 | 管理员邮箱，例如 `admin@example.com` |
| `NAME` | Variable，可选 | Worker 名称，默认 `cloud-mail-pro` |
| `CUSTOM_DOMAIN` | Variable，可选 | Web 界面的自定义域名 |
| `D1_DATABASE_ID` | Secret，可选 | 已有 D1 ID，未提供时工作流会创建或查找资源 |
| `KV_NAMESPACE_ID` | Secret，可选 | 已有 KV ID，未提供时工作流会创建或查找资源 |
| `R2_BUCKET_NAME` | Variable 或 Secret，可选 | 已创建的附件存储桶名称 |
| `PROJECT_LINK` | Variable，可选 | `true` 显示登录页项目链接 |

Linux.do 登录可配置 `LINUXDO_CLIENT_ID`、`LINUXDO_CLIENT_SECRET`、`LINUXDO_CALLBACK_URL`、`LINUXDO_SWITCH`。客户端密钥使用 Secret。

工作流会部署 Worker 并初始化数据库。部署后需要配置 Cloudflare Email Routing，让收件域名的 catch-all 指向自己的 Worker；发件服务和可选 AI 能力还需要对应的绑定配置。更多部署方式见 [README](../README.md#部署)。
