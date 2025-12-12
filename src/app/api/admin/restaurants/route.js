import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const sql = neon(process.env.DATABASE_URL);

  try {
    const body = await request.json();
    const { action, restaurant } = body;

    if (!action) {
      return NextResponse.json({ error: "Action is required" }, { status: 400 });
    }

    // --- CREATE (Dodavanje restorana) ---
    if (action === "create") {
      if (!restaurant?.name || !restaurant?.city || !restaurant?.address || !restaurant?.openingTime || !restaurant?.closingTime) {
        return NextResponse.json({ error: "Svi podaci su obavezni" }, { status: 400 });
      }

      // Spajamo vreme za stari "hours" field za prikaz
      const hours = `${restaurant.openingTime} - ${restaurant.closingTime}`;

      const result = await sql(
        "INSERT INTO restaurants (name, city, address, phone, hours) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [
          restaurant.name,
          restaurant.city,
          restaurant.address,
          restaurant.phone || null,
          hours
        ]
      );

      return NextResponse.json({ success: true, restaurant: result[0] });
    }

    // --- READ (Čitanje restorana) ---
    if (action === "read") {
      // NAPOMENA: U SELECT upitu se vraća HOURS, a ne delivery_info
      const result = await sql('SELECT id, name, city, address, phone, hours FROM restaurants ORDER BY id DESC');
      return NextResponse.json({ restaurants: result });
    }

    // --- UPDATE (Izmena restorana) ---
    if (action === "update") {
      if (!restaurant?.id) {
        return NextResponse.json({ error: "Restaurant ID is required" }, { status: 400 });
      }

      const setValues = [];
      const queryParams = [];
      let paramCount = 1;

      // Logika za spajanje vremena u 'hours' polje
      if (restaurant.openingTime && restaurant.closingTime) {
        const hours = `${restaurant.openingTime} - ${restaurant.closingTime}`;
        setValues.push(`hours = $${paramCount}`);
        queryParams.push(hours);
        paramCount++;
      } else if (restaurant.hours) { // Ako je poslata stara, single vrednost (za svaki slučaj)
        setValues.push(`hours = $${paramCount}`);
        queryParams.push(restaurant.hours);
        paramCount++;
      }

      // Ostala polja
      if (restaurant.name) {
        setValues.push(`name = $${paramCount}`);
        queryParams.push(restaurant.name);
        paramCount++;
      }
      if (restaurant.city) {
        setValues.push(`city = $${paramCount}`);
        queryParams.push(restaurant.city);
        paramCount++;
      }
      if (restaurant.address) {
        setValues.push(`address = $${paramCount}`);
        queryParams.push(restaurant.address);
        paramCount++;
      }
      if (restaurant.phone !== undefined) {
        setValues.push(`phone = $${paramCount}`);
        queryParams.push(restaurant.phone);
        paramCount++;
      }
      // Ako je bilo polje delivery_info, a nema ga, možemo ga preskočiti ili obrisati
      
      if (setValues.length === 0) {
         return NextResponse.json({ error: "No fields to update" }, { status: 400 });
      }

      queryParams.push(restaurant.id);
      const query = `UPDATE restaurants SET ${setValues.join(
        ", "
      )} WHERE id = $${paramCount} RETURNING *`;

      const result = await sql(query, queryParams);
      return NextResponse.json({ success: true, restaurant: result[0] });
    }

    // --- DELETE (Brisanje restorana) ---
    if (action === "delete") {
      if (!restaurant?.id) {
        return NextResponse.json({ error: "Restaurant ID is required" }, { status: 400 });
      }

      await sql('DELETE FROM restaurants WHERE id = $1', [restaurant.id]);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: "Database error: " + error.message }, { status: 500 });
  }
}