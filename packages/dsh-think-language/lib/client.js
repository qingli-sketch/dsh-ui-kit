window.__ModuleLoader__.load({
  id: "dsh-think-language",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    let react = require("react");

    const CSS = ".tlRoot{border-bottom:1px solid var(--dsw-alias-border-l2);display:flex;align-items:center;gap:8px;padding:16px 0;position:relative}.tlText{display:flex;flex-direction:column;flex:1;gap:4px;min-width:0;padding-right:48px}.tlTitle{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:400;line-height:22px}.tlHint{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}.tlSelector{background:var(--dsw-alias-bg-layer-1);height:36px;font:inherit;color:var(--dsw-alias-label-primary);cursor:pointer;border:1px solid var(--dsw-alias-border-l2);border-radius:18px;display:inline-flex;align-items:center;gap:12px;padding:0 14px;font-size:14px;line-height:22px}.tlSelector:hover{background:var(--dsw-alias-interactive-bg-hover)}.tlChevron{flex:none;font-size:10px}.tlMenu{position:fixed;z-index:30;min-width:210px;max-height:340px;overflow:auto;background:var(--dsw-alias-bg-overlay);border:1px solid var(--dsw-alias-border-l2);border-radius:10px;box-shadow:0 8px 24px rgb(0 0 0 / 14%);padding:4px}.tlItem{display:block;width:100%;text-align:left;background:transparent;border:0;border-radius:6px;color:var(--dsw-alias-label-primary);cursor:pointer;font:inherit;font-size:13px;line-height:20px;padding:6px 10px}.tlItem:hover{background:var(--dsw-alias-interactive-bg-hover)}.tlItemOn{color:var(--dsw-alias-brand-primary);font-weight:600}";
    if (typeof document !== "undefined" && document.querySelector('style[data-plugin-css="dsh-think-language"]') === null) {
      const tag = document.createElement("style");
      tag.dataset.pluginCss = "dsh-think-language";
      tag.textContent = CSS;
      document.head.appendChild(tag);
    }

    const LANGS = [
      { code: "zh-CN", label: "中文（简体）" },
      { code: "zh-TW", label: "中文（繁體）" },
      { code: "en", label: "English" },
      { code: "ja", label: "日本語" },
      { code: "ko", label: "한국어" },
      { code: "de", label: "Deutsch" },
      { code: "fr", label: "Français" },
      { code: "es", label: "Español" },
      { code: "pt", label: "Português" },
      { code: "it", label: "Italiano" },
      { code: "ru", label: "Русский" },
      { code: "ar", label: "العربية" },
      { code: "hi", label: "हिन्दी" },
      { code: "nl", label: "Nederlands" },
      { code: "pl", label: "Polski" },
      { code: "tr", label: "Türkçe" },
      { code: "vi", label: "Tiếng Việt" },
      { code: "th", label: "ไทย" },
      { code: "id", label: "Bahasa Indonesia" },
    ];

    async function getCode() {
      const response = await fetch("/think-lang", { method: "GET" });
      const data = await response.json();
      return typeof data === "object" && data !== null && typeof data.code === "string" ? data.code : "";
    }

    async function setCode(code) {
      const response = await fetch("/think-lang", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data && typeof data.error === "string" ? data.error : "save failed");
      return typeof data === "object" && data !== null && typeof data.code === "string" ? data.code : code;
    }

    function ThinkLanguageRow() {
      const [code, setLocalCode] = react.useState("");
      const [open, setOpen] = react.useState(false);
      const [menuStyle, setMenuStyle] = react.useState(null);
      const [error, setError] = react.useState("");

      react.useEffect(() => {
        let alive = true;
        getCode().then((value) => {
          if (alive && value !== "") setLocalCode(value);
        }).catch(() => {
          if (alive) setError("读取失败");
        });
        return () => { alive = false; };
      }, []);

      react.useEffect(() => {
        if (!open) return;
        function onDown(event) {
          const el = event.target;
          if (el instanceof Element && el.closest(".tlRoot") === null) setOpen(false);
        }
        document.addEventListener("mousedown", onDown);
        return () => document.removeEventListener("mousedown", onDown);
      }, [open]);

      const current = LANGS.find((item) => item.code === code);

      return react.createElement("div", { className: "tlRoot" },
        react.createElement("div", { className: "tlText" },
          react.createElement("div", { className: "tlTitle" }, "思考语言"),
          react.createElement("div", { className: "tlHint" }, error !== "" ? error : "Think 内容的默认语言，对所有会话生效")),
        react.createElement("button", {
          type: "button",
          className: "tlSelector",
          "aria-haspopup": "menu",
          "aria-expanded": open,
          onClick: (event) => {
            if (!open) {
              const rect = event.currentTarget.getBoundingClientRect();
              const right = document.documentElement.clientWidth - rect.right;
              setMenuStyle({ top: rect.bottom + 4, right });
            }
            setOpen((value) => !value);
          },
        },
          current === undefined ? "加载中…" : current.label,
          react.createElement("span", { className: "tlChevron" }, "▼")),
        open && react.createElement("div", { className: "tlMenu", role: "menu", style: menuStyle },
          LANGS.map((item) => react.createElement("button", {
            type: "button",
            role: "menuitem",
            key: item.code,
            className: "tlItem" + (item.code === code ? " tlItemOn" : ""),
            onClick: () => {
              setOpen(false);
              setError("");
              setCode(item.code).then((value) => setLocalCode(value)).catch(() => setError("保存失败"));
            },
          }, item.label))));
    }

    function apply(ctx) {
      const slots = ctx.get("slots");
      if (slots === undefined) return;
      slots.inject("settings.general.item", () => slots.register(
        { name: "settings.general.item", id: "think-language", order: 5 },
        () => react.createElement(ThinkLanguageRow),
      ));
    }

    exports.apply = apply;
    return module.exports;
  }
});
