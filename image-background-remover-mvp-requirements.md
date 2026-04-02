# Image Background Remover 网站 MVP 需求文档

## 1. 项目概述
开发一个在线 **Image Background Remover** 工具网站。  
用户上传图片后，系统调用 **Remove.bg API** 完成抠图，并将透明背景 PNG 结果直接返回给用户下载。

该版本为 **MVP**，目标是：
- 尽快上线
- 验证用户需求
- 验证转化率
- 不做复杂账户体系
- 不做图片存储
- 不做批量任务

---

## 2. MVP 目标
### 业务目标
- 提供一个可用的在线抠图工具
- 让用户能在几秒内完成背景移除
- 用最小成本验证 SEO 流量和用户转化潜力
- 强调“**不存储图片**”的隐私卖点

### 产品目标
- 首页即可上传图片
- 上传后快速得到结果
- 可预览抠图结果
- 可下载透明 PNG
- 整体流程简单直接，无学习成本

---

## 3. 目标用户
### 核心用户
- 电商卖家
- 独立站卖家
- 设计需求轻量用户
- 社媒运营人员
- 需要快速处理商品图/头像图的普通用户

### 典型场景
- 去除商品图背景
- 制作透明 PNG
- 替换头像/素材背景前的预处理
- 做白底图、电商主图素材准备

---

## 4. 产品定位
这是一个 **极简、快速、免存储** 的在线 AI 抠图工具。

### 定位关键词
- Fast
- Simple
- No image storage
- Remove background instantly

### 核心卖点
- 无需注册
- 上传即用
- 不保存图片
- 几秒出结果
- 可直接下载透明背景 PNG

---

## 5. MVP 范围

## 包含功能
1. 首页展示产品价值
2. 用户上传图片
3. 后端调用 Remove.bg API
4. 返回处理结果
5. 前端展示结果预览
6. 用户下载 PNG
7. 文件大小与格式限制
8. 错误提示
9. 基础防滥用能力
10. 隐私说明（不存储图片）

## 不包含功能
1. 用户注册/登录
2. 图片历史记录
3. 云存储
4. 批量处理
5. 支付订阅
6. API 开放平台
7. 管理后台
8. 图片编辑功能（裁剪、阴影、换背景、加尺寸等）
9. 多语言系统（第一版可先只做英文）

---

## 6. 用户流程

### 主流程
1. 用户进入首页
2. 看到核心文案和上传入口
3. 选择一张图片上传
4. 前端校验格式和大小
5. 前端将图片提交到后端接口
6. 后端调用 Remove.bg API
7. 返回透明背景 PNG
8. 前端展示处理结果
9. 用户点击下载

### 异常流程
- 文件格式不支持
- 文件过大
- Remove.bg 接口失败
- 网络超时
- 处理失败

系统需要给出明确提示，并允许重新上传。

---

## 7. 页面需求

## 7.1 首页
### 页面目标
让用户快速理解产品，并立即上传图片。

### 页面模块
1. Hero 区
2. 上传区
3. Before/After 示例区
4. 功能卖点区
5. FAQ 区
6. Footer

### 首页核心文案建议
**标题：**
Remove Image Background Instantly

**副标题：**
Upload your image and get a transparent PNG in seconds. No signup. No image storage.

**上传按钮：**
Upload Image

**辅助说明：**
- Supports JPG, PNG, WEBP
- Max file size: 10MB
- We do not store your images

---

## 7.2 结果展示区
### 功能要求
- 展示用户原图
- 展示移除背景后的结果图
- 提供下载按钮
- 支持重新上传

### 按钮文案
- Download PNG
- Upload Another Image

---

## 7.3 FAQ 区
建议至少包含：
1. Do you store my images?
2. What file types are supported?
3. How large can my image be?
4. Is this tool free?
5. What should I do if the result is not ideal?

---

## 8. 功能需求

## 8.1 图片上传
### 要求
- 支持点击上传
- 支持拖拽上传（可选，但推荐）
- 支持格式：
  - JPG
  - PNG
  - WEBP
- 最大文件大小：
  - 10MB

### 校验逻辑
前端先校验：
- 文件是否存在
- 文件格式是否允许
- 文件大小是否超限

如果不符合要求，直接提示，不发送请求。

---

