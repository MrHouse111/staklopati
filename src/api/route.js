function handler({ type }) {
  const menu = {
    restaurantInfo: {
      name: "NJAM NJAM UKI",
      address: "Nova Pazova, Cara Dušana 101 (kod benzinske pumpe)",
      phone: "063.830.76.97",
      social: {
        instagram: "njamnjamrostilj",
        facebook: "NJAM NJAM UKI",
      },
      delivery: {
        free: "BESPLATNA DOSTAVA za iznos preko 500 din.",
        areas: "Stara Pazova, Vojka, Belegiš za iznos preko 2.500 din.",
      },
    },
    categories: {
      breakfast: {
        name: "DORUČAK (do 12h)",
        items: [
          {
            name: "JAJA SA SLANINOM",
            description:
              "JAJA 3 kom. SLANINA 100g, PAVLAKA, SALATA, SOMUN, JOGURT",
            price: 450,
          },
          {
            name: "JAJA SA KOBASICOM",
            description:
              "JAJA 3 kom. KOBASICA 100g, PAVLAKA, SALATA, SOMUN, JOGURT",
            price: 450,
          },
          {
            name: "MLET SA SLANINOM",
            description: "PAVLAKA, SOMUN, SALATA, JOGURT",
            price: 450,
          },
          {
            name: "PROFNE PUNJENE ČOKOLADOM",
            price: 100,
          },
        ],
      },
      sandwiches: {
        name: "SENDVIČI",
        items: [
          {
            name: "Njam Njam Sendvič",
            description:
              "šim. pečenica, kačkavalj, pomfrit, jaja 2 kom, prilozi po želji",
            price: 500,
          },
          {
            name: "PEČENICA SA KAČKAVALJEM",
            description: "PEČENICA, RENDANI KAČKAVALJ",
            price: 400,
          },
          {
            name: "KULEN SA KAČKAVALJEM",
            description: "KULEN, RENDANI KAČKAVALJ",
            price: 400,
          },
          {
            name: "SLANINA SA KAČKAVALJEM",
            description: "SLANINA, RENDANI KAČKAVALJ",
            price: 450,
          },
          {
            name: "TUNJEVINA",
            description: "TUNJEVINA, POMFRIT, PRILOZI",
            price: 350,
          },
        ],
      },
      grill: {
        name: "ROSTILJ/Kg",
        items: [
          {
            name: "MEŠANO MESO",
            description:
              "Ćevapi, uštipci, kobasice, vrat, batak, file, rolovani pileći ražnjići",
            price: 1250,
          },
          { name: "ĆEVAPI", price: 1250 },
          { name: "FILE-PILEĆI", price: 1250 },
          { name: "BATAK-BK", price: 1250 },
          { name: "KRILCA BEZ KRAJEVA", price: 750 },
          { name: "PILEĆI ROLOVANI RAŽNJIĆI", price: 1500 },
          { name: "SVINJSKI VRAT-BK", price: 1500 },
          { name: "DIMLJENA KOBASICA", price: 1500 },
          { name: "ROLOVANI CEVAPI", price: 1500 },
          { name: "USTIPCI", price: 1500 },
          { name: "DIMLJENA SLANINA", price: 1500 },
          { name: "DIMLJENI VRAT", price: 1500 },
          { name: "PILECA KARAĐORĐEVA", price: 1700 },
          { name: "MINI PILEĆA KARAĐORĐEVA", price: 1700 },
          { name: "FILE-SUSAM", price: 1400 },
          { name: "BEČKA PILEĆA", price: 1400 },
        ],
      },
      burgers: {
        name: "PLJESKAVICE",
        items: [
          { name: "MALA", description: "140g", price: 280 },
          { name: "VELIKA", description: "200g", price: 350 },
          { name: "MEGA", description: "300g", price: 450 },
          { name: "SLONOVO UVO", description: "400g", price: 550 },
          { name: "GURMANSKA", description: "300g", price: 450 },
          { name: "PUNJENA", description: "250g", price: 500 },
          { name: "PLJESKAVICA SA LUKOM", description: "250g", price: 450 },
          { name: "PLJESKAVICA SA KAJMAKOM", description: "200g", price: 430 },
          { name: "NJAM NJAM PLJESKAVICA", description: "250g", price: 500 },
          { name: "USTIPCI", description: "250g", price: 500 },
        ],
      },
      sides: {
        name: "PRILOZI",
        items: [
          { name: "POHOVANI KAČKAVALJ", description: "100g", price: 150 },
          { name: "RENDANI KAČKAVALJ", description: "100g", price: 100 },
          { name: "PEČENA PAPRIKA", description: "1kom", price: 50 },
          { name: "KAJMAK", price: 80 },
          {
            name: "SOS",
            description: "LJUTENICA, TARTAR, RUSKA, ČAČKI",
            price: 150,
          },
          { name: "SOMUN", price: 70 },
          { name: "SOMUN SA PRILOZIMA", price: 150 },
          { name: "SALATA-SEZONSKA-MALA", price: 200 },
          { name: "SALATA-SEZONSKA-VELIKA", price: 300 },
        ],
      },
      fries: {
        name: "POMFRIT / PEKARSKI KROMPIR",
        items: [
          { name: "MALI", description: "200g", price: 200 },
          { name: "SREDNJI", description: "300g", price: 250 },
          { name: "VELIKI", description: "500g", price: 300 },
        ],
      },
      drinks: {
        name: "PIĆA",
        items: [
          { name: "COCA-COLA", description: "1.5L", price: 170 },
          { name: "SOKOVI", description: "0.5L", price: 130 },
        ],
      },
    },
    promotions: [
      "Za porudžbine preko 3.000 din. COCA-COLA GRATIS!",
      "MOGUĆNOST PLAĆANJA PREKO RAČUNA",
      "100% DOMAĆE",
    ],
  };

  return menu;
}
export async function POST(request) {
  return handler(await request.json());
}