# dsh-ui-custom

DeepSeek Harness Web UI 定制插件：**全屏壁纸背景**。

- 设置 → 背景：任意切换图片（路径输入 / 目录浏览 / 最近使用）、背景透明度滑块、背景比例（cover / contain / 拉伸 / 原始），设置持久化到 `$DSH_HOME/uwsp-settings.json`；
- 界面呈半透明毛玻璃效果，深浅色主题自适应。

安装与配置见仓库根目录 [README](../README.md)。

## 路由

| 路由 | 说明 |
| --- | --- |
| `GET /uwsp-api/image?path=…` | 壁纸图片字节（缺省 `path` 时按默认壁纸顺序解析） |
| `GET /uwsp-api/list-dir?path=…` | 一层目录列表（设置页选图浏览器用） |
| `GET /uwsp-api/roots` | 选图起始目录（主目录 / `$DSH_HOME` / 已注册工作区） |
| `GET/POST /uwsp-api/settings` | 设置读写 |

## 默认壁纸顺序

1. `uwsp-settings.json` 中选择过的路径 → 2. `$DSH_HOME/ui-background.jpg` → 3. 环境变量 `DSH_UI_DEFAULT_IMAGE`（分号分隔）。
