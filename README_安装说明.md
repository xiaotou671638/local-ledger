# 随手记账 PWA（免费 iPhone 安装版）

## 这是什么
这是将 SwiftUI 版功能改写成网页应用的初始可运行版本。可部署到 HTTPS 静态网站，再通过 iPhone Safari 添加到主屏幕。不需要 Mac、Xcode 或 Apple 开发者付费账号。

## 已包含
- 日元 / 人民币双币种记账
- 本机浏览器存储（localStorage）
- 月度收支、独立预算及 80% / 超预算提示
- 近 6 个月支出趋势、当月分类占比
- 手动汇率换算
- CSV 导出（Excel 可打开）
- JSON 备份与 AES-GCM 加密备份 / 恢复
- 定期账单模板（当月到期时在应用启动时生成）
- 搜索、类型/币种/本月筛选
- Service Worker 缓存，部署后首次加载可缓存静态资源

## 免费部署（GitHub Pages）
1. 在 Windows 浏览器打开 https://github.com/ ，注册或登录免费账号。
2. 创建一个新仓库，例如 `local-ledger`，选择 Public。
3. 解压本 ZIP，把 `index.html`、`app.js`、`style.css`、`manifest.webmanifest`、`sw.js`、两个 PNG 图标和本说明文件上传到仓库根目录。
4. 在仓库 Settings → Pages。
5. 在 Build and deployment 中选择 Deploy from a branch；Branch 选 `main`，目录选 `/ (root)`，保存。
6. 等待 GitHub Pages 发布，页面会显示网址，通常形如 `https://你的用户名.github.io/local-ledger/`。
7. 在 iPhone 上用 Safari 打开该网址。点分享 → 添加到主屏幕；开启“作为 Web App 打开”（若显示）→ 添加。
8. 首次打开时保持网络连接，等待页面完整加载；之后可测试离线打开。

## iPhone 注意事项
- 必须用 Safari 添加到主屏幕；不要用微信内置浏览器。
- 账单只保存在当前 iPhone 的网站存储空间，不会自动同步到其他设备。
- 清理 Safari 网站数据、卸载/重置浏览器或更换设备可能导致数据丢失。请定期导出加密备份，并把备份保存到“文件”或其他安全位置。
- 这是 PWA，不是 App Store 原生 IPA。网页端无法完整等同原生 Face ID 锁；不要把它当作系统级安全保险箱。
- 定期账单模板在 App 启动时检查并生成，不是后台定时推送。
- 这是可运行的初始版，建议先用少量测试数据验证备份/恢复、CSV、定期账单，再录入真实账目。
