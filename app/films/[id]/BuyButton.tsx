'use client'

type Props = {
  filmId: string
  price: number
  title: string
}

export default function BuyButton({ filmId, price, title }: Props) {
  async function handleBuy() {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filmId }),
    })

    if (!res.ok) return

    const { url } = await res.json()
    if (url) window.location.href = url
  }

  return (
    <button
      onClick={handleBuy}
      className="w-full py-4 rounded-2xl text-white text-lg font-semibold tracking-wide active:scale-95 transition-transform"
      style={{ backgroundColor: '#0A84FF' }}
      aria-label={`Buy ${title} for $${price.toFixed(2)}`}
    >
      Own it — ${price.toFixed(2)}
    </button>
  )
}
