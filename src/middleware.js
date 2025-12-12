import { NextResponse } from "next/server";

export const config = {
  matcher: "/integrations/:path*",
};

export function middleware(request) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-createxyz-project-id", "7c2accdd-f7ab-4784-b6ea-ecf760ae01eb");
  requestHeaders.set("x-createxyz-project-group-id", "bbafd250-ce50-4bb9-9273-32d2cb23030b");


  request.nextUrl.href = `https://www.createanything.com/${request.nextUrl.pathname}`;

  return NextResponse.rewrite(request.nextUrl, {
    request: {
      headers: requestHeaders,
    },
  });
}