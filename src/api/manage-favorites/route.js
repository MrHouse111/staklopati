async function handler({ action, deviceId, itemName, restaurant, city }) {
  if (!deviceId) {
    return { error: "Device ID is required" };
  }

  if (action === "add") {
    await sql.transaction(async (sql) => {
      await sql(
        "INSERT INTO favorites (device_id, item_name, restaurant, city) VALUES ($1, $2, $3, $4)",
        [deviceId, itemName, restaurant, city]
      );

      await sql(
        "UPDATE user_points SET points = points + 5 WHERE device_id = $1",
        [deviceId]
      );
    });

    return { success: true, message: "Dodato u omiljena jela" };
  }

  if (action === "remove") {
    await sql(
      "DELETE FROM favorites WHERE device_id = $1 AND item_name = $2 AND restaurant = $3",
      [deviceId, itemName, restaurant]
    );

    return { success: true, message: "Uklonjeno iz omiljenih jela" };
  }

  if (action === "list") {
    const favorites = await sql(
      "SELECT * FROM favorites WHERE device_id = $1",
      [deviceId]
    );

    return { favorites };
  }

  return { error: "Invalid action" };
}
export async function POST(request) {
  return handler(await request.json());
}