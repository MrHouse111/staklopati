async function handler({ query }) {
  if (!query?.name || !query?.city) {
    return {
      error: "Potrebno je uneti ime restorana i grad",
    };
  }

  const result = await fetch("/api/db/restorani-nova-pazova", {
    method: "POST",
    body: JSON.stringify({
      query: `DELETE FROM restaurants WHERE name = '${query.name}' AND city = '${query.city}'`,
    }),
  }).then((r) => r.json());

  return {
    success: true,
    result,
  };
}
export async function POST(request) {
  return handler(await request.json());
}