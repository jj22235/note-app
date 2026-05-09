import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../AuthContext'

function formatDate(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleString()
}

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
    return () => {
      cancelled = true
    }
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
    setEditingId(note.id)
    setTitle(note.title || '')
    setContent(note.content || '')
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
        await api('/api/notes', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
      } else {
        await api(`/api/notes/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        })
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

  return (
    <>
      <header className="topbar">
        <div>
          <div className="topbar__title">个人笔记本</div>
          {me ? <div className="topbar__sub">你好，{me.username}</div> : null}
        </div>
        <div className="topbar__actions">
          <button type="button" className="btn" onClick={() => resetForm()}>
            新建笔记
          </button>
          <button type="button" className="btn" onClick={handleLogout}>
            退出登录
          </button>
        </div>
      </header>

      <main className="container">
        <section className="panel">
          <h2 className="panel__title">笔记编辑</h2>
          <form className="form" onSubmit={handleSubmit}>
            <label className="field">
              <span className="field__label">标题</span>
              <input
                className="input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={200}
              />
            </label>
            <label className="field">
              <span className="field__label">内容</span>
              <textarea
                className="textarea"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={10}
              />
            </label>
            <div className="form__actions">
              <button type="submit" className="btn btn--primary">
                {editingId == null ? '保存' : '更新'}
              </button>
              <button type="button" className="btn" onClick={() => resetForm()}>
                取消
              </button>
            </div>
          </form>
          {status ? <div className="status">{status}</div> : null}
          {error ? <div className="error">{error}</div> : null}
        </section>

        <section className="panel">
          <h2 className="panel__title">笔记列表</h2>
          <div className="notes">
            {notes.length === 0 ? (
              <div className="note note--empty">暂无笔记</div>
            ) : (
              notes.map((n) => (
                <article key={n.id} className="note">
                  <div className="note__head">
                    <div>
                      <h3 className="note__title">{n.title}</h3>
                      <div className="note__meta">创建时间：{formatDate(n.created_at)}</div>
                    </div>
                    <div className="note__actions">
                      <button type="button" className="btn" onClick={() => startEdit(n)}>
                        编辑
                      </button>
                      <button
                        type="button"
                        className="btn btn--danger"
                        onClick={() => handleDelete(n.id)}
                      >
                        删除
                      </button>
                    </div>
                  </div>
                  <div className="note__content">{n.content}</div>
                </article>
              ))
            )}
          </div>
        </section>
      </main>
    </>
  )
}
