import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function POST(request) {
  // Povezivanje na bazu
  const sql = neon(process.env.DATABASE_URL);

  try {
    const body = await request.json();
    const { action, category, menu } = body;

    if (!action) {
      return NextResponse.json({ error: "Action is required" }, { status: 400 });
    }

    // --- CREATE CATEGORY (Kreiranje kategorije) ---
    if (action === "createCategory") {
      if (!category?.name || !category?.restaurantId) {
        return NextResponse.json({ error: "Ime i ID restorana su obavezni" }, { status: 400 });
      }

      const result = await sql(
        "INSERT INTO menu_categories (name, restaurant_id) VALUES ($1, $2) RETURNING *",
        [category.name, category.restaurantId]
      );

      return NextResponse.json({ success: true, category: result[0] });
    }

    // --- CREATE MENU ITEM (Kreiranje jela) ---
    if (action === "createMenuItem") {
      if (!menu?.name || !menu?.price || !menu?.categoryId) {
        return NextResponse.json({ error: "Ime, cena i kategorija su obavezni" }, { status: 400 });
      }

      const result = await sql(
        "INSERT INTO menu_items (name, price, description, category_id) VALUES ($1, $2, $3, $4) RETURNING *",
        [menu.name, menu.price, menu.description || null, menu.categoryId]
      );

      return NextResponse.json({ success: true, menuItem: result[0] });
    }

    // --- READ MENU ITEMS (Čitanje jela) ---
    if (action === "readMenuItems") {
      if (menu?.categoryId) {
        const result = await sql(
          "SELECT * FROM menu_items WHERE category_id = $1 ORDER BY name",
          [menu.categoryId]
        );
        return NextResponse.json({ menuItems: result });
      }

      if (menu?.restaurantId) {
        const result = await sql(
          "SELECT mi.* FROM menu_items mi JOIN menu_categories mc ON mi.category_id = mc.id WHERE mc.restaurant_id = $1 ORDER BY mi.name",
          [menu.restaurantId]
        );
        return NextResponse.json({ menuItems: result });
      }

      return NextResponse.json({ error: "Category ID ili restaurant ID je obavezan" }, { status: 400 });
    }

    // --- READ CATEGORIES (Čitanje kategorija) ---
    if (action === "readCategories") {
      if (!menu?.restaurantId) {
        return NextResponse.json({ error: "Restaurant ID je obavezan" }, { status: 400 });
      }

      const result = await sql(
        "SELECT * FROM menu_categories WHERE restaurant_id = $1 ORDER BY name",
        [menu.restaurantId]
      );
      return NextResponse.json({ categories: result });
    }

    // --- DELETE MENU ITEM (Brisanje jela) ---
    if (action === "deleteMenuItem") {
      if (!menu?.id) {
        return NextResponse.json({ error: "Menu item ID je obavezan" }, { status: 400 });
      }

      await sql("DELETE FROM menu_items WHERE id = $1", [menu.id]);
      return NextResponse.json({ success: true });
    }

    // --- DELETE CATEGORY (Brisanje kategorije) ---
    if (action === "deleteCategory") {
      if (!category?.id) {
        return NextResponse.json({ error: "Category ID je obavezan" }, { status: 400 });
      }

      // Koristimo transakciju za brisanje jela i kategorije
      await sql.transaction(async (sql) => {
        await sql("DELETE FROM menu_items WHERE category_id = $1", [category.id]);
        await sql("DELETE FROM menu_categories WHERE id = $1", [category.id]);
      });

      return NextResponse.json({ success: true });
    }
    
    // Nema podrške za update, pa vraćamo invalid action za sada
    if (action === "updateMenuItem" || action === "updateCategory") {
        return NextResponse.json({ error: `Akcija '${action}' trenutno nije podržana.` }, { status: 400 });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error) {
    console.error('Menu API Error:', error);
    return NextResponse.json({ error: "Serverska greška: " + error.message }, { status: 500 });
  }
}