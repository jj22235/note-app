import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, StickyNote } from 'lucide-react'
import { api } from '../api'

const inputClass =
  'w-full rounded-[14px] border border-slate-200/90 bg-white px-4 py-2.5 text-[15px] text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#4A90E2]/60 focus:ring-4 focus:ring-[#4A90E2]/12'

export default function NoteEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [originalTitle, setOriginalTitle] = useState('')
  const [originalContent, setOriginalContent] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const loadNote = useCallback(async () => {
    setError('')
    setLoading(true)
    try {
      const data = await api(`/api/notes/${id}`)
      setTitle(data.title || '')
      setContent(data.content || '')
      setOriginalTitle(data.title || '')
      setOriginalContent(data.content || '')
    } catch (e) {
      if (e.code === 'UNAUTHORIZED') {
        navigate('/login', { replace: true })
        return
      }
      setError(e.message || String(e))
    } finally {
      setLoading(false)
    }
  }, [id, navigate])

  useEffect(() => {
    loadNote()
  }, [loadNote])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const payload = { title: title.trim(), content }
    if (!payload.title) {
      setError('标题不能为空')
      return
    }
    setStatus('保存中…')
    try {
      await api(`/api/notes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      })
      setOriginalTitle(payload.title)
      setOriginalContent(content)
      setStatus('已保存')
      setTimeout(() => setStatus(''), 2000)
    } catch (e) {
      if (e.code === 'UNAUTHORIZED') {
        navigate('/login', { replace: true })
        return
      }
      setError(e.message || String(e))
    } finally {
      setStatus('')
    }
  }

  function handleBack() {
    navigate('/', { replace: true })
  }

  const hasChanges = title !== originalTitle || content !== originalContent

  return (
    <div className="relative isolate min-h-screen bg-gradient-to-br from-[#dbeafe] via-[#ede9fe] to-[#e0f2fe]">
      <div
        className="pointer-events-none fixed -left-32 -top-32 h-[28rem] w-[28rem] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(74,144,226,0.2) 0%, transparent 70%)' }}
      />
      <div
        className="pointer-events-none fixed -bottom-24 -right-24 h-[24rem] w-[24rem] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(155,81,224,0.16) 0%, transparent 70%)' }}
      />

      {/* Topbar */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-3.5 border-b border-white/50 bg-white/75 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 rounded-[14px] border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 active:scale-[0.98]"
          >
            <ArrowLeft size={16} /> 返回
          </button>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-[#4A90E2] to-[#9B51E0] flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
            <StickyNote size={18} />
          </div>
          <span className="font-bold text-lg text-slate-900 tracking-tight">编辑笔记</span>
        </div>
        {hasChanges ? (
          <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1">
            有未保存的更改
          </span>
        ) : null}
      </header>

      <main className="relative z-[1] max-w-[720px] mx-auto px-5 py-6">
        {loading ? (
          <div className="text-center text-slate-500 py-20 text-sm">加载中…</div>
        ) : (
          <section className="rounded-[22px] border border-white/70 bg-white/95 p-8 shadow-[0_24px_80px_-12px_rgba(79,70,229,0.12)] backdrop-blur-sm">
            <form className="grid gap-5" onSubmit={handleSubmit}>
              <label className="grid gap-2">
                <span className="text-[15px] font-medium text-slate-900">标题</span>
                <input
                  className={inputClass}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength={200}
                  placeholder="笔记标题"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-[15px] font-medium text-slate-900">内容</span>
                <textarea
                  className={inputClass + ' resize-y leading-relaxed overflow-hidden'}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={16}
                  placeholder="写点什么…"
                />
              </label>

              {error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 whitespace-pre-wrap">
                  {error}
                </div>
              ) : null}
              {status ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {status}
                </div>
              ) : null}

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-[14px] bg-gradient-to-r from-[#4A90E2] to-[#9B51E0] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-400/25 transition hover:opacity-[0.96] active:scale-[0.98]"
                >
                  <Save size={16} /> 保存
                </button>
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-1.5 rounded-[14px] border border-slate-200 bg-white px-6 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 active:scale-[0.98]"
                >
                  取消
                </button>
              </div>
            </form>
          </section>
        )}
      </main>
    </div>
  )
}
