# DSH UI Kit

一套面向 [DeepSeek Harness](https://www.npmjs.com/package/@deepseek-ai/dsh) Web 界面的本地 UI 增强插件集。

所有功能都是**纯本地**的：不依赖任何云服务，插件以 npm 包形式挂载在宿主组合（host composition）的 patch 层中，跟随 `dsh web` 启动自动加载，重启不失效。

## 功能一览

### 🖼️ dsh-ui-custom — 壁纸背景

- **全屏壁纸背景**：任意 jpg / jpeg / png / webp / gif / bmp / svg 图片，界面呈半透明毛玻璃效果，深浅色主题均适配；
- **设置 → 背景** 页面：
  - 路径输入 + 内置目录浏览器（主目录 / 工作区快捷入口、`⬆ 上级`、点击图片即应用）；
  - 最近使用记录（最多 6 张）；
  - **背景透明度**滑块 0–100%（数值越大界面越透明、壁纸越清晰）；
  - **背景比例**：自动填充（cover）/ 完整显示（contain）/ 拉伸铺满 / 原始尺寸；
  - 启用开关与「恢复默认壁纸」；
  - 所有设置持久化到 `$DSH_HOME/uwsp-settings.json`，重启保留。

### 🌐 dsh-think-language — 思考语言设置

- 在 **设置 → 常规** 中新增「思考语言」下拉项（19 种语言）；
- 选择结果写入用户全局指令文件 `$DSH_HOME/AGENTS.md` 的受管指令块中，对**所有会话**生效，重启后依然存在。

## 目录结构

```
dsh-ui-kit/
├── README.md                     # 本文件
├── cordis.patch.example.yml      # 挂载配置示例
└── packages/
    ├── dsh-ui-custom/            # 壁纸背景
    │   ├── package.json
    │   ├── lib/index.js          # Host 半（HTTP 路由 + 设置持久化）
    │   └── lib/client.js         # Client 半（UI 渲染，__ModuleLoader__ 格式）
    └── dsh-think-language/       # 思考语言设置行
        ├── package.json
        ├── lib/index.js          # Host 半（/think-lang 路由 + AGENTS.md 写入）
        └── lib/client.js         # Client 半（设置行 UI）
```

## 要求

- [DeepSeek Harness](https://www.npmjs.com/package/@deepseek-ai/dsh)（在 `0.1.0-rc.6` 上开发验证；需要 `cordis.patch.yml` patch 层与 `window.__ModuleLoader__` 客户端插件机制）；
- 本地部署模式（`dsh web`，默认 http://127.0.0.1:3080）。

## 安装

1. **复制插件包** 到 `$DSH_HOME/node_modules/`（Windows 默认 `C:\Users\<你>\.dsh\node_modules`）：

   ```powershell
   Copy-Item -Recurse packages\dsh-ui-custom   "$env:USERPROFILE\.dsh\node_modules\dsh-ui-custom"
   Copy-Item -Recurse packages\dsh-think-language "$env:USERPROFILE\.dsh\node_modules\dsh-think-language"
   ```

2. **挂载插件**：编辑 `$DSH_HOME/cordis.patch.yml`，在 `insert` 列表中加入（参考仓库里的 `cordis.patch.example.yml`）：

   ```yaml
   - insert:
       - id: think-language
         name: 'dsh-think-language'
       - id: ui-custom
         name: 'dsh-ui-custom'
   ```

3. **重启** `dsh web` 并刷新页面。之后应看到：设置中出现「背景」「思考语言」两个入口，壁纸自动生效。

## 默认壁纸

`dsh-ui-custom` 在没有手动选择图片时按以下顺序查找默认壁纸：

1. 设置里选择过的路径（`$DSH_HOME/uwsp-settings.json`）；
2. `$DSH_HOME/ui-background.jpg`；
3. 环境变量 `DSH_UI_DEFAULT_IMAGE` 中分号分隔的额外候选路径（可选）。

建议直接把壁纸命名为 `ui-background.jpg` 放进 `$DSH_HOME`。

## 与宿主通信的 HTTP 路由

两个插件都通过 `webServer` 服务注册本地路由，随插件卸载自动注销（仅绑定本机回环地址的 `dsh web`）：

| 路由 | 方法 | 说明 |
| --- | --- | --- |
| `/uwsp-api/image?path=…` | GET | 输出壁纸图片字节（`path` 缺省时按默认壁纸顺序解析） |
| `/uwsp-api/list-dir?path=…` | GET | 列出一层目录（设置页选图浏览器用，JSON：`{ok, path, entries}`） |
| `/uwsp-api/roots` | GET | 选图浏览器的起始目录（主目录 / `$DSH_HOME` / 已注册工作区） |
| `/uwsp-api/settings` | GET / POST | 壁纸设置的读写（持久化到 `uwsp-settings.json`） |
| `/think-lang` | GET / POST | 思考语言设置的读写（写入 `AGENTS.md` 受管块） |

## 常见问题

**重启后壁纸/设置没了？**
检查 `cordis.patch.yml` 是否包含上面两行、包是否真的位于 `$DSH_HOME/node_modules/` 下（包名必须与目录名一致），然后重启 `dsh web`。

**图片加载失败？**
仅支持 jpg / jpeg / png / webp / gif / bmp / svg，且单张不超过 25MB；目录浏览中只列出这些类型。错误原因会显示在设置页。

**透明度调到 100% 文字看不清？**
「背景透明度」控制的是界面层的透明程度，建议 20–50% 区间；调到 0% 界面恢复完全不透明。

**如何卸载？**
从 `cordis.patch.yml` 移除对应行、删除 `node_modules` 里的包目录（可选删除 `$DSH_HOME/uwsp-settings.json`），重启即可。

## 开发说明

- Host 半是标准 Cordis ESM 插件（`export default { name, inject, apply }`），在完整 Node 环境中运行，可直接使用 `node:fs` 等内建模块；
- Client 半是 `window.__ModuleLoader__.load({ id, factory })` 格式的浏览器模块，`factory(require)` 内可 `require("react")`，通过 `exports.apply = apply(ctx)` 挂入 Cordis Client 上下文；
- UI 全部经由 Slot 系统注入（`settings.section`、`settings.general.item`），颜色一律使用 `--dsw-*` 主题变量，自动适配浅色/深色主题；
- 两个包相互独立，可单独安装使用。
