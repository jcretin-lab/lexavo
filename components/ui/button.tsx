import * as React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  loading,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg'

  const variants: Record<string, string> = {
    primary:   'bg-[#1A3F7C] text-white border border-[#1A3F7C] hover:bg-[#14305F] hover:border-[#14305F] focus:ring-[#1A3F7C]',
    secondary: 'bg-[#F7F8FB] text-[#2A3142] border border-[#DCE0EA] hover:bg-[#EEF1F6] focus:ring-[#8089A0]',
    outline:   'bg-white text-[#1A3F7C] border border-[#DCE0EA] hover:border-[#1A3F7C] hover:bg-[#F3F6FB] focus:ring-[#1A3F7C]',
    ghost:     'bg-transparent text-[#1A3F7C] border border-transparent hover:bg-[#F3F6FB] focus:ring-[#1A3F7C]',
    danger:    'bg-white text-[#B23A48] border border-[#DCE0EA] hover:border-[#B23A48] hover:bg-[#F8E6E8] focus:ring-[#B23A48]',
  }

  const sizes: Record<string, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      )}
      {children}
    </button>
  )
}
