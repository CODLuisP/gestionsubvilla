"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();


  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      toast.error("Por favor, completa todos los campos.");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Iniciando sesión...");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ login: username, clave: password }),
      });

      if (!res.ok) throw new Error("Credenciales incorrectas");

      toast.success("¡Login exitoso!");
      router.push("/dashboard/unidades");
    } catch {
      toast.error("Usuario o contraseña incorrectos");
    } finally {
      toast.dismiss(toastId);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#dee2e6] px-4 ">
      <Card className="w-full max-w-md">
        <CardHeader className="bg-blue-600 text-white flex flex-col items-center rounded">
          <div className="mb-4 w-28 h-28 rounded-full bg-white p-2 flex items-center justify-center">
            <Image
            src="/logotipo.jpg"
            alt="Logo de la empresa"
            width={80}
            height={80}
            className="object-contain"
            priority
          />
          </div>
        <CardTitle className="text-xl font-bold">Iniciar Sesión</CardTitle>
        <CardDescription className="text-blue-100">Ingresa tus credenciales para acceder</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                type="text"
                placeholder="Tu usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 text-blue-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span className="sr-only">
                    {showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  </span>
                </Button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
            <div className="text-center">
              <Button
                type="button"
                variant="link"
                className="text-orange-500 hover:text-orange-600"
              >
                ¿Olvidaste tu contraseña?
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
