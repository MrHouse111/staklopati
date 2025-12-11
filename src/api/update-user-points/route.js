async function handler({ deviceId, points }) {
  if (!deviceId) {
    return { error: "Device ID is required" };
  }

  if (typeof points !== "number") {
    return { error: "Points must be a number" };
  }

  const result = await sql.transaction(async (sql) => {
    const updated = await sql(
      "UPDATE user_points SET points = points + $1, last_updated = NOW() WHERE device_id = $2 RETURNING points, level",
      [points, deviceId]
    );

    if (updated.length === 0) {
      const newUser = await sql(
        "INSERT INTO user_points (device_id, points, last_updated) VALUES ($1, $2, NOW()) RETURNING points, level",
        [deviceId, points]
      );
      return newUser[0];
    }

    return updated[0];
  });

  return {
    points: result.points,
    level: result.level,
  };
}
export async function POST(request) {
  return handler(await request.json());
}