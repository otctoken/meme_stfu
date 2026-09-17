# STFU Community Gallery

深色响应式静态图片站，无需 API 密钥或运行时依赖。

## 部署到 Vercel

1. 在 Vercel 选择 Add New → Project，导入 `otctoken/meme_stfu`。
2. Framework Preset 选择 **Other**，Root Directory 保持默认。
3. Build Command 使用 `npm run build`，Output Directory 为 `dist`（已在 vercel.json 配置）。
4. 点击 Deploy。无需环境变量。

配置文件已通过 `framework: null` 强制使用 Other 静态部署，覆盖项目框架预设。本地预览服务器位于 `scripts/preview.mjs`，并通过 `.vercelignore` 排除，生产站点只提供 `dist` 静态文件，不需要 Vercel Functions。

如果旧部署出现 `500 FUNCTION_INVOCATION_FAILED`，请部署包含此配置的最新 main 提交。不要对旧提交反复 Redeploy；确认 Root Directory 为仓库根目录。若仍失败，请提供部署网址和对应部署日志。

## 更新图片

编辑 `dist/gallery.js` 中的 `window.STFU_IMAGES` 数组：

```js
{ src: 'https://ik.imagekit.io/你的空间/图片.jpg', title: '图片标题', alt: '图片内容描述' },
```

每行对应一张图，按数组顺序展示。增加或删除对象即可增删图片。`featured: true` 用于首张正方形 Logo 图片。支持 JPG、PNG、WebP、GIF 等浏览器支持的图片格式。图片失败时显示 Logo 兜底。

当前包含 12 张 ImageKit 官方公开示例占位图，非 STFU 社区原创素材；正式运营前请替换为自己的图片。示例来源：
- https://imagekit.io/docs/effects-and-enhancements
- https://imagekit.io/docs/arithmetic-expressions-in-transformations
- https://imagekit.io/docs/ai-transformations

Logo 文件：`dist/assets/stfu-logo.jpeg`。头部文字用金色发光粗斜体呼应附件效果，并非原图中的专有字形。

按钮链接和字幕在 `dist/index.html` 中修改，颜色与屏幕适配在 `dist/style.css` 中修改。字幕支持暂停，并尊重系统减少动态效果设置。

## 本地预览

安装 Node.js 后执行 `npm run dev`，打开 http://127.0.0.1:4173 。执行 `npm run build` 检查脚本语法；站点源码已直接位于 `dist`，无需编译或安装依赖。

## 背景音乐
音乐文件为 dist/assets/stfu.mp3，使用原生音频循环播放。左侧 Logo 旁的扬声器按钮控制播放和关闭。浏览器若阻止有声自动播放，点击按钮即可开始。默认音量 35%，不预加载音频，不使用额外音频库。

