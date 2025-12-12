import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { password } = body;

    // Hardkodovana šifra radi jednostavnosti
    if (password === "12345") {
      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      return NextResponse.json(
        { success: false, error: "Pogrešna lozinka" },
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