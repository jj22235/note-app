import { CircleHelp, FileText } from 'lucide-react'

/** 与设计稿一致的认证页外层：渐变背景 + 居中白卡片容器 */
export function AuthShell({ title, subtitle, children, showHelp = true }) {
  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-gradient-to-br from-[#dbeafe] via-[#ede9fe] to-[#e0f2fe]">
      <div
        className="pointer-events-none absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(74, 144, 226, 0.35) 0%, transparent 70%)',
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-24 -right-24 h-[24rem] w-[24rem] rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(155, 81, 224, 0.28) 0%, transparent 70%)',
        }}
      />

      {showHelp ? (
        <button
          type="button"
          className="fixed bottom-6 right-6 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/80 bg-white/90 text-slate-500 shadow-lg shadow-indigo-900/10 backdrop-blur-sm transition hover:bg-white hover:text-slate-700"
          aria-label="帮助"
          onClick={() => {}}
        >
          <CircleHelp size={22} strokeWidth={1.75} />
        </button>
      ) : null}

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-[420px] rounded-[22px] border border-white/70 bg-white/95 p-8 shadow-[0_24px_80px_-12px_rgba(79,70,229,0.18)] backdrop-blur-sm sm:p-10">
          <div className="flex flex-col items-center text-center">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-b from-[#4A90E2] to-[#9B51E0] text-white shadow-lg shadow-indigo-500/30">
              <FileText size={28} strokeWidth={2} />
            </div>
            <h1 className="text-[1.65rem] font-bold tracking-tight text-slate-900">
              {title}
            </h1>
            <p className="mt-1.5 text-[15px] text-slate-500">{subtitle}</p>
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}

/** 带左侧图标的输入框（白底、圆角） */
export function AuthInputWrap({ icon: Icon, children }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 z-[1] -translate-y-1/2 text-slate-400">
        <Icon size={18} strokeWidth={1.75} />
      </span>
      {children}
    </div>
  )
}

export function GoogleIcon({ className = '' }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

export function AppleIcon({ className = '' }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  )
}
