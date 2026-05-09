import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileText, Plus, LogOut, Save, X, Pencil, Trash2,
  Clock, StickyNote, Calendar, AlignLeft, Edit3, User,
  ChevronDown, ChevronUp,
} from 'lucide-react'
import { api } from '../api'
import { useAuth } from '../AuthContext'

const NOTE_PREVIEW_LEN = 150

function formatDate(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleString()
}

function StatCard({ icon: Icon, value, label, color }) {
  const styles = {
    purple: 'bg-purple-50 text-purple-600',
    blue: 'bg-blue-50 text-blue-600',
    teal: 'bg-teal-50 text-teal-600',
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white/90 px-4 py-3.5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${styles[color] || styles.purple}`}>
        <Icon size={18} />
      </div>
      <div>
        <div className="text-xl font-extrabold text-slate-900 leading-none">{value}</div>
        <div className="text-xs text-slate-500 mt-1">{label}</div>
      </div>
    </div>
  )
}

function NoteCard({ note, onEdit, onDelete, onView }) {
  const [expanded, setExpanded] = useState(false)
  const content = note.content || ''
  const isLong = content.length > NOTE_PREVIEW_LEN
  const displayContent = expanded || !isLong ? content : content.slice(0, NOTE_PREVIEW_LEN) + '…'

  return (
    <article
      className="rounded-2xl border border-slate-200/80 bg-white/90 px-5 py-4 transition hover:border-[#4A90E2]/30 hover:shadow-[0_4px_20px_rgba(74,144,226,0.08)] cursor-pointer select-none min-w-0"
      onDoubleClick={() => onView(note)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[15px] font-bold text-slate-900 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.5)] flex-shrink-0" />
            <span className="truncate">{note.title}</span>
          </h3>
          <div className="flex items-center gap-1 mt-1.5 text-xs text-slate-500">
            <Clock size={12} /> 创建时间：{formatDate(note.created_at)}
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            type="button"
            onClick={() => onEdit(note)}
            className="inline-flex items-center gap-1 rounded-lg border border-[#4A90E2]/30 bg-[#4A90E2]/5 text-[#4A90E2] px-2.5 py-1.5 text-xs font-medium transition hover:border-[#4A90E2]/60 hover:bg-[#4A90E2]/10 active:scale-[0.97]"
          >
            <Pencil size={13} /> 编辑
          </button>
          <button
            type="button"
            onClick={() => onDelete(note.id)}
            className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 text-red-600 px-2.5 py-1.5 text-xs font-medium transition hover:border-red-300 hover:bg-red-100 active:scale-[0.97]"
          >
            <Trash2 size={13} /> 删除
          </button>
        </div>
      </div>
      <div className="mt-3 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap break-words overflow-hidden">
        {displayContent}
      </div>
      {isLong ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#4A90E2] hover:text-[#3568c4] transition-colors"
        >
          {expanded ? (
            <>收起 <ChevronUp size={14} /></>
          ) : (
            <>展开 <ChevronDown size={14} /></>
          )}
        </button>
      ) : null}
    </article>
  )
}

const inputClass =
  'w-full rounded-[14px] border border-slate-200/90 bg-white px-4 py-2.5 text-[15px] text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#4A90E2]/60 focus:ring-4 focus:ring-[#4A90E2]/12'

export default function NotesPage() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [me, setMe] = useState(null)
  const [notes, setNotes] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  const loadNotes = useCallback(async () => {
    setError('')
    setStatus('加载中…')
    try {
      const data = await api('/api/notes')
      setNotes(Array.isArray(data) ? data : [])
      setStatus('')
    } catch (e) {
      setStatus('')
      if (e.code === 'UNAUTHORIZED') {
        navigate('/login', { replace: true })
        return
      }
      setError(e.message || String(e))
    }
  }, [navigate])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const u = await api('/api/me')
        if (!cancelled) setMe(u)
      } catch (e) {
        if (e.code === 'UNAUTHORIZED') navigate('/login', { replace: true })
      }
    })()
    return () => { cancelled = true }
  }, [navigate])

  useEffect(() => {
    loadNotes()
  }, [loadNotes])

  function resetForm() {
    setEditingId(null)
    setTitle('')
    setContent('')
  }

  function startEdit(note) {
    navigate(`/notes/${note.id}/edit`)
  }

  function handleView(note) {
    navigate(`/notes/${note.id}`)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const payload = { title: title.trim(), content }
    if (!payload.title) {
      setError('标题不能为空')
      return
    }
    setStatus(editingId == null ? '保存中…' : '更新中…')
    try {
      if (editingId == null) {
        await api('/api/notes', { method: 'POST', body: JSON.stringify(payload) })
      } else {
        await api(`/api/notes/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) })
      }
      resetForm()
      await loadNotes()
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

  async function handleDelete(id) {
    if (!confirm('确定要删除这条笔记吗？')) return
    setError('')
    setStatus('删除中…')
    try {
      await api(`/api/notes/${id}`, { method: 'DELETE' })
      await loadNotes()
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

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  const stats = useMemo(() => {
    const total = notes.length
    const totalWords = notes.reduce((sum, n) => sum + (n.content || '').length, 0)
    const today = new Date().toDateString()
    const todayNotes = notes.filter((n) => {
      try { return new Date(n.created_at).toDateString() === today } catch { return false }
    }).length
    return { total, totalWords, todayNotes }
  }, [notes])

  return (
    <div className="relative isolate min-h-screen bg-gradient-to-br from-[#dbeafe] via-[#ede9fe] to-[#e0f2fe]">
      {/* Decorative blobs */}
      <div
        className="pointer-events-none fixed -left-32 -top-32 h-[28rem] w-[28rem] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(74,144,226,0.2) 0%, transparent 70%)' }}
      />
      <div
        className="pointer-events-none fixed -bottom-24 -right-24 h-[24rem] w-[24rem] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(155,81,224,0.16) 0%, transparent 70%)' }}
      />

      {/* ─── Topbar ─── */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-3.5 border-b border-white/50 bg-white/75 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-[#4A90E2] to-[#9B51E0] flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
            <StickyNote size={18} />
          </div>
          <div>
            <div className="font-bold text-lg text-slate-900 tracking-tight">个人笔记本</div>
            {me ? (
              <div className="text-xs text-slate-500 flex items-center gap-1">
                <User size={11} /> {me.username}
              </div>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => resetForm()}
            className="inline-flex items-center gap-1.5 rounded-[14px] bg-gradient-to-r from-[#4A90E2] to-[#9B51E0] text-white px-4 py-2 text-sm font-semibold shadow-lg shadow-indigo-400/25 transition hover:opacity-[0.96] active:scale-[0.98]"
          >
            <Plus size={16} /> 新建笔记
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-[14px] border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 active:scale-[0.98]"
          >
            <LogOut size={16} /> 退出登录
          </button>
        </div>
      </header>

      {/* ─── Main ─── */}
      <main className="relative z-[1] max-w-[1100px] mx-auto px-5 py-6 grid gap-5 md:grid-cols-[1fr_1.2fr] items-start">
        {/* ─── Editor panel ─── */}
        <section className="rounded-[22px] border border-white/70 bg-white/95 p-6 shadow-[0_24px_80px_-12px_rgba(79,70,229,0.12)] backdrop-blur-sm">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-500 uppercase tracking-wider mb-5">
            <Edit3 size={16} className="text-[#9B51E0]" /> 笔记编辑
          </h2>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <StatCard icon={FileText} value={stats.total} label="笔记总数" color="purple" />
            <StatCard icon={AlignLeft} value={stats.totalWords} label="总字数" color="blue" />
            <StatCard icon={Calendar} value={stats.todayNotes} label="今日新增" color="teal" />
          </div>

          <form className="grid gap-4" onSubmit={handleSubmit}>
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
                rows={8}
                placeholder="写点什么…"
              />
            </label>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-[14px] bg-gradient-to-r from-[#4A90E2] to-[#9B51E0] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-400/25 transition hover:opacity-[0.96] active:scale-[0.98]"
              >
                <Save size={16} /> {editingId == null ? '保存' : '更新'}
              </button>
              <button
                type="button"
                onClick={() => resetForm()}
                className="inline-flex items-center gap-1.5 rounded-[14px] border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 active:scale-[0.98]"
              >
                <X size={16} /> 取消
              </button>
            </div>
          </form>
          {status ? <div className="mt-3 text-sm text-slate-500 min-h-[18px]">{status}</div> : null}
          {error ? (
            <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 whitespace-pre-wrap">
              {error}
            </div>
          ) : null}
        </section>

        {/* ─── Notes list panel ─── */}
        <section className="rounded-[22px] border border-white/70 bg-white/95 p-6 shadow-[0_24px_80px_-12px_rgba(79,70,229,0.12)] backdrop-blur-sm">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-500 uppercase tracking-wider mb-5">
            <FileText size={16} className="text-[#9B51E0]" /> 笔记列表
          </h2>
          <div className="grid gap-3">
            {notes.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-10 px-5 rounded-xl border border-dashed border-slate-200 text-center">
                <StickyNote size={40} strokeWidth={1} className="text-slate-300" />
                <p className="text-sm text-slate-500">暂无笔记，点击"新建笔记"开始记录</p>
              </div>
            ) : (
              notes.map((n) => (
                <NoteCard key={n.id} note={n} onEdit={startEdit} onDelete={handleDelete} onView={handleView} />
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
