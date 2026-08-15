/**
 * dsh-think-language — Host half.
 *
 * Owns the durable think-language preference: the user-global instruction
 * file `$DSH_HOME/AGENTS.md` carries one managed block with the chosen
 * language, which every preset-mounted `agent-instructions` plugin injects
 * into each session. This half serves the read/write face to the browser
 * over a small HTTP route (the Client half renders the Settings row).
 *
 * The file is written with plain node:fs (same-directory temp + atomic
 * rename) on purpose: the sandboxed `fs` service's atomic replace copies the
 * Windows DACL via SetFileSecurityW, which the process sandbox denies.
 */
import { readFile, writeFile, rename, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { homedir } from 'node:os'

const DSH_HOME = process.env.DSH_HOME || join(homedir(), '.dsh')
const AGENTS_PATH = join(DSH_HOME, 'AGENTS.md')

const NAMES = {
  'zh-CN': 'Simplified Chinese',
  'zh-TW': 'Traditional Chinese',
  'en': 'English',
  'ja': 'Japanese',
  'ko': 'Korean',
  'de': 'German',
  'fr': 'French',
  'es': 'Spanish',
  'pt': 'Portuguese',
  'it': 'Italian',
  'ru': 'Russian',
  'ar': 'Arabic',
  'hi': 'Hindi',
  'nl': 'Dutch',
  'pl': 'Polish',
  'tr': 'Turkish',
  'vi': 'Vietnamese',
  'th': 'Thai',
  'id': 'Indonesian',
}

const BLOCK = /<!-- dsh-think-language: ([a-zA-Z-]+) -->[\s\S]*?<!-- \/dsh-think-language -->/

function blockFor(code) {
  const name = NAMES[code]
  return '<!-- dsh-think-language: ' + code + ' -->\n' +
    'Think language preference (user setting): ' + name + '. Always write your thinking content — the reasoning shown to the user as "Think" content — in ' + name + ' for every request, even when the user writes in another language. If the user explicitly asks you to think in a different language for a particular request, follow that request.\n' +
    '<!-- /dsh-think-language -->'
}

async function readAgents() {
  try {
    return await readFile(AGENTS_PATH, 'utf8')
  } catch {
    return ''
  }
}

async function writeAgents(content) {
  const temp = `${AGENTS_PATH}.tmp-${process.pid}-${Date.now()}`
  await writeFile(temp, content, 'utf8')
  try {
    await rename(temp, AGENTS_PATH)
  } catch (error) {
    await rm(temp, { force: true }).catch(() => {})
    throw error
  }
}

async function ensureDefault() {
  const content = await readAgents()
  if (content.includes('dsh-think-language:')) return
  const block = blockFor('zh-CN')
  await writeAgents(content.trim() === '' ? block + '\n' : block + '\n\n' + content)
}

export default {
  name: 'think-language',
  inject: ['webServer'],
  apply(ctx) {
    function sendJson(res, status, payload) {
      res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' })
      res.end(JSON.stringify(payload))
    }

    ctx.effect(() => ctx.webServer.register({
      kind: 'prefix',
      path: '/think-lang',
      handler: async (req, res) => {
        try {
          if (req.method === 'GET') {
            await ensureDefault()
            const content = await readAgents()
            const match = content.match(BLOCK)
            sendJson(res, 200, { code: match === null ? 'zh-CN' : match[1] })
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
            const code = parsed !== null && typeof parsed === 'object' ? parsed.code : ''
            if (typeof code !== 'string' || !Object.prototype.hasOwnProperty.call(NAMES, code)) {
              sendJson(res, 400, { error: 'unknown think language code' })
              return
            }
            const content = await readAgents()
            const block = blockFor(code)
            const next = BLOCK.test(content)
              ? content.replace(BLOCK, block)
              : (content.trim() === '' ? block + '\n' : block + '\n\n' + content)
            await writeAgents(next)
            sendJson(res, 200, { code })
            return
          }
          sendJson(res, 405, { error: 'method not allowed' })
        } catch (error) {
          sendJson(res, 500, { error: error instanceof Error ? error.message : String(error) })
        }
      },
    }), 'think-language: /think-lang route')

    void ensureDefault().catch((error) => console.error('[think-language] init failed:', String(error)))
  },
}
