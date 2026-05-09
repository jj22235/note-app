import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Clock, StickyNote } from 'lucide-react'
import { api } from '../api'

function formatDate(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleString()
}

export default function NoteView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [note, setNote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadNote = useCallback(async () => {
    setError('')
    setLoading(true)
    try {
      const data = await api(`/api/notes/${id}`)
      setNote(data)
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

  function handleBack() {
    navigate('/', { replace: true })
  }

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
          <span className="font-bold text-lg text-slate-900 tracking-tight">查看笔记</span>
        </div>
      </header>

      <main className="relative z-[1] max-w-[720px] mx-auto px-5 py-6">
        {loading ? (
          <div className="text-center text-slate-500 py-20 text-sm">加载中…</div>
        ) : error ? (
          <div className="rounded-[22px] border border-red-200 bg-white/95 p-8 text-center text-red-600 text-sm">
            {error}
          </div>
        ) : note ? (
          <section className="rounded-[22px] border border-white/70 bg-white/95 p-8 shadow-[0_24px_80px_-12px_rgba(79,70,229,0.12)] backdrop-blur-sm">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.5)] flex-shrink-0" />
              {note.title}
            </h1>
            <div className="flex items-center gap-1.5 mt-3 text-sm text-slate-500">
              <Clock size={14} />
              创建时间：{formatDate(note.created_at)}
            </div>
            <div className="mt-6 pt-6 border-t border-slate-100 text-[15px] text-slate-700 leading-relaxed whitespace-pre-wrap break-words overflow-hidden">
              {note.content}
            </div>
          </section>
        ) : null}
      </main>
    </div>
  )
}
