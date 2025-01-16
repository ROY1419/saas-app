import { withClerkMiddleware, getAuth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const publicRoutes = ["/", "/api/webhook/register", "/sign-up", "/sign-in"];

export default withClerkMiddleware(async (req:any) => {
  const { userId } = getAuth(req);

  // If the route is public, allow access
  if (publicRoutes.includes(req.nextUrl.pathname)) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to the sign-in page
  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  try {
    const user = await clerkClient.Users.getUser(userId);
    const role = user.publicMetadata.role as string | undefined;

    if (role === "admin") {
      if (req.nextUrl.pathname === "/dashboard") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
      if (!req.nextUrl.pathname.startsWith("/admin")) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    } else {
      if (req.nextUrl.pathname.startsWith("/admin")) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // Redirect authenticated users trying to access public routes
    if (publicRoutes.includes(req.nextUrl.pathname)) {
      return NextResponse.redirect(
        new URL(role === "admin" ? "/admin/dashboard" : "/dashboard", req.url)
      );
    }
  } catch (error) {
    console.error("Error fetching user data from Clerk:", error);
    return NextResponse.redirect(new URL("/error", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};