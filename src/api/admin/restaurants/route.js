import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function POST(request) {
  // Povezivanje na bazu koristeći Neon drajver
  const sql = neon(process.env.DATABASE_URL);

  try {
    const body = await request.json();
    const { action, restaurant } = body;

    if (!action) {
      return NextResponse.json({ error: "Action is required" }, { status: 400 });
    }

    // --- CREATE ---
    if (action === "create") {
      if (!restaurant?.name || !restaurant?.city || !restaurant?.address) {
        return NextResponse.json({ error: "Name, city, and address are required" }, { status: 400 });
      }

      // Neon vraća niz redova (rows) direktno
      const result = await sql(
        "INSERT INTO restaurants (name, city, address, phone, delivery_info) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [
          restaurant.name,
          restaurant.city,
          restaurant.address,
          restaurant.phone || null,
          restaurant.delivery_info || null,
        ]
      );

      return NextResponse.json({ success: true, restaurant: result[0] });
    }

    // --- READ ---
    if (action === "read") {
      if (restaurant?.id) {
        const result = await sql("SELECT * FROM restaurants WHERE id = $1", [
          restaurant.id,
        ]);
        return NextResponse.json({ restaurant: result[0] });
      }

      const result = await sql("SELECT * FROM restaurants ORDER BY name");
      return NextResponse.json({ restaurants: result });
    }

    // --- UPDATE ---
    if (action === "update") {
      if (!restaurant?.id) {
        return NextResponse.json({ error: "Restaurant ID is required" }, { status: 400 });
      }

      const setValues = [];
      const queryParams = [];
      let paramCount = 1;

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
      if (restaurant.delivery_info !== undefined) {
        setValues.push(`delivery_info = $${paramCount}`);
        queryParams.push(restaurant.delivery_info);
        paramCount++;
      }

      queryParams.push(restaurant.id);
      const query = `UPDATE restaurants SET ${setValues.join(
        ", "
      )} WHERE id = $${paramCount} RETURNING *`;

      const result = await sql(query, queryParams);
      return NextResponse.json({ success: true, restaurant: result[0] });
    }

    // --- DELETE ---
    if (action === "delete") {
      if (!restaurant?.id) {
        return NextResponse.json({ error: "Restaurant ID is required" }, { status: 400 });
      }

      await sql("DELETE FROM restaurants WHERE id = $1", [restaurant.id]);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: "Database error: " + error.message }, { status: 500 });
  }
}