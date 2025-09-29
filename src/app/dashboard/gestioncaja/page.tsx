"use client";
import dayjs from "dayjs";
import { DateInput, DateInputProps } from "@mantine/dates";
import { useEffect, useState } from "react";
import ModalTicket from "@/components/ModalTicket";
import TablaTickets from "@/components/TablaTickets";
import ModalDetalle from "@/components/ModalDetalle";
import { Toaster } from "sonner";
import { formatDateToDDMMYYYY } from "@/components/convertDate/ConvertDate";

type TotalesPorConcepto = {
  cantidad: number;
  monto: number;
};

export default function CabeceraDespacho() {
  const [fecha, setFecha] = useState("");
  const [dia, setDia] = useState("");
  const [triggerReload, setTriggerReload] = useState(false);

  const marcarRecarga = () => setTriggerReload((prev) => !prev);

  useEffect(() => {
    const hoy = new Date();
    const fechaISO = hoy.toISOString().split("T")[0];
    setFecha(fechaISO);
    setDiaNombre(hoy);
  }, []);

  const setDiaNombre = (fechaDate: Date) => {
    const dias = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];
    setDia(dias[fechaDate.getDay()]);
  };

  const handleChangeFecha = (value: string | null) => {
    const nuevaFecha = value || "";
    setFecha(nuevaFecha);

    const fechaDate = new Date(nuevaFecha);
    if (!isNaN(fechaDate.getTime())) {
      setDiaNombre(fechaDate);
    }
  };

  const dateParser: DateInputProps["dateParser"] = (input) => {
    if (input === "WW2") return "1939-09-01";
    return dayjs(input, "DD/MM/YYYY").format("YYYY-MM-DD");
  };

  const [totales, setTotales] = useState<Record<string, TotalesPorConcepto>>(
    {}
  );

  const manejarTotales = (
    totales: Record<string, { cantidad: number; monto: number }>
  ) => {
    console.log("Totales calculados:", totales);
    setTotales(totales);
  };

  return (
    <div>
      <Toaster richColors />
      <div className="bg-white dark:bg-zinc-900 shadow-sm  px-3 py-3 mb-5">
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs md:text-sm text-zinc-700 dark:text-zinc-300">
          <div className="flex flex-wrap items-center gap-6">
            {/* Fecha */}
            <div className="flex items-center gap-1">
              <label className="font-medium text-zinc-800 dark:text-zinc-100">
                Fecha :
              </label>
              <DateInput
                size="xs"
                radius="sm"
                valueFormat="DD/MM/YYYY"
                value={fecha}
                onChange={handleChangeFecha}
                placeholder="Selecciona una fecha"
                dateParser={dateParser}
                classNames={{
                  input:
                    "h-8 px-2 text-xs border-gray-300 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white rounded-md",
                }}
              />
            </div>

            {/* Día */}
            <div className="flex items-center gap-1">
              <span className="font-medium text-zinc-700 dark:text-zinc-200">
                Día :
              </span>
              <span className=" text-blue-800 dark:text-blue-300 font-semibold px-0.5 py-0.5 rounded text-xs">
                {dia}
              </span>
            </div>



          </div>

          {/* Botones */}
          <div className="flex gap-2">
            <ModalDetalle totales={totales} />
            <ModalTicket onSaveSuccess={marcarRecarga} />
          </div>
        </div>
      </div>

      <TablaTickets
        fecha={formatDateToDDMMYYYY(fecha)}
        onTotalesCalculados={manejarTotales}
        triggerReload={triggerReload}
      />
    </div>
  );
}
