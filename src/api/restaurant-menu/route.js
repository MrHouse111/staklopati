async function handler({ restaurantId }) {
  if (!restaurantId) {
    return { error: "Restaurant ID je obavezan" };
  }

  try {
    const menuItems = await sql`
      SELECT rm.*, r.name as restaurant_name 
      FROM restaurant_menu rm 
      JOIN restaurants r ON r.id = rm.restaurant_id 
      WHERE rm.restaurant_id = ${restaurantId}
      ORDER BY rm.category, rm.item_name,
      CASE 
        WHEN rm.size = 'Porodična' THEN 1
        WHEN rm.size = 'Standard' THEN 2
        WHEN rm.size = 'Srednja' THEN 3
        WHEN rm.size = 'Mini' THEN 4
        ELSE 5
      END
    `;

    if (!menuItems.length) {
      return { menu: {}, restaurantName: null };
    }

    const menuByCategory = menuItems.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }

      const existingItem = acc[item.category].find(
        (i) => i.name === item.item_name
      );

      if (existingItem) {
        if (!existingItem.sizes) {
          existingItem.sizes = [
            {
              size: existingItem.portion || existingItem.size,
              price: existingItem.price,
            },
          ];
          delete existingItem.price;
          delete existingItem.portion;
        }
        existingItem.sizes.push({
          size: item.portion || item.size,
          price: item.price,
        });
      } else {
        const menuItem = {
          name: item.item_name,
          description: item.description,
        };

        if (item.size || item.category === "Pizza") {
          menuItem.sizes = [
            {
              size: item.portion || item.size,
              price: item.price,
            },
          ];
        } else {
          menuItem.price = item.price;
          menuItem.portion = item.portion;
        }

        acc[item.category].push(menuItem);
      }

      return acc;
    }, {});

    return {
      restaurantName: menuItems[0].restaurant_name,
      menu: menuByCategory,
    };
  } catch (error) {
    return { error: "Problem sa dobijanjem menija" };
  }
}
export async function POST(request) {
  return handler(await request.json());
}