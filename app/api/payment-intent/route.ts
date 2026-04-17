import { getStripe } from '@/lib/stripe'
import { serverClient } from '@/lib/supabase'

export async function POST(request: Request) {
  const { filmId } = await request.json()

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

  const intent = await getStripe().paymentIntents.create({
    amount: Math.round(film.price * 100),
    currency: 'usd',
    payment_method_types: ['card'],
    metadata: { filmId: film.id },
  })

  return Response.json({
    clientSecret: intent.client_secret,
    paymentIntentId: intent.id,
  })
}
