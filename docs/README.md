# Cloud Mail Pro 文档

Cloud Mail Pro 是基于 Cloudflare Workers 的开源邮箱项目，包含 Vue 3 前端和邮件 Worker。

## 开始使用

- [本地运行](local-development.md)：启动前端、Worker 和本地数据库。
- [部署指南](../README.md#部署)：通过部署脚本创建 Cloudflare 资源并发布。
- [GitHub Actions 部署](../doc/github-action.md)：在自己的仓库中配置部署凭据。
- [External API](external-api-guide.md)：外部发件、状态查询、删除与导出。
- [邮件客户端说明](client-integration.md)：IMAP、SMTP 与 Web 邮箱的关系。
- [赞赏支持](support.md)：支持 Cloud Mail Pro 的维护。

## 项目入口

- [源码](https://github.com/cs15714243477/cloud-mail-pro)
- [问题反馈](https://github.com/cs15714243477/cloud-mail-pro/issues)
- [版本发布](https://github.com/cs15714243477/cloud-mail-pro/releases)

## 目录

| 目录 | 内容 |
| --- | --- |
| `mail-vue/` | 前端界面、阅读页、账户管理和 AI 助手 |
| `mail-worker/` | API、邮件收发、数据存储与后台任务 |
| `scripts/` | Cloudflare 部署脚本 |
| `docs/`、`doc/` | 使用文档与示例图片 |

## 许可证与来源

项目使用 [MIT License](../LICENSE)，基于 [AndrewYukon/cloud-mail-plus](https://github.com/AndrewYukon/cloud-mail-plus) 和 [maillab/cloud-mail](https://github.com/maillab/cloud-mail) 继续开发。保留原作者的版权声明。