## 8.2 背景移除处理
### 要求
- 前端通过 `multipart/form-data` 上传图片
- 后端接收文件后不写入磁盘
- 后端在内存中直接转发给 Remove.bg API
- 处理完成后直接把 PNG 返回前端
- 整个过程不保存原图和结果图

### 技术要求
- 使用 Cloudflare Pages Functions 或 Workers
- 使用环境变量保存 Remove.bg API Key
- 请求失败时返回可读错误信息

---

## 8.3 结果展示
### 要求
- 成功后立即展示结果
- 支持透明背景预览
- 提供清晰可点击的下载按钮
- 下载文件默认命名建议：
  - `removed-background.png`

---

## 8.4 错误处理
### 常见错误类型
- 未上传文件
- 文件类型错误
- 文件过大
- 第三方 API 失败
- 请求超时
- 系统异常

### 错误提示要求
提示语要简短明确，例如：
- Unsupported file type
- File is too large. Max size is 10MB
- Background removal failed. Please try again
- Service is temporarily unavailable

---

## 8.5 防滥用
### MVP 最低要求
- 按 IP 做基础限流
- 防止频繁恶意调用
- 限制单次上传文件大小

### 可选增强
- Cloudflare Turnstile
- 更严格的频控策略
- 简单风控日志（仅记录状态，不记录图片内容）

---

## 9. 非功能需求

## 9.1 性能
- 上传后尽量在数秒内返回结果
- 页面首屏加载快
- 移动端可正常使用

## 9.2 隐私
- 不存储用户图片
- 不在服务器落盘
- 不保留处理结果
- 页面明确说明隐私策略

## 9.3 可用性
- 上传流程清晰
- 错误提示明确
- 下载操作简单
- 不要求注册登录

## 9.4 兼容性
支持主流现代浏览器：
- Chrome
- Safari
- Edge
- Firefox
- 移动端浏览器

---

## 10. 技术需求

## 10.1 技术栈
- 前端：HTML / CSS / JavaScript 或 Next.js 静态化前端
- 部署：Cloudflare Pages
- 服务端：Cloudflare Pages Functions / Workers
- 第三方接口：Remove.bg API

## 10.2 环境变量
- `REMOVE_BG_API_KEY`

## 10.3 存储策略
- 不接数据库
- 不接对象存储
- 不保存图片
- 仅请求生命周期内内存处理

---

## 11. 埋点与数据观察
MVP 虽然不做复杂系统，但建议至少统计：

### 核心指标
- 首页访问量
- 上传按钮点击量
- 上传成功量
- 背景移除成功量
- 下载点击量
- 接口失败率

### 目标
判断：
- 用户是否真的会上传
- 用户是否完成下载
- 哪个环节流失最多
- Remove.bg 调用成本是否可控

---

## 12. SEO 基础需求
### 页面基础
- Title
- Meta Description
- H1 清晰包含主关键词
- FAQ 内容可被索引
- 页面加载速度快
- 可扩展博客内容入口（后续）

### 建议主关键词
- image background remover
- remove background from image
- transparent background png maker

---

## 13. MVP 验收标准

### 功能验收
1. 用户可成功上传 JPG/PNG/WEBP 图片
2. 超过 10MB 的文件会被拦截
3. 后端可成功调用 Remove.bg API
4. 成功返回透明背景 PNG
5. 前端可展示结果并支持下载
6. 整个流程不写本地存储、不接云存储
7. 错误情况下能正确提示用户
8. 网站可在 Cloudflare 正常部署访问

### 体验验收
1. 首页用户能在 3 秒内理解产品用途
2. 上传入口明显
3. 处理状态清晰（如 loading）
4. 下载按钮明确
5. 移动端可正常完成上传和下载

---

## 14. 后续迭代方向（非 MVP）
MVP 跑通后再考虑：

- 免费次数限制
- 登录系统
- 支付订阅
- 批量抠图
- 白底图输出
- AI 背景替换
- 电商尺寸模板
- API 服务
- 多语言
- 博客 SEO 内容矩阵

---

## 15. 一句话版本
这是一个部署在 **Cloudflare** 上的在线抠图工具站，使用 **Remove.bg API** 实现背景移除，**不存储图片**、**以内存处理**、**上传即得结果并可下载 PNG**，用于快速验证市场需求和流量转化。
