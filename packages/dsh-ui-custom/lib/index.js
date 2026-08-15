/**
 * dsh-ui-custom — Host half.
 *
 * 为 Web UI 提供三件事：
 *  1. /uwsp-api/image     —— 输出壁纸图片字节（供 CSS 背景与预览图引用）
 *  2. /uwsp-api/list-dir  —— 列目录（设置页选图 + 工作区文件树共用）
 *  3. /uwsp-api/settings  —— 壁纸设置的读写，持久化到 $DSH_HOME/uwsp-settings.json
 * 以及 /uwsp-api/roots —— 选图浏览器的起始目录（主目录 / 工作区 / 已注册工作区）。
 *
 * 直接使用 node:fs 读写本地文件（与 dsh-think-language 相同的模式），
 * 所有路由挂在 webServer 的 /uwsp-api 前缀下，服务随插件停止自动注销。
 */
import { readFile, readdir, stat, writeFile, rename, rm } from 'node:fs/promises'
import { join, extname } from 'node:path'
import { homedir } from 'node:os'

const DSH_HOME = process.env.DSH_HOME || join(homedir(), '.dsh')
const SETTINGS_PATH = join(DSH_HOME, 'uwsp-settings.json')
const DEFAULT_IMAGE = join(DSH_HOME, 'ui-background.jpg')
const LEGACY_DESKTOP_IMAGE = 'C:\\Users\\qingli\\Desktop\\3bf9622e4da44c1b18e63445951ca5a.jpg'

const MIME = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.bmp': 'image/bmp',
  '.svg': 'image/svg+xml',
}
const RATIOS = ['cover', 'contain', 'fill', 'auto']
const MAX_IMAGE_BYTES = 25 * 1024 * 1024
const MAX_LIST_ENTRIES = 2000

const DEFAULT_SETTINGS = {
  enabled: true,
  path: '',
  opacity: 30,
  ratio: 'cover',
  recent: [],
}

