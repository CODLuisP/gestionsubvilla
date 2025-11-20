"use client";

import * as React from "react";
import {
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  SquareTerminal,
  Clock,
  DollarSign,
  BarChart3,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// This is sample data.
const data = {
  user: {
    
    name: "Transporvilla",
    email: "m@transporvilla.com",
    avatar: "/avatar.jpg",
  },
  teams: [
    {
      name: "VELSAT",
      logo: GalleryVerticalEnd,
      plan: "Usuario: Etudvrb",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Gestión Despacho",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Control Despacho",
          url: "/dashboard/controlDespacho",
        },
        {
          title: "Despacho Unidades",
          url: "/dashboard/unidades",
        },
        {
          title: "Reporte Vueltas",
          url: "/dashboard/reporteVueltas",
        },
 
      ],
    },
        {
      title: "Administración",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Gestión Unidades",
          url: "/dashboard/gestionunidades",
        },
        {
          title: "Gestión Conductores",
          url: "/dashboard/conductores",
        },
 
      ],
    },
    // {
    //   title: "Pagos",
    //   url: "#",
    //   icon: Bot,
    //   items: [
    //     {
    //       title: "Registrar pago",
    //       url: "#",
    //     },
    //     {
    //       title: "Pagos pendientes",
    //       url: "#",
    //     },
    //     {
    //       title: "Pagos realizados",
    //       url: "#",
    //     },
    //   ],
    // },
    // {
    //   title: "Reportes",
    //   url: "#",
    //   icon: BookOpen,
    //   items: [
    //     {
    //       title: "Reporte diario de caja",
    //       url: "#",
    //     },
    //     {
    //       title: "Reporte por rango de fechas",
    //       url: "#",
    //     },

    //   ],
    // },
    // {
    //   title: "Usuarios",
    //   url: "#",
    //   icon: Settings2,
    //   items: [
    //     {
    //       title: "Gestión Usuarios",
    //       url: "#",
    //     },
    //     {
    //       title: "Add Usuario",
    //       url: "#",
    //     },
    //   ],
    // },
  ],

  quickAccess: [
    {
      title: "Cobro rápido",
      url: "#",
      icon: DollarSign,
    },
    {
      title: "Cierre de caja",
      url: "#",
      icon: Clock,
    },
    {
      title: "Resumen diario",
      url: "#",
      icon: BarChart3,
    },
  ],
  stats: {
    cajaHoy: 1250.75,
    pendientes: 8,
    completados: 42,
    progreso: 84,
  },
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="bg-sidebar">
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      {/* <SidebarSeparator /> */}

       {/* <SidebarGroup>
          <div className="group-data-[collapsible=icon]:hidden">

        <SidebarGroupLabel>Resumen de Caja</SidebarGroupLabel>
        <SidebarGroupContent>
          <div className="px-2 py-1 space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-white">Caja hoy:</span>
              <span className="font-medium">S/. {data.stats.cajaHoy.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-white">Pendientes:</span>
              <span className="font-medium">{data.stats.pendientes}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-white">Completados:</span>
              <span className="font-medium">{data.stats.completados}</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground text-white">Meta diaria</span>
                <span>{data.stats.progreso}%</span>
              </div>
              <Progress value={data.stats.progreso} className="h-1.5" />
            </div>
          </div>
        </SidebarGroupContent>
          </div>

      </SidebarGroup> */}

      {/* <SidebarGroup>
        <div className="mt-auto px-2 py-2 flex justify-center group-data-[collapsible=icon]:hidden ">
          <div className="relative w-full aspect-square max-w-[160px] rounded overflow-hidden bg-sidebar-accent/30">
            <Image
              src="/cobros.png"
              alt="Sistema de Gestión de Caja"
              className="w-full h-full object-cover opacity-30"
              width={200}
              height={200}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-semibold text-center px-2">
                SISTEMA DE GESTIÓN DE CAJA
              </span>
            </div>
          </div>
        </div>
      </SidebarGroup> */}
      {/* Accesos Rápidos */}

      {/* <SidebarSeparator /> */}

      {/* <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter> */}
      <SidebarRail />
    </Sidebar>
  );
}
