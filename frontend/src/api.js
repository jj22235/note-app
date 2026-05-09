const TOKEN_KEY = 'note_app_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function saveToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

function buildUrl(path) {
  const base = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '')
  return base ? `${base}${path}` : path
}

function formatError(data, status) {
  const d = data?.detail
  if (typeof d === 'string') return d
  if (Array.isArray(d)) return d.map((x) => x.msg || JSON.stringify(x)).join('；')
  if (d && typeof d === 'object') return JSON.stringify(d)
  return `请求失败 (${status})`
}

export async function api(path, options = {}) {
  const url = buildUrl(path)
  const headers = { ...(options.headers || {}) }

  const isJsonBody =
    options.body &&
    typeof options.body === 'string' &&
    !headers['Content-Type'] &&
    !headers['content-type']
  if (isJsonBody) headers['Content-Type'] = 'application/json'

  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(url, { ...options, headers })
  const text = await res.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }

  if (res.status === 401) {
    saveToken(null)
    const err = new Error(formatError(data, res.status))
    err.code = 'UNAUTHORIZED'
    throw err
  }

  if (!res.ok) {
    throw new Error(formatError(data, res.status))
  }

  return data
}
