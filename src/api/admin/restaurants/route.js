async function handler({ action, restaurant }) {
  if (!action) {
    return { error: "Action is required" };
  }

  if (action === "create") {
    if (!restaurant?.name || !restaurant?.city || !restaurant?.address) {
      return { error: "Name, city, and address are required" };
    }

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

    return { success: true, restaurant: result[0] };
  }

  if (action === "read") {
    if (restaurant?.id) {
      const result = await sql("SELECT * FROM restaurants WHERE id = $1", [
        restaurant.id,
      ]);
      return { restaurant: result[0] };
    }

    const result = await sql("SELECT * FROM restaurants ORDER BY name");
    return { restaurants: result };
  }

  if (action === "update") {
    if (!restaurant?.id) {
      return { error: "Restaurant ID is required" };
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
    return { success: true, restaurant: result[0] };
  }

  if (action === "delete") {
    if (!restaurant?.id) {
      return { error: "Restaurant ID is required" };
    }

    await sql("DELETE FROM restaurants WHERE id = $1", [restaurant.id]);
    return { success: true };
  }

  return { error: "Invalid action" };
}
export async function POST(request) {
  return handler(await request.json());
}