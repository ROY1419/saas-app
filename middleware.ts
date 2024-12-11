import { authMiddleware, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const publicRoutes = ["./", "/api/webhook/register", "/sign-up", "/sign-in"];
export default authMiddleware({
  publicRoutes,
  async afterAuth(
    auth: { userId: any },
    req: { nextUrl: { pathname: string }; url: string | URL | undefined }
  ) {
    if (!auth.userId && !publicRoutes.includes(req.nextUrl.pathname)) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
    try {
      if (auth.userId) {
        const user = await clerkClient.users.getUser(auth.userId);
        const role = (await user.publicMetaData.role) as string | undefined;
        if (role === "admin" && req.nextUrl.pathname === "/dashboard") {
          return NextResponse.redirect(new URL("/admin/dasboard", req.url));
        }
        //privent non admin user to access admin routes
        if (role === "admin" && req.nextUrl.pathname.startsWith("/admin")) {
          return NextResponse.redirect(new URL("/dashboard", req.url));
        }
        //redrect auth user trying to access public route
        if (publicRoutes.includes(req.nextUrl.pathname)) {
          return NextResponse.redirect(
            new URL(
              role === "admin" ? "/admin/dashboard" : "/dashboard",
              req.url
            )
          );
        }
      }
    } catch (error) {
      console.error("Error fetching user data from Clerk:", error);
      return NextResponse.redirect(new URL("/error", req.url));
    }
  },
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
