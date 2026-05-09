import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Lock, User } from 'lucide-react'
import { api } from '../api'
import {
  AppleIcon,
  AuthInputWrap,
  AuthShell,
  GoogleIcon,
} from '../components/AuthShell'

const inputClass =
  'w-full rounded-[14px] border border-slate-200/90 bg-white py-3 pl-11 pr-4 text-[15px] text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#4A90E2]/60 focus:ring-4 focus:ring-[#4A90E2]/12'

export default function Register() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      await api('/api/register', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      })
      navigate('/login', { replace: true, state: { registered: true } })
    } catch (err) {
      setError(err.message || '注册失败')
    }
  }

  return (
    <AuthShell title="备注" subtitle="创建账户以开始使用">
      <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label
            htmlFor="reg-email"
            className="block text-[15px] font-medium text-slate-900"
          >
            电子邮件
          </label>
          <AuthInputWrap icon={User}>
            <input
              id="reg-email"
              className={inputClass}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
              minLength={2}
              maxLength={50}
              placeholder="your@email.com"
            />
          </AuthInputWrap>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="reg-password"
            className="block text-[15px] font-medium text-slate-900"
          >
            密码
          </label>
          <AuthInputWrap icon={Lock}>
            <input
              id="reg-password"
              className={inputClass}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              minLength={6}
              maxLength={128}
              placeholder="至少 6 位"
            />
          </AuthInputWrap>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 whitespace-pre-wrap">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          className="w-full rounded-[14px] bg-gradient-to-r from-[#4A90E2] to-[#9B51E0] py-3.5 text-[16px] font-semibold text-white shadow-lg shadow-indigo-400/35 transition hover:opacity-[0.96] active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4A90E2]"
        >
          注册
        </button>
      </form>

      <p className="mt-8 text-center text-[15px] text-slate-600">
        已有账户？
        <Link
          to="/login"
          className="ml-1 font-semibold text-[#4A90E2] transition hover:text-[#3568c4]"
        >
          立即登录
        </Link>
      </p>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white/95 px-4 text-slate-500">或</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-[14px] border border-slate-200 bg-white py-3 text-[15px] font-medium text-slate-800 shadow-sm transition hover:bg-slate-50"
          onClick={() => {}}
        >
          <GoogleIcon />
          谷歌
        </button>
        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-[14px] border border-slate-800 bg-slate-900 py-3 text-[15px] font-medium text-white shadow-sm transition hover:bg-slate-800"
          onClick={() => {}}
        >
          <AppleIcon className="text-white" />
          苹果
        </button>
      </div>
    </AuthShell>
  )
}
