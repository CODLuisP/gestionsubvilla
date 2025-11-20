"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Despacho {
  fecini: string;
  fecfin: string | null;
}

interface Conductor {
  nombre: string;
}

interface VueltaData {
  codunidad: string;
  conductor: Conductor;
  listaDespachos: Despacho[];
}

export default function ReporteVueltasPage() {
  const [fecha, setFecha] = useState<string>("");
  const [ruta, setRuta] = useState<string>("25");
  const [data, setData] = useState<VueltaData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const handleSearch = async () => {
    if (!fecha) return;

    setLoading(true);
    setHasSearched(true);
    try {
      // Format date from yyyy-MM-dd to dd/MM/yyyy
      const [year, month, day] = fecha.split("-");
      const formattedDate = `${day}/${month}/${year}`;
      
      // The API requires ruta=25 always, as per instructions
      const response = await fetch(
        `https://villa.velsat.pe:8443/api/Caja/vueltas?fecha=${encodeURIComponent(
          formattedDate
        )}&ruta=25`
      )

      if (!response.ok) {
        throw new Error("Error fetching data");
      }

      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate the maximum number of vueltas to determine table columns
  const maxVueltas = data.reduce(
    (max, item) => Math.max(max, item.listaDespachos?.length || 0),
    0
  );

  return (
    <div className="flex flex-col gap-4 p-4">
 

      <div className="flex flex-col gap-4 md:flex-row md:items-end bg-white p-4 border shadow-sm">
        <div className="grid  max-w-sm items-center gap-1.5">
          <label htmlFor="fecha" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Fecha
          </label>
          <Input
            type="date"
            id="fecha"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </div>

        <div className="grid max-w-sm items-center gap-1.5">
          <label htmlFor="ruta" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Ruta
          </label>
          <Select value={ruta} onValueChange={setRuta}>
            <SelectTrigger id="ruta" className="w-full md:w-[280px]">
              <SelectValue placeholder="Seleccione ruta" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="25">1384 B - Chorrillos - VMT</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleSearch} disabled={loading || !fecha} >
          {loading ? (
            "Buscando..."
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" /> Buscar
            </>
          )}
        </Button>
      </div>

      <div className="border bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-50">
                <TableHead rowSpan={2} className="w-[50px] text-center font-bold text-primary border-r">Item</TableHead>
                <TableHead rowSpan={2} className="w-[100px] font-bold text-primary border-r">Unidad</TableHead>
                <TableHead rowSpan={2} className="min-w-[200px] font-bold text-primary border-r">Conductor</TableHead>
                {Array.from({ length: maxVueltas }).map((_, index) => (
                  <TableHead key={index} colSpan={2} className="text-center font-bold text-primary bg-blue-50/50 border-b border-r last:border-r-0">
                    Vuelta {index + 1}
                  </TableHead>
                ))}
              </TableRow>
              <TableRow className="bg-blue-50">
                {Array.from({ length: maxVueltas }).map((_, index) => (
                  <React.Fragment key={`header-${index}`}>
                    <TableHead className="text-center text-xs font-semibold text-gray-800 bg-blue-50/30 border-r h-8">
                      Inicio
                    </TableHead>
                    <TableHead className="text-center text-xs font-semibold text-gray-800 bg-blue-50/30 border-r last:border-r-0 h-8">
                      Fin
                    </TableHead>
                  </React.Fragment>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length > 0 ? (
                data.map((item, index) => (
                  <TableRow key={index} className="hover:bg-muted/50">
                    <TableCell className="text-center font-medium text-muted-foreground border-r">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-medium text-orange-500 border-r">
                      <span className="px-2 py-0.5 rounded text-xs font-bold text-gray-600 uppercase">
                        {item.codunidad}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground font-medium uppercase border-r">
                      {item.conductor?.nombre || "-"}
                    </TableCell>
                    {Array.from({ length: maxVueltas }).map((_, vIndex) => {
                      const despacho = item.listaDespachos?.[vIndex];
                      return (
                        <React.Fragment key={`vuelta-${index}-${vIndex}`}>
                          <TableCell className="text-center border-r p-0">
                            {despacho ? (
                              <div className="py-2 px-1 text-xs font-mono text-slate-600">
                                {despacho.fecini}
                              </div>
                            ) : null}
                          </TableCell>
                          <TableCell className="text-center border-r p-0">
                            {despacho ? (
                              <div className="py-2 px-1 text-xs font-mono text-slate-600">
                                {despacho.fecfin || "-"}
                              </div>
                            ) : null}
                          </TableCell>
                        </React.Fragment>
                      );
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={3 + (maxVueltas * 2)}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {hasSearched ? "No se encontraron resultados." : "Seleccione una fecha y haga clic en Buscar."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}