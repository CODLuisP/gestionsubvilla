"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { format } from "date-fns";

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
  const [ruta, setRuta] = useState<string>("5");
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
      
      // The API requires ruta=5 always, as per instructions
      const response = await fetch(
        `https://villa.velsat.pe:8443/api/Caja/vueltas?fecha=${encodeURIComponent(
          formattedDate
        )}&ruta=5`
      );

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
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Reporte Vueltas</h1>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-end bg-white p-4 rounded-lg border shadow-sm">
        <div className="grid w-full max-w-sm items-center gap-1.5">
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

        <div className="grid w-full max-w-sm items-center gap-1.5">
          <label htmlFor="ruta" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Ruta
          </label>
          <Select value={ruta} onValueChange={setRuta}>
            <SelectTrigger id="ruta" className="w-full md:w-[280px]">
              <SelectValue placeholder="Seleccione ruta" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">1384-choriilos-vmt</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleSearch} disabled={loading || !fecha} className="w-full md:w-auto">
          {loading ? (
            "Buscando..."
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" /> Buscar
            </>
          )}
        </Button>
      </div>

      <div className="rounded-md border bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="w-[50px] text-center font-bold text-primary">ITEM</TableHead>
                <TableHead className="w-[100px] font-bold text-primary">Unidad</TableHead>
                <TableHead className="min-w-[200px] font-bold text-primary">Conductor</TableHead>
                {Array.from({ length: maxVueltas }).map((_, index) => (
                  <TableHead key={index} className="text-center font-bold text-primary min-w-[120px] bg-blue-50/50 border-l">
                    Vuelta {index + 1}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length > 0 ? (
                data.map((item, index) => (
                  <TableRow key={index} className="hover:bg-muted/50">
                    <TableCell className="text-center font-medium text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-medium text-orange-500">
                      <span className="bg-orange-100 px-2 py-0.5 rounded text-xs font-bold border border-orange-200">
                        {item.codunidad}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground font-medium uppercase">
                      {item.conductor?.nombre || "-"}
                    </TableCell>
                    {Array.from({ length: maxVueltas }).map((_, vIndex) => {
                      const despacho = item.listaDespachos?.[vIndex];
                      return (
                        <TableCell key={vIndex} className="text-center border-l p-0">
                          {despacho ? (
                            <div className="flex justify-center items-center h-full w-full py-2 px-1">
                              <div className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded font-mono border border-slate-200 whitespace-nowrap">
                                {despacho.fecini} {despacho.fecfin ? `- ${despacho.fecfin}` : ""}
                              </div>
                            </div>
                          ) : null}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={3 + maxVueltas}
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
