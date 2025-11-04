"use client";
import { RiSendPlaneFill } from "react-icons/ri";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import AutocompleteConductor from "../inputs/InputConductorDespacho";
import axios from "axios";
import { toast } from "sonner";
import { DateTimePickerPerso } from "@/app/dashboard/unidades/DateTimePickerPerso";

interface ModalDespachoProps {
  codunidad: string;
  apepate: string;
  horaIni: string;
  frecuencia: number;
  onDespachoGuardado?: () => void;
}

export default function ModalDespacho({
  codunidad,
  apepate,
  horaIni,
  frecuencia,
  onDespachoGuardado,
}: ModalDespachoProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [routes, setRoutes] = useState<{ label: string; value: string }[]>([]);
  const [selectedRoute, setSelectedRoute] = useState("7504");
  const [codtaxi, setCodtaxi] = useState("");

  const [selectedDate, setSelectedDate] = useState<string>("");

  const handleUserInput = (fechaISO: string) => {
    setSelectedDate(fechaISO);
    console.log("Fecha seleccionada:", fechaISO);
  };

  useEffect(() => {
    const now = new Date();
    const match = horaIni.match(/^(\d{1,2}):(\d{1,2})$/);
    if (match) {
      const hora = parseInt(match[1], 10);
      const minuto = parseInt(match[2], 10);
      const fecha = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        hora,
        minuto
      );
      fecha.setMinutes(fecha.getMinutes() + frecuencia);

      // Crear string ISO manualmente en horario local (no UTC)
      const yyyy = fecha.getFullYear();
      const mm = String(fecha.getMonth() + 1).padStart(2, "0");
      const dd = String(fecha.getDate()).padStart(2, "0");
      const hh = String(fecha.getHours()).padStart(2, "0");
      const min = String(fecha.getMinutes()).padStart(2, "0");

      const localISOString = `${yyyy}-${mm}-${dd}T${hh}:${min}`;
      setSelectedDate(localISOString); // ✅ Ahora sí: hora local, formato válido
    }
  }, [horaIni, frecuencia]);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await axios.get(
          "https://villa.velsat.pe:8443/api/Caja/Rutas/etudvrb"
        );
        const data = response.data as { nombre: string; codigo: string }[];
        const formatted = data.map((ruta) => ({
          label: ruta.nombre,
          value: ruta.codigo,
        }));
        setRoutes(formatted);

        const ultimaRuta = localStorage.getItem("ultimaRutaSeleccionada");
        if (ultimaRuta && formatted.find((r) => r.value === ultimaRuta)) {
          setSelectedRoute(ultimaRuta); // Usa la última ruta seleccionada
        } else if (formatted.length > 0) {
          setSelectedRoute(formatted[0].value); // Por defecto
        }
      } catch (error) {
        console.error("Error al obtener rutas:", error);
      }
    };
    fetchRoutes();
  }, []);

  const convertirFecha = (isoDate: string): string => {
    const date = new Date(isoDate);
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");

    return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
  };

  const handleGuardar = async () => {
    if (!codtaxi || codtaxi.trim() === "") {
      toast.error("Agrega un conductor válido");
      return;
    }
    setIsLoading(true);
    const loadingToastId = toast.loading(
      "Despachando unidad, espere por favor..."
    );

    const fecprogFormateado = convertirFecha(selectedDate);

    const payload = {
      carro: { codunidad },
      ruta: { codigo: selectedRoute },
      conductor: { codigo: codtaxi },
      fecprog: fecprogFormateado,
    };

    console.log(payload);

    try {
      const response = await axios.post(
        "https://villa.velsat.pe:8443/api/Caja/asignarB",
        payload
      );
      console.log("Respuesta de la API:", response.data);

      toast.dismiss(loadingToastId);
      toast.success("Despacho guardado correctamente");
      setIsOpen(false);

      if (onDespachoGuardado) {
        onDespachoGuardado();
      }
    } catch (error) {
      console.error("Error al guardar despacho:", error);
      toast.dismiss(loadingToastId);

      toast.error("Error al guardar el despacho");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded bg-blue-600 hover:bg-blue-500 text-white p-1"
      >
        <RiSendPlaneFill size={15} />
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          className="sm:max-w-[500px]"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader className="pb-4">
            <DialogTitle className="text-[14px] font-semibold text-gray-800 dark:text-gray-100">
              DESPACHO DE UNIDAD
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="unidad"
                className="text-left text-gray-700 dark:text-gray-100"
              >
                Unidad:
              </Label>
              <div className="col-span-3">
                <Input
                  id="unidad"
                  value={codunidad}
                  readOnly
                  className="bg-gray-100 border-gray-300 text-gray-900 "
                />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="conductor"
                className="text-left text-gray-700 dark:text-gray-100"
              >
                Conductor:
              </Label>
              <div className="col-span-3">
                <AutocompleteConductor
                  defaultValue={apepate}
                  onChangeCodTaxi={(codigo, apellidos) => {
                    setCodtaxi(codigo);
                    console.log("Seleccionado codtaxi:", codigo);
                    console.log("Seleccionado apellido:", apellidos);
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="hora"
                className="text-left text-gray-700 dark:text-gray-100"
              >
                Hora:
              </Label>
              <div className="w-[220px] ">
                <DateTimePickerPerso
                  initialDateTime={selectedDate}
                  onDateSelect={handleUserInput}
                />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="ruta"
                className="text-left text-gray-700 dark:text-gray-100"
              >
                Ruta:
              </Label>
              <div className="col-span-3">
                <Select
                  value={selectedRoute}
                  onValueChange={(value) => {
                    setSelectedRoute(value);
                    localStorage.setItem("ultimaRutaSeleccionada", value); // Guardar selección
                  }}
                >
                  <SelectTrigger className="h-8 text-sm w-full bg-white text-gray-900 border border-gray-300">
                    <SelectValue placeholder="Selecciona una ruta" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-gray-900 border border-gray-300">
                    {routes.map((route) => (
                      <SelectItem
                        key={route.value}
                        value={route.value}
                        className="hover:bg-blue-100"
                      >
                        {route.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="pt-6">
            <Button
              onClick={handleGuardar}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white px-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Despachando..." : "Guardar"}
            </Button>
            <Button
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 text-white px-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
