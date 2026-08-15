window.__ModuleLoader__.load({
  id: "dsh-ui-custom",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    let react = require("react");

    const CSS = ".uwsp-set{display:flex;flex-direction:column;gap:14px;padding:6px 2px 24px;font-size:13px;color:var(--dsw-alias-label-primary);max-width:680px}.uwsp-set-row{display:flex;align-items:center;gap:10px}.uwsp-set-label{width:96px;flex:none;color:var(--dsw-alias-label-secondary)}.uwsp-set-val{flex:none;width:44px;text-align:right;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}.uwsp-set-hint{font-size:12px;color:var(--dsw-alias-label-tertiary);padding-left:106px}.uwsp-set-sub{font-size:12px;color:var(--dsw-alias-label-secondary);margin-bottom:6px}.uwsp-set-check{display:flex;align-items:center;gap:6px;color:var(--dsw-alias-label-secondary);cursor:pointer;user-select:none}.uwsp-input{flex:1;min-width:0;background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l2);border-radius:6px;padding:6px 9px;font-size:13px;color:var(--dsw-alias-label-primary);font-family:inherit}.uwsp-input:focus{outline:none;border-color:var(--dsw-alias-brand-primary)}.uwsp-apply{flex:none;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);border-radius:6px;padding:6px 12px;font-size:13px;cursor:pointer}.uwsp-apply:hover{background:var(--dsw-alias-interactive-bg-hover)}.uwsp-apply:disabled{opacity:.55;cursor:default}.uwsp-prev{width:100%;height:150px;object-fit:cover;border-radius:8px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);display:block}.uwsp-prev-empty{display:flex;align-items:center;justify-content:center;color:var(--dsw-alias-label-tertiary);font-size:12px}.uwsp-chips{display:flex;flex-wrap:wrap;gap:6px}.uwsp-chip{max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);border-radius:999px;padding:3px 10px;font-size:12px;cursor:pointer}.uwsp-chip:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}.uwsp-chip-on{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-brand-primary)}.uwsp-pick{display:flex;flex-direction:column;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;overflow:hidden;background:var(--dsw-alias-bg-layer-2)}.uwsp-pick-head{display:flex;align-items:center;gap:6px;padding:6px 8px;border-bottom:1px solid var(--dsw-alias-border-l2);flex-wrap:wrap}.uwsp-pick-path{flex:1;min-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;color:var(--dsw-alias-label-tertiary)}.uwsp-pick-list{max-height:240px;overflow:auto;padding:4px}.uwsp-pick-msg{padding:10px 12px;color:var(--dsw-alias-label-tertiary);font-size:12px}.uwsp-rootbtn{flex:none;border:1px solid transparent;background:transparent;color:var(--dsw-alias-label-secondary);border-radius:5px;padding:2px 8px;font-size:12px;cursor:pointer}.uwsp-rootbtn:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}.uwsp-rootbtn-on{color:var(--dsw-alias-brand-primary);border-color:var(--dsw-alias-brand-primary)}.uwsp-upbtn{flex:none;border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-secondary);border-radius:5px;padding:2px 8px;font-size:12px;cursor:pointer}.uwsp-upbtn:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}.uwsp-upbtn:disabled{opacity:.4;cursor:default}.uwsp-row{display:flex;align-items:center;gap:5px;padding:2px 8px;border-radius:5px;font-size:13px;line-height:22px;cursor:pointer;user-select:none;color:var(--dsw-alias-label-primary)}.uwsp-row:hover{background:var(--dsw-alias-interactive-bg-hover)}.uwsp-ic{flex:none;font-size:13px}.uwsp-name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.uwsp-err{color:var(--dsw-alias-state-error-primary);font-size:12px;line-height:18px;padding:2px 8px}";
    if (typeof document !== "undefined" && document.querySelector('style[data-plugin-css="dsh-ui-custom"]') === null) {
      const tag = document.createElement("style");
      tag.dataset.pluginCss = "dsh-ui-custom";
      tag.textContent = CSS;
      document.head.appendChild(tag);
    }

    function apply(ctx) {
      const slots = ctx.get("slots");
      if (slots === undefined) return;
      const theme = ctx.get("theme");

      // ---------- background store (persisted) ----------
      const store = { enabled: true, path: "", opacity: 30, ratio: "cover", recent: [], loading: false, error: null };
      const listeners = new Set();
      const setStore = (patch) => {
        Object.assign(store, patch);
        listeners.forEach((f) => { try { f(); } catch (e) {} });
      };
      const useStore = () => {
        const [, force] = react.useState(0);
        react.useEffect(() => {
          const f = () => force((x) => x + 1);
          listeners.add(f);
          return () => { listeners.delete(f); };
        }, []);
        return store;
      };

      function persistSettings() {
        fetch("/uwsp-api/settings", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ enabled: store.enabled, path: store.path, opacity: store.opacity, ratio: store.ratio, recent: store.recent }),
        }).catch(() => {});
      }

      function imageUrl(path) {
        const p = typeof path === "string" ? path : "";
        return "/uwsp-api/image" + (p !== "" ? "?path=" + encodeURIComponent(p) : "");
      }

      function loadImage(path) {
        const p = typeof path === "string" ? path : "";
        setStore({ loading: true, error: null });
        fetch(imageUrl(p)).then(async (res) => {
          if (res.ok) {
            const recent = [p].concat(store.recent.filter((r) => r !== p)).slice(0, 6);
            setStore({ path: p, recent, loading: false, error: null });
            applyAll();
            persistSettings();
          } else {
            const err = await res.json().catch(() => null);
            setStore({ loading: false, error: err && err.error ? String(err.error) : ("加载失败 " + res.status) });
          }
        }).catch((err) => {
          setStore({ loading: false, error: String((err && err.message) || err) });
        });
      }

      // ---------- wallpaper application ----------
      function applyTokens() {
        if (theme === undefined || typeof theme.overrideTokens !== "function") return;
        const a = store.enabled ? Math.max(0.05, Math.min(0.96, 1 - (store.opacity / 100) * 0.9)) : 1;
        const as = Math.max(0.04, a - 0.1);
        theme.overrideTokens("dsh-ui-custom", {
          "--dsw-alias-bg-base": { light: "rgba(255,255,255," + a + ")", dark: "rgba(21,21,23," + a + ")" },
          "--dsw-alias-bg-layer-1": { light: "rgba(255,255,255," + a + ")", dark: "rgba(44,44,46," + a + ")" },
          "--dsw-alias-bg-layer-2": { light: "rgba(255,255,255," + a + ")", dark: "rgba(43,43,44," + a + ")" },
          "--dsw-alias-bg-overlay": { light: "rgba(233,236,242,0.96)", dark: "rgba(97,102,105,0.96)" },
          "--dsw-specific-sidebar-fill": { light: "rgba(249,250,251," + as + ")", dark: "rgba(27,27,28," + as + ")" },
        });
      }

      function ensureBgStyle() {
        if (typeof document === "undefined") return null;
        let el = document.querySelector('style[data-plugin-css="dsh-ui-custom-bg"]');
        if (el === null) {
          el = document.createElement("style");
          el.dataset.pluginCss = "dsh-ui-custom-bg";
          document.head.appendChild(el);
        }
        return el;
      }

      function applyBgCss() {
        const el = ensureBgStyle();
        if (el === null) return;
        if (!store.enabled) {
          el.textContent = "";
          return;
        }
        let size = "cover";
        if (store.ratio === "contain") size = "contain";
        else if (store.ratio === "fill") size = "100% 100%";
        else if (store.ratio === "auto") size = "auto";
        const url = imageUrl(store.path);
        el.textContent =
          'html{background-color:var(--dsw-alias-bg-base);background-image:url("' + url + '");background-size:' + size +
          ';background-position:center;background-repeat:no-repeat;background-attachment:fixed}' +
          'body{background-color:transparent;background-image:url("' + url + '");background-size:' + size +
          ';background-position:center;background-repeat:no-repeat;background-attachment:fixed}';
      }

      function applyAll() {
        applyTokens();
        applyBgCss();
      }
      listeners.add(applyAll);

      // ---------- helpers ----------
      function sortEntries(list) {
        return list.slice().sort((a, b) => {
          const ad = a.type === "directory" ? 0 : 1;
          const bd = b.type === "directory" ? 0 : 1;
          if (ad !== bd) return ad - bd;
          return String(a.name).localeCompare(String(b.name));
        });
      }
      function parentOf(p) {
        if (typeof p !== "string" || p === "") return null;
        const n = p.replace(/[\\/]+$/, "");
        if (/^[A-Za-z]:$/.test(n)) return null;
        const idx = Math.max(n.lastIndexOf("\\"), n.lastIndexOf("/"));
        if (idx < 0) return null;
        const up = n.slice(0, idx);
        if (up === "") return null;
        if (/^[A-Za-z]:$/.test(up)) return up + "/";
        return up;
      }
      function isImageName(name) {
        return /\.(jpe?g|png|webp|gif|bmp|svg)$/i.test(String(name || ""));
      }
      function fetchJson(url) {
        return fetch(url).then((res) => res.json());
      }

      // ---------- settings: directory image picker ----------
      function ImagePicker(props) {
        const wsItems = props.useWorkspaces ? props.useWorkspaces((s) => (s && Array.isArray(s.items) ? s.items : [])) : [];
        const [roots, setRoots] = react.useState(() => {
          const rs = [];
          wsItems.forEach((w) => { if (w && typeof w.path === "string") rs.push({ label: w.title || w.path, path: w.path }); });
          return rs;
        });
        const [path, setPath] = react.useState(null);
        const [entries, setEntries] = react.useState(null);
        const [error, setError] = react.useState(null);

        react.useEffect(() => {
          let dead = false;
          fetchJson("/uwsp-api/roots").then((res) => {
            if (dead || !(res && res.ok)) return;
            const rs = [];
            if (typeof res.home === "string" && res.home !== "") rs.push({ label: "主目录", path: res.home });
            if (typeof res.wsRoot === "string" && res.wsRoot !== "") rs.push({ label: "工作区", path: res.wsRoot });
            (res.workspaces || []).forEach((w) => { if (w && typeof w.path === "string" && w.path !== "") rs.push({ label: w.title || w.path, path: w.path }); });
            wsItems.forEach((w) => { if (w && typeof w.path === "string") rs.push({ label: w.title || w.path, path: w.path }); });
            const seen = {};
            const uniq = rs.filter((r) => { if (seen[r.path]) return false; seen[r.path] = true; return true; });
            setRoots(uniq);
            setPath((prev) => prev || (uniq.length > 0 ? uniq[0].path : null));
          }).catch(() => {});
          return () => { dead = true; };
        }, []);

        react.useEffect(() => {
          if (typeof path !== "string" || path === "") return;
          let dead = false;
          setEntries(null);
          setError(null);
          fetchJson("/uwsp-api/list-dir?path=" + encodeURIComponent(path)).then((res) => {
            if (dead) return;
            if (res && res.ok) setEntries(res.entries || []);
            else setError(res && res.error ? String(res.error) : "读取失败");
          }).catch((err) => {
            if (!dead) setError(String((err && err.message) || err));
          });
          return () => { dead = true; };
        }, [path]);

        const up = parentOf(path);
        const rows = [];
        if (error !== null) {
          rows.push(react.createElement("div", { className: "uwsp-pick-msg", key: "err" }, error));
        } else if (entries === null) {
          rows.push(react.createElement("div", { className: "uwsp-pick-msg", key: "loading" }, "加载中…"));
        } else {
          const dirs = sortEntries(entries.filter((e) => e.type === "directory"));
          const imgs = sortEntries(entries.filter((e) => e.type !== "directory" && isImageName(e.name)));
          dirs.forEach((d) => rows.push(react.createElement("div", {
            key: d.path, className: "uwsp-row",
            onClick: () => setPath(d.path),
          },
            react.createElement("span", { className: "uwsp-ic" }, "📁"),
            react.createElement("span", { className: "uwsp-name", title: d.path }, d.name))));
          imgs.forEach((f) => rows.push(react.createElement("div", {
            key: f.path, className: "uwsp-row",
            onClick: () => props.onPick(f.path),
          },
            react.createElement("span", { className: "uwsp-ic" }, "🖼️"),
            react.createElement("span", { className: "uwsp-name", title: f.path }, f.name))));
          if (rows.length === 0) rows.push(react.createElement("div", { className: "uwsp-pick-msg", key: "none" }, "此文件夹中没有图片（点击 📁 进入子目录）。"));
        }

        return react.createElement("div", { className: "uwsp-pick" },
          react.createElement("div", { className: "uwsp-pick-head" },
            roots.map((r) => react.createElement("button", {
              type: "button", key: r.path,
              className: "uwsp-rootbtn" + (path === r.path ? " uwsp-rootbtn-on" : ""),
              onClick: () => setPath(r.path),
            }, r.label)),
            react.createElement("button", {
              type: "button", className: "uwsp-upbtn", disabled: up === null,
              onClick: () => { if (up !== null) setPath(up); },
            }, "⬆ 上级"),
            react.createElement("span", { className: "uwsp-pick-path", title: path || "" }, path || "选择目录")),
          react.createElement("div", { className: "uwsp-pick-list" }, rows));
      }

      // ---------- settings: background page ----------
      function BgSettings(props) {
        const bg = useStore();
        const [draftPath, setDraftPath] = react.useState(bg.path || "");
        react.useEffect(() => { setDraftPath(bg.path || ""); }, [bg.path]);

        const slotProps = props.slotProps || {};
        const preview = react.createElement("img", { className: "uwsp-prev", src: imageUrl(bg.path), alt: "背景预览" });

        return react.createElement("div", { className: "uwsp-set" },
          react.createElement("div", { className: "uwsp-set-row" },
            react.createElement("span", { className: "uwsp-set-label" }, "背景图片"),
            react.createElement("label", { className: "uwsp-set-check" },
              react.createElement("input", {
                type: "checkbox",
                checked: bg.enabled,
                onChange: (e) => { setStore({ enabled: e.target.checked }); applyAll(); persistSettings(); },
              }),
              "启用壁纸")),
          preview,
          bg.error ? react.createElement("div", { className: "uwsp-err" }, String(bg.error)) : null,
          react.createElement("div", { className: "uwsp-set-row" },
            react.createElement("span", { className: "uwsp-set-label" }, "图片路径"),
            react.createElement("input", {
              type: "text", className: "uwsp-input",
              placeholder: "绝对路径，如 C:\\Users\\you\\Pictures\\a.jpg",
              value: draftPath,
              onChange: (e) => setDraftPath(e.target.value),
              onKeyDown: (e) => { if (e.key === "Enter") loadImage(String(draftPath).trim()); },
            }),
            react.createElement("button", {
              type: "button", className: "uwsp-apply", disabled: bg.loading,
              onClick: () => loadImage(String(draftPath).trim()),
            }, bg.loading ? "加载中…" : "应用")),
          bg.recent.length > 0 ? react.createElement("div", null,
            react.createElement("div", { className: "uwsp-set-sub" }, "最近使用"),
            react.createElement("div", { className: "uwsp-chips" },
              bg.recent.map((p) => react.createElement("button", {
                type: "button", key: p, title: p,
                className: "uwsp-chip" + (p === bg.path ? " uwsp-chip-on" : ""),
                onClick: () => loadImage(p),
              }, String(p).split(/[\\/]/).pop())))) : null,
          react.createElement("div", null,
            react.createElement("div", { className: "uwsp-set-sub" }, "从目录选择（点图片即应用）"),
            react.createElement(ImagePicker, { useWorkspaces: slotProps.useWorkspaces, onPick: (p) => loadImage(p) })),
          react.createElement("div", { className: "uwsp-set-row" },
            react.createElement("span", { className: "uwsp-set-label" }, "背景透明度"),
            react.createElement("input", {
              type: "range", min: 0, max: 100, step: 1, value: bg.opacity,
              onChange: (e) => { setStore({ opacity: Number(e.target.value) }); applyAll(); persistSettings(); },
            }),
            react.createElement("span", { className: "uwsp-set-val" }, bg.opacity + "%")),
          react.createElement("div", { className: "uwsp-set-hint" }, "数值越大界面越透明，壁纸显示越清晰；0% 时界面恢复完全不透明。"),
          react.createElement("div", { className: "uwsp-set-row" },
            react.createElement("span", { className: "uwsp-set-label" }, "背景比例"),
            react.createElement("select", { className: "uwsp-input", value: bg.ratio, onChange: (e) => { setStore({ ratio: e.target.value }); applyAll(); persistSettings(); } },
              react.createElement("option", { value: "cover" }, "自动填充（cover，默认）"),
              react.createElement("option", { value: "contain" }, "完整显示（contain）"),
              react.createElement("option", { value: "fill" }, "拉伸铺满（100% × 100%）"),
              react.createElement("option", { value: "auto" }, "原始尺寸"))),
          react.createElement("div", { className: "uwsp-set-row" },
            react.createElement("span", { className: "uwsp-set-label" }, " "),
            react.createElement("button", {
              type: "button", className: "uwsp-apply",
              onClick: () => { setStore({ enabled: true, opacity: 30, ratio: "cover" }); loadImage(""); },
            }, "恢复默认壁纸")));
      }

      // ---------- initial restore ----------
      fetch("/uwsp-api/settings").then((res) => res.json()).then((data) => {
        if (data && typeof data === "object") {
          setStore({
            enabled: data.enabled !== false,
            path: typeof data.path === "string" ? data.path : "",
            opacity: typeof data.opacity === "number" ? data.opacity : 30,
            ratio: typeof data.ratio === "string" ? data.ratio : "cover",
            recent: Array.isArray(data.recent) ? data.recent : [],
          });
        }
        applyAll();
      }).catch(() => applyAll());

      // ---------- registrations ----------
      slots.inject("settings.section", () => slots.register(
        { name: "settings.section", id: "uwsp-background", order: 25, label: () => "背景" },
        (props) => react.createElement(BgSettings, { slotProps: props })));
    }

    exports.apply = apply;
    return module.exports;
  }
});
