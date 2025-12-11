async function handler({ code, redirect_uri }) {
  if (!code) {
    return {
      url: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${redirect_uri}&response_type=code&scope=email profile&access_type=offline`,
    };
  }

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri,
      grant_type: "authorization_code",
    }),
  });

  const { access_token } = await tokenResponse.json();

  const userResponse = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    {
      headers: { Authorization: `Bearer ${access_token}` },
    }
  );

  const userData = await userResponse.json();

  const session = getSession();
  if (session?.user?.id) {
    return { success: true, user: session.user };
  }

  return {
    success: true,
    user: {
      email: userData.email,
      name: userData.name,
      picture: userData.picture,
    },
  };
}
export async function POST(request) {
  return handler(await request.json());
}