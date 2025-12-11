async function handler({ action, menu, category }) {
  if (!action) {
    return { error: "Action is required" };
  }

  if (action === "createCategory") {
    if (!category?.name || !category?.restaurantId) {
      return { error: "Category name and restaurant ID are required" };
    }

    const result = await sql(
      "INSERT INTO menu_categories (name, restaurant_id) VALUES ($1, $2) RETURNING *",
      [category.name, category.restaurantId]
    );

    return { success: true, category: result[0] };
  }

  if (action === "createMenuItem") {
    if (!menu?.name || !menu?.price || !menu?.categoryId) {
      return { error: "Name, price, and category ID are required" };
    }

    const result = await sql(
      "INSERT INTO menu_items (name, price, description, category_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [menu.name, menu.price, menu.description || null, menu.categoryId]
    );

    return { success: true, menuItem: result[0] };
  }

  if (action === "readMenuItems") {
    if (menu?.categoryId) {
      const result = await sql(
        "SELECT * FROM menu_items WHERE category_id = $1 ORDER BY name",
        [menu.categoryId]
      );
      return { menuItems: result };
    }

    if (menu?.restaurantId) {
      const result = await sql(
        "SELECT mi.* FROM menu_items mi JOIN menu_categories mc ON mi.category_id = mc.id WHERE mc.restaurant_id = $1 ORDER BY mi.name",
        [menu.restaurantId]
      );
      return { menuItems: result };
    }

    return { error: "Category ID or restaurant ID is required" };
  }

  if (action === "readCategories") {
    if (!menu?.restaurantId) {
      return { error: "Restaurant ID is required" };
    }

    const result = await sql(
      "SELECT * FROM menu_categories WHERE restaurant_id = $1 ORDER BY name",
      [menu.restaurantId]
    );
    return { categories: result };
  }

  if (action === "updateMenuItem") {
    if (!menu?.id) {
      return { error: "Menu item ID is required" };
    }

    const setValues = [];
    const queryParams = [];
    let paramCount = 1;

    if (menu.name) {
      setValues.push(`name = $${paramCount}`);
      queryParams.push(menu.name);
      paramCount++;
    }
    if (menu.price !== undefined) {
      setValues.push(`price = $${paramCount}`);
      queryParams.push(menu.price);
      paramCount++;
    }
    if (menu.description !== undefined) {
      setValues.push(`description = $${paramCount}`);
      queryParams.push(menu.description);
      paramCount++;
    }
    if (menu.categoryId) {
      setValues.push(`category_id = $${paramCount}`);
      queryParams.push(menu.categoryId);
      paramCount++;
    }

    queryParams.push(menu.id);
    const query = `UPDATE menu_items SET ${setValues.join(
      ", "
    )} WHERE id = $${paramCount} RETURNING *`;

    const result = await sql(query, queryParams);
    return { success: true, menuItem: result[0] };
  }

  if (action === "updateCategory") {
    if (!category?.id || !category?.name) {
      return { error: "Category ID and name are required" };
    }

    const result = await sql(
      "UPDATE menu_categories SET name = $1 WHERE id = $2 RETURNING *",
      [category.name, category.id]
    );
    return { success: true, category: result[0] };
  }

  if (action === "deleteMenuItem") {
    if (!menu?.id) {
      return { error: "Menu item ID is required" };
    }

    await sql("DELETE FROM menu_items WHERE id = $1", [menu.id]);
    return { success: true };
  }

  if (action === "deleteCategory") {
    if (!category?.id) {
      return { error: "Category ID is required" };
    }

    await sql.transaction(async (sql) => {
      await sql("DELETE FROM menu_items WHERE category_id = $1", [category.id]);
      await sql("DELETE FROM menu_categories WHERE id = $1", [category.id]);
    });

    return { success: true };
  }

  return { error: "Invalid action" };
}
export async function POST(request) {
  return handler(await request.json());
}