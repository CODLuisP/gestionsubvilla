import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";

interface Pago {
  idTicket: number;
  codServicio: number;
  monto: number;
  concepto: string;
}

interface Ticket {
  num: number;
  idTicket: number;
  numero: number;
  unidad: string;
  salida1: string | null;
  salida2: string | null;
  salida3: string | null;
  salida4: string | null;
  conductor: string;
  despachador: string;
  pagos: Pago[];
}

interface Servicio {
  codServicio: number;
  concepto: string;
  monto: number;
}

interface TotalesPorConcepto {
  cantidad: number;
  monto: number;
}

interface Props {
  fecha: string;
  onTotalesCalculados?: (totales: Record<string, TotalesPorConcepto>) => void;
  triggerReload?: boolean;
}

export default function TablaTickets({ fecha, onTotalesCalculados, triggerReload }: Props) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    axios
      .get<Servicio[]>("https://villa.velsat.pe:8443/api/Caja/servicios")
      .then((res) => setServicios(res.data))
      .catch((err) => {
        console.error("Error cargando servicios:", err);
      });
  }, [triggerReload]);

  useEffect(() => {
    if (!fecha || servicios.length === 0) return;

    setLoading(true);
    setError(null);

    const encodedFecha = encodeURIComponent(fecha);
    axios
      .get<Ticket[]>(`https://villa.velsat.pe:8443/api/Caja?fecha=${encodedFecha}`)
      .then((res) => {
        const data = res.data || [];
        setTickets(data);
        
        calcularTotales(data); 
        if (data.length === 0) setError("No hay datos para mostrar");
      })
      .catch(() => {
        setTickets([]);
        setError("Error al cargar datos");
        calcularTotales([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [fecha, triggerReload, servicios]);

  useEffect(()=>{
    console.log(tickets)
  })

  const calcularTotales = useCallback((ticketsData: Ticket[]) => {
    const totales: Record<string, TotalesPorConcepto> = {};
    servicios.forEach((s) => {
      totales[s.concepto] = { cantidad: 0, monto: 0 };
    });

    ticketsData.forEach((ticket) => {
      servicios.forEach((servicio) => {
        const pago = ticket.pagos.find((p) => p.concepto === servicio.concepto);
        if (pago && pago.monto > 0) {
          totales[servicio.concepto].cantidad += 1;
          totales[servicio.concepto].monto += pago.monto;
        }
      });
    });

    if (onTotalesCalculados) onTotalesCalculados(totales);
  }, [servicios, onTotalesCalculados]);

  useEffect(() => {
    const ajustarItemsPorPagina = () => {
      const alturaDisponible = window.innerHeight - 220;
      const alturaFila = 30;
      const filasVisibles = Math.floor(alturaDisponible / alturaFila);
      setItemsPerPage(Math.max(filasVisibles, 1));
    };
    ajustarItemsPorPagina();
    window.addEventListener("resize", ajustarItemsPorPagina);
    return () => window.removeEventListener("resize", ajustarItemsPorPagina);
  }, []);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTickets = tickets.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(tickets.length / itemsPerPage);

  const obtenerMontoPorConcepto = (pagos: Pago[], concepto: string) => {
    const pago = pagos.find((p) => p.concepto === concepto);
    return pago ? pago.monto : "";
  };

  return (
    <div>
      <div className="overflow-x-auto mt-4 mx-2">
        <table className="w-full table-auto border-collapse text-sm shadow-md">
          <thead>
            <tr className="bg-gray-300 text-gray-800 text-center uppercase text-[12px]">
              <th rowSpan={2} className="border px-2 py-1">N°</th>
              <th rowSpan={2} className="border px-2 py-1">Unidad</th>
              <th colSpan={2} className="border px-2 py-1">1</th>
              <th colSpan={2} className="border px-2 py-1">2</th>
              <th colSpan={2} className="border px-2 py-1">3</th>
              <th colSpan={2} className="border px-2 py-1">4</th>
              <th rowSpan={2} className="border px-2 py-1">Conductor</th>
              {servicios.map((servicio) => (
                <th key={servicio.codServicio} rowSpan={2} className="border px-2 py-1">
                  {servicio.concepto}
                </th>
              ))}
            </tr>
            <tr className="bg-gray-100 text-center text-blue-800">
              <th className="border px-2 py-1">LL</th>
              <th className="border px-2 py-1">S</th>
              <th className="border px-2 py-1">LL</th>
              <th className="border px-2 py-1">S</th>
              <th className="border px-2 py-1">LL</th>
              <th className="border px-2 py-1">S</th>
              <th className="border px-2 py-1">LL</th>
              <th className="border px-2 py-1">S</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={15} className="text-center py-4 text-gray-600">Cargando datos...</td></tr>
            ) : error ? (
              <tr><td colSpan={15} className="text-center py-4 text-gray-600 font-semibold">{error}</td></tr>
            ) : currentTickets.length === 0 ? (
              <tr><td colSpan={15} className="text-center py-4 text-gray-600">No hay datos para mostrar</td></tr>
            ) : (
              currentTickets.map((ticket, index) => (
                <tr key={ticket.idTicket} className="text-center hover:bg-gray-100 text-[12px]">
                  <td className="border px-2 py-1">{indexOfFirstItem + index + 1}</td>
                  <td className="border px-2 py-1">{ticket.unidad}</td>
                  <td className="border px-2 py-1"></td><td className="border px-2 py-1">{ticket.salida1 || ""}</td>
                  <td className="border px-2 py-1"></td><td className="border px-2 py-1">{ticket.salida2 || ""}</td>
                  <td className="border px-2 py-1"></td><td className="border px-2 py-1">{ticket.salida3 || ""}</td>
                  <td className="border px-2 py-1"></td><td className="border px-2 py-1">{ticket.salida4 || ""}</td>
                  <td className="border px-2 py-1">{ticket.conductor}</td>
                  {servicios.map((servicio) => (
                    <td key={servicio.codServicio} className="border px-2 py-1">
                      {obtenerMontoPorConcepto(ticket.pagos, servicio.concepto)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && !error && tickets.length > 0 && (
        <div className="flex justify-center mt-4 space-x-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="px-3 py-1 text-sm font-semibold text-gray-800">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
