// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const { login, clave } = await request.json();

  const validUser = "etudvrb";
  const validPassword = "123";

  if (login === validUser && clave === validPassword) {
    // Set cookie por 1 hora
    (await
      // Set cookie por 1 hora
      cookies()).set("auth", "true", {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60,
    });

    return NextResponse.json({ message: "Login exitoso" }, { status: 200 });
  }

  return NextResponse.json({ message: "Credenciales inválidas" }, { status: 401 });
}
