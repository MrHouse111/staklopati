async function handler({ deviceId }) {
  if (!deviceId) {
    return { error: "Device ID is required" };
  }

  const result = await sql.transaction(async (sql) => {
    const existingPoints = await sql(
      "SELECT points, level FROM user_points WHERE device_id = $1",
      [deviceId]
    );

    if (existingPoints.length > 0) {
      return {
        points: existingPoints[0].points,
        level: existingPoints[0].level,
      };
    }

    await sql(
      "INSERT INTO user_points (device_id, points, level) VALUES ($1, $2, $3)",
      [deviceId, 0, "Bronze"]
    );

    return {
      points: 0,
      level: "Bronze",
    };
  });

  return result;
}
export async function POST(request) {
  return handler(await request.json());
}