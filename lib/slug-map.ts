export const SLUG_TO_ID: Record<string, string> = {
  'the-last-shore': '71f88776-0edc-432a-b2a3-d3a548948530',
}

export const ID_TO_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(SLUG_TO_ID).map(([slug, id]) => [id, slug])
)
