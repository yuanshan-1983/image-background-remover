# image-background-remover

一个在线图片背景去除工具，基于 Next.js + Cloudflare Pages + Remove.bg API 构建。

## 技术栈

- **前端**: Next.js 14 + Tailwind CSS
- **API**: Next.js Edge API Route（代理 Remove.bg）
- **部署**: Cloudflare Pages
- **抠图服务**: Remove.bg API

## 功能

- ✅ 拖拽 / 点击上传图片（JPG/PNG/WEBP，≤10MB）
- ✅ 自动去除背景
- ✅ 原图 vs 结果对比预览
- ✅ 一键下载透明 PNG
- ✅ 图片不落盘，内存中转，保护隐私

## 本地开发

```bash
npm install
cp .env.example .env.local
# 填入 Remove.bg API Key
npm run dev
```

## 部署

```bash
npm install -D @cloudflare/next-on-pages
npx wrangler pages deploy
```

在 Cloudflare Pages 控制台添加环境变量 `REMOVE_BG_API_KEY`。
