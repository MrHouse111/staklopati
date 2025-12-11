async function handler({ action, reward, userId, points }) {
  if (!action) {
    return { error: "Action is required" };
  }

  if (action === "createReward") {
    if (!reward?.name || !reward?.pointsRequired) {
      return { error: "Reward name and points required are needed" };
    }

    const result = await sql(
      "INSERT INTO rewards (name, points_required, description) VALUES ($1, $2, $3) RETURNING *",
      [reward.name, reward.pointsRequired, reward.description || null]
    );

    return { success: true, reward: result[0] };
  }

  if (action === "getRewards") {
    const result = await sql("SELECT * FROM rewards ORDER BY points_required");
    return { rewards: result };
  }

  if (action === "updateReward") {
    if (!reward?.id) {
      return { error: "Reward ID is required" };
    }

    const setValues = [];
    const queryParams = [];
    let paramCount = 1;

    if (reward.name) {
      setValues.push(`name = $${paramCount}`);
      queryParams.push(reward.name);
      paramCount++;
    }
    if (reward.pointsRequired !== undefined) {
      setValues.push(`points_required = $${paramCount}`);
      queryParams.push(reward.pointsRequired);
      paramCount++;
    }
    if (reward.description !== undefined) {
      setValues.push(`description = $${paramCount}`);
      queryParams.push(reward.description);
      paramCount++;
    }

    queryParams.push(reward.id);
    const query = `UPDATE rewards SET ${setValues.join(
      ", "
    )} WHERE id = $${paramCount} RETURNING *`;

    const result = await sql(query, queryParams);
    return { success: true, reward: result[0] };
  }

  if (action === "deleteReward") {
    if (!reward?.id) {
      return { error: "Reward ID is required" };
    }

    await sql("DELETE FROM rewards WHERE id = $1", [reward.id]);
    return { success: true };
  }

  if (action === "getUserPoints") {
    if (!userId) {
      return { error: "User ID is required" };
    }

    const result = await sql(
      "SELECT points, level FROM user_points WHERE device_id = $1",
      [userId]
    );
    return result[0] || { points: 0, level: "Bronze" };
  }

  if (action === "updateUserPoints") {
    if (!userId || points === undefined) {
      return { error: "User ID and points are required" };
    }

    let level = "Bronze";
    if (points >= 1000) level = "Gold";
    else if (points >= 500) level = "Silver";

    const result = await sql(
      "INSERT INTO user_points (device_id, level) VALUES ($1, $2) ON CONFLICT (device_id) DO UPDATE SET level = $2 RETURNING *",
      [userId, level]
    );

    return { success: true, userPoints: result[0] };
  }

  return { error: "Invalid action" };
}
export async function POST(request) {
  return handler(await request.json());
}