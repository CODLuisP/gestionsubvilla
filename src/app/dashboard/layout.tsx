"use client";
import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
 import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
   SidebarTrigger,
} from "@/components/ui/sidebar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
   DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Toaster } from "sonner";

const breadcrumbMap: Record<string, { parent: string; current: string }> = {
  "/dashboard": {
    parent: "Inicio",
    current: "Panel de control",
  },
  "/dashboard/gestioncaja": {
    parent: "Gestión Caja",
    current: "E.T. “La Unidad De Villa” S.A. | Ruta 7504",
  },
  "/dashboard/conductores": {
    parent: "Gestión de Conductores",
    current: "Control Despacho",
  },

    "/dashboard/unidades": {
    parent: "Despacho Unidades",
    current: "Control Despacho",
  },

    "/dashboard/controlDespacho": {
    parent: "Control Despacho",
    current: "Control Despacho",
  },
  
  
    "/dashboard/reporteVueltas": {
    parent: "Reporte de Vueltas",
    current: "Reporte Vueltas",
  },
};

export default function Page({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const breadcrumb = breadcrumbMap[pathname] || {
    parent: "Gestión de Unidades",
    current: "Control Despacho",
  };

  // const router = useRouter();

  // const handleLogout = async () => {
  //   await fetch("/api/auth/logout", {
  //     method: "POST",
  //   });

  //   toast.success("Sesión cerrada");
  //   router.push("/");
  // };

  return (
    <SidebarProvider>
       <AppSidebar /> 

      <Toaster richColors />

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 bg-blue-600 dark:bg-blue-950 border-b border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1 text-orange-50 dark:text-blue-400 " />
            <Separator
              orientation="vertical"
              className="mr-2 h-4 bg-blue-200 dark:bg-blue-700"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink className="text-[#ffbe0b] dark:text-blue-400 text-[14px] font-semibold">
                    {breadcrumb.parent}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {/* <BreadcrumbSeparator className="hidden md:block text-white" />
                <BreadcrumbItem>
                  <BreadcrumbLink
                    href="/dashboard/unidades"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-50 text-[14px] dark:text-white font-semibold"
                  >
                    {breadcrumb.current}
                  </BreadcrumbLink>
                </BreadcrumbItem> */}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="px-4 flex gap-2">
            <ModeToggle />
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-8 w-8 cursor-pointer border border-white rounded">
                    <AvatarImage
                      src="/avatar.jpg"
                      alt="Usuario"
                      className="rounded-none"
                    />
                    <AvatarFallback className="rounded-none"></AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                   <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Perfil</DropdownMenuItem>
                <DropdownMenuItem>Configuración</DropdownMenuItem>
                <DropdownMenuSeparator /> 
                  {/* <DropdownMenuItem
                    className="text-red-600"
                    onClick={handleLogout}
                  >
                    Cerrar sesión
                  </DropdownMenuItem> */}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}