async function readSettings() {
  try {
    const raw = await readFile(SETTINGS_PATH, 'utf8')
    const parsed = JSON.parse(raw)
    return {
      enabled: parsed.enabled !== false,
      path: typeof parsed.path === 'string' ? parsed.path : '',
      opacity: typeof parsed.opacity === 'number' && parsed.opacity >= 0 && parsed.opacity <= 100
        ? Math.round(parsed.opacity) : 30,
      ratio: RATIOS.includes(parsed.ratio) ? parsed.ratio : 'cover',
      recent: Array.isArray(parsed.recent)
        ? parsed.recent.filter((p) => typeof p === 'string' && p !== '').slice(0, 6) : [],
    }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

async function writeSettings(next) {
  const temp = SETTINGS_PATH + '.tmp-' + process.pid + '-' + Date.now()
  await writeFile(temp, JSON.stringify(next, null, 2), 'utf8')
  try {
    await rename(temp, SETTINGS_PATH)
  } catch (error) {
    await rm(temp, { force: true }).catch(() => {})
    throw error
  }
}

async function validateImagePath(p) {
  const ext = extname(p).toLowerCase()
  if (MIME[ext] === undefined) {
    return { ok: false, error: '不支持的类型（仅 jpg/jpeg/png/webp/gif/bmp/svg）：' + p }
  }
  try {
    const s = await stat(p)
    if (!s.isFile()) return { ok: false, error: '不是文件：' + p }
    if (s.size > MAX_IMAGE_BYTES) return { ok: false, error: '图片超过 25MB：' + p }
    return { ok: true, size: s.size }
  } catch (error) {
    return { ok: false, error: '读取失败：' + (error && error.message ? error.message : String(error)) }
  }
}

async function listDirectory(p) {
  const names = await readdir(p)
  const entries = []
  for (const name of names) {
    if (entries.length >= MAX_LIST_ENTRIES) break
    const full = join(p, name)
    let type = 'file'
    let size = null
    try {
      const s = await stat(full)
      if (s.isDirectory()) {
        type = 'directory'
      } else if (s.isFile()) {
        type = 'file'
        size = s.size
      } else {
        type = 'other'
      }
    } catch {
      continue
    }
    entries.push({ name, path: full, type, size, hidden: name.startsWith('.') })
  }
  return entries
}

export default {
  name: 'ui-custom',
  inject: ['webServer'],
  apply(ctx) {
    function sendJson(res, status, payload) {
      res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' })
      res.end(JSON.stringify(payload))
    }

    async function handler(req, res) {
      try {
        const url = new URL(req.url, 'http://127.0.0.1')
        const pathname = url.pathname
        const query = url.searchParams

        // ---------- 壁纸图片 ----------
        if (pathname === '/uwsp-api/image' && req.method === 'GET') {
          const want = query.get('path') || ''
          const settings = await readSettings()
          const candidates = want !== ''
            ? [want]
            : [settings.path, DEFAULT_IMAGE, LEGACY_DESKTOP_IMAGE].filter((p) => p !== '')
          let served = null
          for (const p of candidates) {
            try {
              const mime = MIME[extname(p).toLowerCase()]
              if (mime === undefined) continue
              const s = await stat(p)
              if (!s.isFile() || s.size > MAX_IMAGE_BYTES) continue
              const buf = await readFile(p)
              served = { mime, buf }
              break
            } catch {
              // 尝试下一个候选
            }
          }
          if (served === null) {
            sendJson(res, 404, { ok: false, error: '图片不存在或不可读：' + (want !== '' ? want : '默认图片') })
            return
          }
          res.writeHead(200, {
            'content-type': served.mime,
            'content-length': served.buf.length,
            'cache-control': 'private, max-age=3600',
          })
          res.end(served.buf)
          return
        }

        // ---------- 列目录 ----------
        if (pathname === '/uwsp-api/list-dir' && req.method === 'GET') {
          const p = query.get('path') || ''
          if (p === '') {
            sendJson(res, 400, { ok: false, error: 'empty path' })
            return
          }
          try {
            const entries = await listDirectory(p)
            sendJson(res, 200, { ok: true, path: p, entries })
          } catch (error) {
            sendJson(res, 200, { ok: false, error: error && error.message ? error.message : String(error) })
          }
          return
        }

        // ---------- 选图起始目录 ----------
        if (pathname === '/uwsp-api/roots' && req.method === 'GET') {
          const workspaces = []
          try {
            const reg = ctx.get('workspaceRegistry')
            if (reg !== undefined && typeof reg.list === 'function') {
              const list = await reg.list()
              for (const w of list || []) {
                if (w && typeof w.path === 'string' && w.path !== '') {
                  workspaces.push({ title: w.title || w.path, path: w.path })
                }
              }
            }
          } catch {
            // 注册表不可用时忽略
          }
          sendJson(res, 200, { ok: true, wsRoot: DSH_HOME, home: homedir(), workspaces })
          return
        }

        // ---------- 设置读写 ----------
        if (pathname === '/uwsp-api/settings') {
          if (req.method === 'GET') {
            sendJson(res, 200, await readSettings())
            return
          }
          if (req.method === 'POST') {
            let body = ''
            for await (const chunk of req) body += String(chunk)
            let parsed = null
            try {
              parsed = JSON.parse(body)
            } catch {
              parsed = null
            }
            if (parsed === null || typeof parsed !== 'object') {
              sendJson(res, 400, { error: 'invalid json body' })
              return
            }
            const current = await readSettings()
            const next = { ...current }
            if (typeof parsed.enabled === 'boolean') next.enabled = parsed.enabled
            if (typeof parsed.opacity === 'number' && parsed.opacity >= 0 && parsed.opacity <= 100) {
              next.opacity = Math.round(parsed.opacity)
            }
            if (RATIOS.includes(parsed.ratio)) next.ratio = parsed.ratio
            if (Array.isArray(parsed.recent)) {
              next.recent = parsed.recent.filter((p) => typeof p === 'string' && p !== '').slice(0, 6)
            }
            if (typeof parsed.path === 'string') {
              const want = parsed.path
              if (want === '') {
                next.path = ''
              } else {
                const check = await validateImagePath(want)
                if (!check.ok) {
                  sendJson(res, 400, { error: check.error })
                  return
                }
                next.path = want
                next.recent = [want].concat(next.recent.filter((p) => p !== want)).slice(0, 6)
              }
            }
            await writeSettings(next)
            sendJson(res, 200, next)
            return
          }
          sendJson(res, 405, { error: 'method not allowed' })
          return
        }

        sendJson(res, 404, { error: 'not found' })
      } catch (error) {
        sendJson(res, 500, { error: error && error.message ? error.message : String(error) })
      }
    }

    ctx.effect(() => ctx.webServer.register({
      kind: 'prefix',
      path: '/uwsp-api',
      handler,
    }), 'ui-custom: /uwsp-api routes')
  },
}
