async function handler({ city }) {
  if (!city) {
    return { error: "Grad mora biti naveden" };
  }

  const validCities = ["Nova Pazova", "Stara Pazova", "Banovci"];
  if (!validCities.includes(city)) {
    return { error: "Nepoznat grad" };
  }

  try {
    const restaurants = await sql(
      "SELECT * FROM restaurants WHERE city = $1 ORDER BY name",
      [city]
    );

    if (!restaurants.length) {
      return { restaurants: [] };
    }

    return { restaurants };
  } catch (error) {
    return { error: "Problem sa dobijanjem podataka" };
  }
}
export async function POST(request) {
  return handler(await request.json());
}