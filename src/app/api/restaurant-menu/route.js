import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function POST(request) {
  // Povezivanje na Neon bazu
  const sql = neon(process.env.DATABASE_URL);

  try {
    const { restaurantId } = await request.json();

    if (!restaurantId) {
      return NextResponse.json({ error: "Restaurant ID je obavezan" }, { status: 400 });
    }

    // Povlačimo jela i njihove kategorije (koristimo nove tabele: menu_items, menu_categories)
    const result = await sql`
        SELECT 
            mi.name, 
            mi.description, 
            mi.price, 
            mc.name as category_name
        FROM menu_items mi
        JOIN menu_categories mc ON mi.category_id = mc.id
        WHERE mc.restaurant_id = ${restaurantId}
        ORDER BY mc.id, mi.name
    `;

    // Formatiramo podatke po kategorijama
    const menuByCategory = {};
    
    result.forEach(item => {
        const categoryName = item.category_name;
        if (!menuByCategory[categoryName]) {
            menuByCategory[categoryName] = [];
        }
        menuByCategory[categoryName].push({
            name: item.name,
            description: item.description,
            price: item.price,
            portion: item.portion // Koristi portion ako postoji
        });
    });

    // Povlačimo ime i radno vreme restorana
    const restInfo = await sql`SELECT name, hours FROM restaurants WHERE id = ${restaurantId}`;

    return NextResponse.json({ 
        menu: menuByCategory,
        restaurantName: restInfo[0]?.name,
        restaurantHours: restInfo[0]?.hours
    });

  } catch (error) {
    console.error('Error fetching menu:', error);
    return NextResponse.json({ error: "Problem sa dobijanjem menija" }, { status: 500 });
  }
}