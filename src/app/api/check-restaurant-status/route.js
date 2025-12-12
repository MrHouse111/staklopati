import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const sql = neon(process.env.DATABASE_URL);

  try {
    const { restaurantId } = await request.json();

    if (!restaurantId) {
      return NextResponse.json({ error: "Restaurant ID is required" }, { status: 400 });
    }

    // Povlačimo samo hours
    const result = await sql`
      SELECT hours FROM restaurants WHERE id = ${restaurantId}
    `;

    if (!result.length || !result[0].hours) {
      // Ako nema polja hours, smatramo da je otvoreno ili vraćamo neutralno
      return NextResponse.json({ isOpen: true, status: "Nema podataka o radnom vremenu" });
    }

    const hours = result[0].hours; 
    
    // Provera da li je u formatu HH:MM - HH:MM
    const timeRegex = /^(\d{2}:\d{2})\s?-\s?(\d{2}:\d{2})$/;
    const match = hours.match(timeRegex);

    if (!match) {
        // Ako je format neispravan, vraćamo 'Otvoreno' kao default
        return NextResponse.json({ isOpen: true, status: "Neispravan format" });
    }

    const [_, startTime, endTime] = match; // Izvuci vreme otvaranja i zatvaranja

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // --- KLJUČNA LOGIKA ZA PROVERU ---
    
    // Pomoćna funkcija za pretvaranje HH:MM u minute od ponoći
    const timeToMinutes = (timeStr) => {
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + m;
    };
    
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    const startTimeInMinutes = timeToMinutes(startTime);
    let endTimeInMinutes = timeToMinutes(endTime);

    let isOpen = false;

    // Ako je zatvaranje nakon ponoći (npr. 23:00 - 02:00)
    if (endTimeInMinutes < startTimeInMinutes) {
        // Vreme zatvaranja računamo kao vreme narednog dana (dodajemo 24h)
        // Ako je trenutno vreme između ponoći i zatvaranja (npr. 00:00 - 02:00), ili između otvaranja i ponoći
        if (currentTimeInMinutes >= startTimeInMinutes || currentTimeInMinutes < endTimeInMinutes) {
            isOpen = true;
        }
    } else {
        // Normalan slučaj (istog dana)
        if (currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes < endTimeInMinutes) {
            isOpen = true;
        }
    }

    return NextResponse.json({ isOpen });

  } catch (error) {
    console.error("Error checking restaurant status:", error);
    return NextResponse.json({ isOpen: false, error: "Serverska greška" }, { status: 500 });
  }
}