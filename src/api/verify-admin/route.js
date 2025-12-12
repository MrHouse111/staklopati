import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Čitamo podatke koje je poslao admin panel
    const body = await request.json();
    const { password } = body;

    // Provera da li je lozinka tačna (Hardkodovano na 12345)
    if (password === "12345") {
      // OVO JE KLJUČNO: Vraćamo NextResponse, a ne običan return
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: "Pogrešna lozinka" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, error: "Serverska greška" },
      { status: 500 }
    );
  }
}