import { getStripe } from '@/lib/stripe'
import { serverClient } from '@/lib/supabase'

export async function POST(request: Request) {
  const { filmId, utm_source, utm_medium, utm_campaign, utm_content, utm_term } = await request.json()

  if (!filmId) {
    return Response.json({ error: 'filmId required' }, { status: 400 })
  }

  const { data: film } = await serverClient()
    .from('films')
    .select('id, title, price')
    .eq('id', filmId)
    .single()

  if (!film) {
    return Response.json({ error: 'Film not found' }, { status: 404 })
  }

  const origin = new URL(request.url).origin

  const session = await getStripe().checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: { name: film.title },
          unit_amount: Math.round(film.price * 100),
        },
        quantity: 1,
      },
    ],
    success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/films/${film.id}`,
    metadata: {
      filmId: film.id,
      ...(utm_source && { utm_source }),
      ...(utm_medium && { utm_medium }),
      ...(utm_campaign && { utm_campaign }),
      ...(utm_content && { utm_content }),
      ...(utm_term && { utm_term }),
    },
  })

  return Response.json({ url: session.url })
}
