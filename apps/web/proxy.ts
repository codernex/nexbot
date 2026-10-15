import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
export default async function proxy(req: NextRequest) {
  const protectedRoutes = ["/dashboard"];


  const path = req.nextUrl.pathname;
  console.log("TCL: proxy -> path", path)

  if (!protectedRoutes.includes(path)) {
    return NextResponse.next();
  }
  const token = (await cookies()).get("access_token");
  console.log("TCL: proxy -> token", token)

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
