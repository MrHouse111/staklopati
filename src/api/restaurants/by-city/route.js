import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function POST(request) {
  // Povezivanje na bazu koristeći Neon drajver
  const sql = neon(process.env.DATABASE_URL);

  try {
    const { city } = await request.json();

    if (!city) {
      return NextResponse.json({ error: "Grad mora biti naveden" }, { status: 400 });
    }

    const validCities = ["Nova Pazova", "Stara Pazova", "Banovci"];
    if (!validCities.includes(city)) {
      return NextResponse.json({ error: "Nepoznat grad" }, { status: 400 });
    }

    // Neon drajver vraća niz rezultata direktno
    const result = await sql('SELECT * FROM restaurants WHERE city = $1 ORDER BY name', [city]);

    // Ako nema rezultata, vraćamo prazan niz
    return NextResponse.json({ restaurants: result || [] });

  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: "Problem sa dobijanjem podataka: " + error.message }, { status: 500 });
  }
}