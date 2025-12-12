import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { password } = body;

    // Provera da li je uneta lozinka
    if (!password) {
      return NextResponse.json(
        { success: false, error: "Lozinka je obavezna" },
        { status: 400 }
      );
    }

    // Provera tačnosti lozinke
    if (password === "12345") {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: "Pogrešna admin lozinka" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: "Serverska greška" },
      { status: 500 }
    );
  }
}