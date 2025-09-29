// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  // Elimina la cookie "auth"
  (await
        // Elimina la cookie "auth"
        cookies()).set("auth", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0, // Expira inmediatamente
  });

  return NextResponse.json({ message: "Logout exitoso" }, { status: 200 });
}
