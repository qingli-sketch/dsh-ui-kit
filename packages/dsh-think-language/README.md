# dsh-think-language

DeepSeek Harness Web UI 插件：在 **设置 → 常规** 中新增「思考语言」下拉项。

- 19 种语言可选（简体/繁体中文、英、日、韩、德、法、西、葡、意、俄、阿、印、荷、波、土、越、泰、印尼）；
- 选择结果以受管指令块（`<!-- dsh-think-language: … -->`）写入 `$DSH_HOME/AGENTS.md`，对所有会话生效，重启后保留；
- Host 半通过 `/think-lang` 路由（GET 读取 / POST 写入）与 Client 半通信。

安装与配置见仓库根目录 [README](../README.md)。
