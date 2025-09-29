"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import axios from "axios";
import ModalDespacho from "@/components/modal/dispatch-modal";
import FrecuenciaModal from "@/components/modal/frecuencia-modal";
import CancelDispatchModal from "@/components/modal/cancel-dispatch-modal";

type DispatchItem = {
  unit: string;
  driver: string;
  status: string;
  time: string;
  rawTime: number;
  code: number;
  count?: string;
};

type Route = {
  label: string;
  value: string;
};

type Conductor = {
  nombre?: string;
  apepate?: string;
};

type Carro = {
  codunidad?: string;
};

type Unit = {
  codunidad: string;
  conductor?: Conductor;
};

type ApiDispatchItem = {
  carro?: Carro;
  conductor?: Conductor;
  ultimocontrol?: string;
  fecini: number;
  codigo: number;
};

type ApiRoute = {
  nombre: string;
  codigo: string;
};

export default function DispatchManagement() {
  const [actualizar, setActualizar] = useState(false);
  const [actualizarDelete, setActualizarDelete] = useState(false);

  const [searchUnit, setSearchUnit] = useState("");
  const [selectedRoute, setSelectedRoute] = useState("7504");
  const [loading, setLoading] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(false);

  const [dispatches, setDispatches] = useState<DispatchItem[]>([]);
  const [horaIni, setHoraIni] = useState<string>("");

  const [availableUnits, setAvailableUnits] = useState<Unit[]>([]);

  const fetchUnits = async () => {
    setLoadingUnits(true);
    try {
      const response = await fetch(
        "https://villa.velsat.pe:8443/api/Caja/unidadesDisp/etudvrb"
      );
      const data: Unit[] = await response.json();
      setAvailableUnits(data);
    } catch (error) {
      console.error("Error al obtener unidades:", error);
    } finally {
      setLoadingUnits(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, [actualizar, actualizarDelete]);

  const [routes, setRoutes] = useState<Route[]>([]);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await axios.get<ApiRoute[]>(
          "https://villa.velsat.pe:8443/api/Caja/Rutas/etudvrb"
        );
        const data = response.data;
        const formatted: Route[] = data.map((ruta: ApiRoute) => ({
          label: ruta.nombre,
          value: ruta.codigo,
        }));
        setRoutes(formatted);
        if (formatted.length > 0) {
          setSelectedRoute(formatted[0].value);
        }
      } catch (error) {
        console.error("Error al obtener rutas:", error);
      }
    };

    fetchRoutes();
  }, []);

  useEffect(() => {
    const selected = routes.find((r) => r.value === selectedRoute);
    if (selected) {
      console.log("Ruta seleccionada:", selected.label);
      console.log("Código:", selected.value);
    }
  }, [selectedRoute, routes]);

  useEffect(() => {
    if (!selectedRoute) return;

    let isCancelled = false;
    setLoading(true);

    fetch(
      `https://villa.velsat.pe:8443/api/Caja/despachoIni?codruta=${selectedRoute}`
    )
      .then((res) => res.json())
      .then((data: ApiDispatchItem[]) => {
        if (isCancelled) return;

        if (data.length > 0 && data[0].fecini) {
          const firstHoraIni = new Date(
            data[0].fecini * 1000
          ).toLocaleTimeString("es-PE", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });
          setHoraIni(firstHoraIni);
        } else {
          setHoraIni("");
        }

        const processed: DispatchItem[] = data.map((item: ApiDispatchItem) => ({
          unit: item.carro?.codunidad || "",
          driver: item.conductor?.nombre || "",
          status: item.ultimocontrol || "",
          time: new Date(item.fecini * 1000).toLocaleTimeString("es-PE", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          rawTime: item.fecini,
          code: item.codigo,
        }));

        const withFrequency: DispatchItem[] = processed.map(
          (item: DispatchItem, index: number, arr: DispatchItem[]) => {
            if (index === arr.length - 1) return { ...item, count: "0 min" };
            const nextTime = arr[index + 1].rawTime;
            const freq = Math.round((item.rawTime - nextTime) / 60);
            return { ...item, count: `${freq} min` };
          }
        );

        setDispatches(withFrequency);
      })
      .catch((err) => {
        if (!isCancelled) {
          console.error("Error cargando despachos:", err);
          setDispatches([]);
          setHoraIni("");
        }
      })
      .finally(() => {
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [selectedRoute, actualizar, actualizarDelete]);

  const [currentPageLeft, setCurrentPageLeft] = useState(1);
  const [currentPageRight, setCurrentPageRight] = useState(1);

  const leftTableRef = useRef<HTMLDivElement>(null);
  const rightTableRef = useRef<HTMLDivElement>(null);

  const [itemsPerPage, setItemsPerPage] = useState(15);

  useEffect(() => {
    const calculateRows = () => {
      const container = leftTableRef.current || rightTableRef.current;
      if (container) {
        const containerHeight = container.clientHeight;
        const rowHeight = 40;
        const headerHeight = 40;
        const rows = Math.floor((containerHeight - headerHeight) / rowHeight);
        setItemsPerPage(rows > 0 ? rows : 1);
      }
    };

    calculateRows();
    window.addEventListener("resize", calculateRows);
    return () => window.removeEventListener("resize", calculateRows);
  }, []);

  const paginatedLeft = dispatches.slice(
    (currentPageLeft - 1) * itemsPerPage,
    currentPageLeft * itemsPerPage
  );

  const filteredUnits = availableUnits.filter((unit) =>
    unit.codunidad?.toLowerCase().includes(searchUnit.toLowerCase())
  );

  const paginatedRight = filteredUnits.slice(
    (currentPageRight - 1) * itemsPerPage,
    currentPageRight * itemsPerPage
  );

  const [frecuencia, setFrecuencia] = useState(5);

  useEffect(() => {
    const stored = localStorage.getItem("frecuencia");
    if (stored) {
      setFrecuencia(Number(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("frecuencia", frecuencia.toString());
  }, [frecuencia]);

  return (
    <div className="p-4 h-[calc(100vh-70px)]">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
        {/* Despachos Realizados */}
        <Card className=" border-blue-200 flex flex-col dark:border-gray-600">
          <CardHeader className="py-[7px] ">
            <CardTitle className="text-base text-blue-700 dark:text-gray-100">
              Despachos Realizados
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col flex-grow overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center gap-2 text-sm mb-1 py-1">
              <div className="font-medium md:w-[40px] text-gray-800  dark:text-gray-100">
                Ruta:
              </div>
              <div className="w-full md:flex-1">
                <Select value={selectedRoute} onValueChange={setSelectedRoute}>
                  <SelectTrigger className="h-8 text-sm w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">
                    <SelectValue placeholder="Selecciona una ruta" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600">
                    {routes.map((route) => (
                      <SelectItem
                        key={route.value}
                        value={route.value}
                        className="hover:bg-blue-100 dark:hover:bg-blue-900"
                      >
                        {route.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div
              className="border overflow-y-auto flex-grow"
              ref={leftTableRef}
            >
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-700">
                    <TableHead className="w-16 text-xs text-gray-700 dark:text-gray-200">
                      Unidad
                    </TableHead>
                    <TableHead className="text-xs text-gray-700 dark:text-gray-200">
                      Conductor
                    </TableHead>
                    <TableHead className="w-22 text-xs text-gray-700 dark:text-gray-200">
                      Ult. Control
                    </TableHead>
                    <TableHead className="w-16 text-xs text-gray-700 dark:text-gray-200">
                      Hora Ini
                    </TableHead>
                    <TableHead className="w-16 text-xs text-gray-700 dark:text-gray-200">
                      Frecuencia
                    </TableHead>
                    <TableHead className="w-12 text-xs text-gray-700 dark:text-gray-200">
                      Elim
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10">
                        <div className="flex justify-center">
                          <Loader2 className="animate-spin h-6 w-6 text-blue-600" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : paginatedLeft.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-10 text-gray-500 dark:text-gray-400"
                      >
                        No hay datos para mostrar
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedLeft.map((dispatch) => (
                      <TableRow
                        key={dispatch.code}
                        className="text-xs text-gray-800 dark:text-gray-200 "
                      >
                        <TableCell >
                          {dispatch.unit?.split("-")[0]}
                        </TableCell>
                        <TableCell>
                          {dispatch.driver}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-1 py-0.5 rounded text-xs ${
                              dispatch.status === "VEN"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                : dispatch.status === "GRZ"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                                : dispatch.status === "OBR"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                : dispatch.status === "SJU"
                                ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                            }`}
                          >
                            {dispatch.status}
                          </span>
                        </TableCell>
                        <TableCell >
                          {dispatch.time}
                        </TableCell>
                        <TableCell >
                          {dispatch.count}
                        </TableCell>
                        <TableCell>
                          <CancelDispatchModal
                            codigo={dispatch.code}
                            onDespachoGuardado={() => {
                              setActualizarDelete((prev) => !prev);
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-between items-center p-2 text-xs text-gray-800 dark:text-gray-900">
              <Button
                variant="ghost"
                size="sm"
                disabled={currentPageLeft === 1}
                onClick={() => setCurrentPageLeft((p) => p - 1)}
                className="hover:text-blue-600 dark:hover:text-blue-400 dark:text-gray-100"
              >
                Anterior
              </Button>
              <span className="dark:text-gray-100">
                Página {currentPageLeft}
              </span>
              <Button
                variant="ghost"
                size="sm"
                disabled={
                  currentPageLeft >= Math.ceil(dispatches.length / itemsPerPage)
                }
                onClick={() => setCurrentPageLeft((p) => p + 1)}
                className="hover:text-blue-600 dark:hover:text-blue-400 dark:text-gray-100"
              >
                Siguiente
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className=" border-blue-200 flex flex-col dark:border-gray-600">
          <CardHeader className="py-1 flex flex-row items-center justify-between">
            <CardTitle className="text-base text-blue-700 dark:text-gray-100">
              Asignación de Unidades (Frecuencia Actual: {frecuencia}) minutos
            </CardTitle>

            <FrecuenciaModal
              frecuencia={frecuencia}
              setFrecuencia={setFrecuencia}
            />
          </CardHeader>
          <CardContent className="flex flex-col flex-grow overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center gap-2 text-sm mb-1 py-1">
              <label className="font-medium text-gray-800  dark:text-gray-100 md:w-[120px]">
                Buscar Unidad:
              </label>
              <div className="w-full md:flex-1">
                <Input
                  value={searchUnit}
                  onChange={(e) => setSearchUnit(e.target.value)}
                  placeholder="Buscar"
                  className="h-8 text-sm w-full bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-300 border border-gray-300 dark:border-gray-600"
                />
              </div>
            </div>

            <div
              className="border overflow-y-auto flex-grow"
              ref={rightTableRef}
            >
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-700">
                    <TableHead className="w-16 text-xs text-center text-gray-700 dark:text-gray-200">
                      Nro
                    </TableHead>
                    <TableHead className="text-xs text-center text-gray-700 dark:text-gray-200">
                      Unidad
                    </TableHead>
                    <TableHead className="w-20 text-xs text-center text-gray-700 dark:text-gray-200">
                      Despachar
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {loadingUnits ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-10">
                        <div className="flex justify-center">
                          <Loader2 className="animate-spin h-6 w-6 text-blue-600" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : paginatedRight.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center py-10 text-gray-500 dark:text-gray-400"
                      >
                        No hay unidades disponibles
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedRight.map((unit, index) => (
                      <TableRow
                        key={unit.codunidad}
                        className="text-xs text-gray-900 dark:text-gray-200"
                      >
                        <TableCell >
                          {(currentPageRight - 1) * itemsPerPage + index + 1}
                        </TableCell>
                        <TableCell className="text-center">
                          {unit.codunidad?.split("-")[0]}
                        </TableCell>
                        <TableCell className="text-center">
                          <ModalDespacho
                            codunidad={unit.codunidad}
                            apepate={unit.conductor?.apepate || ""}
                            horaIni={horaIni}
                            frecuencia={frecuencia}
                            onDespachoGuardado={() => {
                              setActualizar((prev) => !prev);
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-between items-center p-2 text-xs text-gray-800 dark:text-gray-900">
              <Button
                variant="ghost"
                size="sm"
                disabled={currentPageRight === 1}
                onClick={() => setCurrentPageRight((p) => p - 1)}
                className="hover:text-blue-600 dark:hover:text-blue-400 dark:text-gray-100"
              >
                Anterior
              </Button>
              <span className="dark:text-gray-100">Página {currentPageRight}</span>
              <Button
                variant="ghost"
                size="sm"
                disabled={
                  currentPageRight >=
                  Math.ceil(filteredUnits.length / itemsPerPage)
                }
                onClick={() => setCurrentPageRight((p) => p + 1)}
                className="hover:text-blue-600 dark:hover:text-blue-400 dark:text-gray-100"
              >
                Siguiente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
