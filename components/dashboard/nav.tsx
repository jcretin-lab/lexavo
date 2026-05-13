'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface NavProps {
  cabinet: { id: string; nom: string; plan: string; make_webhook_url?: string | null }
}

export function DashboardNav({ cabinet }: NavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const reseauxConfigured = !!cabinet.make_webhook_url

  const navItems = [
    { href: '/dashboard', label: 'Tableau de bord', icon: '⊞' },
    { href: '/dashboard/generer', label: 'Générer du contenu', icon: '✦' },
    { href: '/dashboard/article-vers-linkedin', label: 'Mon article → Posts', icon: '⇢' },
    { href: '/dashboard/contenu', label: 'Mes contenus', icon: '☰' },
    { href: '/dashboard/calendrier', label: 'Calendrier', icon: '◫' },
    ...(cabinet.plan === 'cabinet' ? [{ href: '/dashboard/equipe', label: 'Équipe', icon: '⊕' }] : []),
    { href: '/dashboard/parametres', label: 'Paramètres', icon: '⚙' },
  ]

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      {/* Barre mobile */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 h-14 flex items-center px-4 gap-3" style={{ background: 'var(--navy-900)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg transition-colors"
          style={{ color: 'rgba(255,255,255,0.75)' }}
          aria-label="Ouvrir le menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <svg width="17" height="17" viewBox="0 0 17 17" fill="none" style={{ color: 'rgba(255,255,255,0.65)', flexShrink: 0 }}>
            <rect x="1" y="1" width="15" height="11.5" rx="2.5" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M3.5 16L6 12.5H1L3.5 16Z" fill="currentColor"/>
          </svg>
          <span style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: '1.25rem', color: 'var(--white)', letterSpacing: '-0.02em' }}>
            Lex<em>avo</em><span style={{ color: 'var(--ocre-500)' }}>.</span>
          </span>
        </div>
      </div>

      {/* Overlay mobile */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-20 bg-black/40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed left-0 top-0 h-full w-64 flex flex-col z-30 transition-transform duration-300',
        mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      )} style={{ background: 'var(--navy-900)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
        {/* Logo */}
        <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <div className="flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 17 17" fill="none" style={{ color: 'rgba(255,255,255,0.65)', flexShrink: 0 }}>
                <rect x="1" y="1" width="15" height="11.5" rx="2.5" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M3.5 16L6 12.5H1L3.5 16Z" fill="currentColor"/>
              </svg>
              <h1 style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: '1.375rem', color: 'var(--white)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                Lex<em>avo</em><span style={{ color: 'var(--ocre-500)' }}>.</span>
              </h1>
            </div>
            <p className="text-xs mt-2 truncate" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-jetbrains-mono)', letterSpacing: '0.04em' }}>{cabinet.nom}</p>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1.5 rounded-lg transition-colors"
            style={{ color: 'rgba(255,255,255,0.5)' }}
            aria-label="Fermer le menu"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors')}
                style={{
                  background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                  color: active ? 'var(--white)' : 'rgba(255,255,255,0.65)',
                }}
              >
                <span className="text-base opacity-70">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}

          <Link
            href="/dashboard/reseaux"
            className={cn('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mt-1')}
            style={{
              background: pathname === '/dashboard/reseaux' ? 'rgba(255,255,255,0.08)' : 'transparent',
              color: pathname === '/dashboard/reseaux' ? 'var(--white)' : 'rgba(255,255,255,0.65)',
            }}
          >
            <span className="text-base opacity-70">{reseauxConfigured ? '✓' : '📅'}</span>
            {reseauxConfigured ? 'Réseaux configurés' : 'Mes réseaux'}
          </Link>
        </nav>

        {/* Footer */}
        <div className="px-4 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="px-3 py-2 rounded-lg text-xs font-medium capitalize mb-3" style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--ocre-300)', fontFamily: 'var(--font-jetbrains-mono)', letterSpacing: '0.06em' }}>
            Plan {cabinet.plan}
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 text-sm rounded-lg transition-colors"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  )
}
