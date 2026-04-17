'use client'

import { useEffect, useState } from 'react'

type Platform = 'ios' | 'android' | null

export default function AddToHomeScreen() {
  const [platform, setPlatform] = useState<Platform>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) return
    if (localStorage.getItem('arclo-a2hs-dismissed')) return

    const ua = navigator.userAgent
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as Window & { MSStream?: unknown }).MSStream
    const isAndroidChrome = /Android/.test(ua) && /Chrome/.test(ua)

    if (isIOS) {
      const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS/.test(ua)
      if (isSafari) { setPlatform('ios'); setVisible(true) }
    } else if (isAndroidChrome) {
      const handler = (e: Event) => {
        e.preventDefault()
        setDeferredPrompt(e)
        setPlatform('android')
        setVisible(true)
      }
      window.addEventListener('beforeinstallprompt', handler)
      return () => window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  function dismiss() {
    localStorage.setItem('arclo-a2hs-dismissed', '1')
    setVisible(false)
  }

  async function installAndroid() {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    await deferredPrompt.userChoice
    dismiss()
  }

  if (!visible || !platform) return null

  return (
    <div
      className="fixed bottom-28 left-4 right-4 z-40 rounded-2xl p-4 flex items-start gap-3"
      style={{ backgroundColor: '#111', border: '1px solid #222' }}
    >
      <div
        className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-lg"
        style={{ backgroundColor: '#0A84FF', color: 'white', fontFamily: 'serif' }}
      >
        A
      </div>

      <div className="flex-1 flex flex-col gap-1.5">
        <span className="text-white text-sm font-semibold">Add ARCLO to your home screen</span>
        {platform === 'ios' ? (
          <span className="text-neutral-500 text-xs leading-relaxed">
            Tap{' '}
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', verticalAlign: 'middle' }}>
              <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
            </svg>
            {' '}then{' '}
            <strong className="text-neutral-300">Add to Home Screen</strong>
          </span>
        ) : (
          <button
            onClick={installAndroid}
            className="text-xs font-semibold self-start px-3 py-1.5 rounded-lg mt-0.5"
            style={{ backgroundColor: '#0A84FF', color: 'white' }}
          >
            Add to Home Screen
          </button>
        )}
      </div>

      <button
        onClick={dismiss}
        className="text-neutral-600 hover:text-neutral-400 text-xl leading-none mt-0.5 transition-colors"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  )
}
