import { Skeleton } from '@/components/Skeleton'
import { tokens } from '@/lib/tokens'

export default function FilmsLoading() {
  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: tokens.color.bg,
        color: tokens.color.ink,
        display: 'flex',
        flexDirection: 'column',
        paddingBottom: 180,
      }}
    >
      <Skeleton height="70vh" radius={0} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 40, paddingTop: 32, paddingLeft: 32, paddingRight: 32 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 640 }}>
          <Skeleton width="100%" height={14} />
          <Skeleton width="90%" height={14} />
          <Skeleton width="70%" height={14} />
        </div>
      </div>

      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '24px 24px 32px',
          background: 'linear-gradient(to top, #000 60%, transparent)',
        }}
      >
        <Skeleton height={56} radius={tokens.radius.lg} />
      </div>
    </main>
  )
}
