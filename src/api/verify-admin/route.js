async function handler({ password }) {
  if (!password) {
    return { success: false, error: "Lozinka je obavezna" };
  }

  if (password === "12345") {
    return { success: true };
  }

  return { success: false, error: "Pogrešna admin lozinka" };
}
export async function POST(request) {
  return handler(await request.json());
}