async function handler({ restaurantId }) {
  if (!restaurantId) {
    return { error: "Restaurant ID is required" };
  }

  try {
    const result = await sql`
      SELECT hours FROM restaurants WHERE id = ${restaurantId}
    `;

    if (!result.length) {
      return { error: "Restaurant not found" };
    }

    const hours = result[0].hours;
    const [startTime, endTime] = hours.split("-").map((time) => time.trim());

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Parse opening hours
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    // Convert all times to minutes since midnight
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    const startTimeInMinutes = startHour * 60 + (startMinute || 0);
    const endTimeInMinutes = endHour * 60 + (endMinute || 0);

    let isOpen = false;

    // Handle cases where closing time is on the next day
    if (endTimeInMinutes <= startTimeInMinutes) {
      // Restaurant closes after midnight
      if (
        currentTimeInMinutes >= startTimeInMinutes ||
        currentTimeInMinutes <= endTimeInMinutes
      ) {
        isOpen = true;
      }
    } else {
      // Normal case - same day
      if (
        currentTimeInMinutes >= startTimeInMinutes &&
        currentTimeInMinutes <= endTimeInMinutes
      ) {
        isOpen = true;
      }
    }

    return { isOpen };
  } catch (error) {
    console.error("Error checking restaurant status:", error);
    return { error: "Failed to check restaurant status" };
  }
}
export async function POST(request) {
  return handler(await request.json());
}