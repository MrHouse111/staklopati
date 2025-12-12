import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const sql = neon(process.env.DATABASE_URL);

  try {
    const { city } = await request.json();

    if (!city) {
      return NextResponse.json({ error: "Grad mora biti naveden" }, { status: 400 });
    }

    // Pazimo na case-sensitivity i trimujemo prazna mesta
    const result = await sql`
      SELECT * FROM restaurants 
      WHERE city = ${city} 
      ORDER BY id DESC
    `;

    return NextResponse.json({ restaurants: result });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: "Problem sa bazom" }, { status: 500 });
  }
}