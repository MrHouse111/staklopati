async function handler({ id, name, city, hours, phone }) {
  if (!id) {
    return { error: "Restaurant ID is required" };
  }

  const setValues = [];
  const queryParams = [];
  let paramCount = 1;

  if (name) {
    setValues.push(`name = $${paramCount}`);
    queryParams.push(name);
    paramCount++;
  }
  if (city) {
    setValues.push(`city = $${paramCount}`);
    queryParams.push(city);
    paramCount++;
  }
  if (hours) {
    setValues.push(`hours = $${paramCount}`);
    queryParams.push(hours);
    paramCount++;
  }
  if (phone) {
    setValues.push(`phone = $${paramCount}`);
    queryParams.push(phone);
    paramCount++;
  }

  if (setValues.length === 0) {
    return { error: "At least one field must be provided for update" };
  }

  queryParams.push(id);
  const query = `UPDATE restaurants SET ${setValues.join(
    ", "
  )} WHERE id = $${paramCount} RETURNING *`;

  try {
    const result = await sql(query, queryParams);
    if (result.length === 0) {
      return { error: "Restaurant not found" };
    }
    return { success: true, restaurant: result[0] };
  } catch (error) {
    return { error: "Failed to update restaurant" };
  }
}
export async function POST(request) {
  return handler(await request.json());
}