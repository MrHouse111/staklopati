async function handler() {
  const stats = await sql.transaction(async (sql) => {
    const userStats = await sql(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN level = 'Bronze' THEN 1 END) as bronze_users,
        COUNT(CASE WHEN level = 'Silver' THEN 1 END) as silver_users,
        COUNT(CASE WHEN level = 'Gold' THEN 1 END) as gold_users
      FROM user_points
    `);

    const restaurantStats = await sql(`
      SELECT COUNT(*) as total_restaurants,
      COUNT(DISTINCT city) as total_cities
      FROM restaurants
    `);

    const menuStats = await sql(`
      SELECT 
        COUNT(*) as total_items,
        COUNT(DISTINCT category_id) as total_categories
      FROM menu_items
    `);

    const rewardStats = await sql(`
      SELECT 
        COUNT(*) as total_rewards,
        AVG(points_required) as avg_points_required
      FROM rewards
    `);

    return {
      users: userStats[0],
      restaurants: restaurantStats[0],
      menu: menuStats[0],
      rewards: rewardStats[0],
    };
  });

  return {
    success: true,
    statistics: stats,
  };
}
export async function POST(request) {
  return handler(await request.json());
}