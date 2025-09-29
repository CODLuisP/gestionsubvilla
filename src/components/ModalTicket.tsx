"use client";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IoReceiptSharp } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import InputConductor from "./inputs/InputConductor";
import InputUnidad from "./inputs/InputUnidad";
import InputDespachadores from "./inputs/InputDespachadores";
import InputDate from "./inputs/InputDate";
import { toast } from "sonner";
import axios from "axios";
import { formatDateToDDMMYYYY } from "./convertDate/ConvertDate";

type Concepto = {
  codServicio: number;
  concepto: string;
  monto: number;
};

type ModalTicketProps = {
  onSaveSuccess?: () => void;
};

const ModalTicket = ({ onSaveSuccess }: ModalTicketProps) => {
  const [conceptoSeleccionado, setConceptoSeleccionado] = useState("");
  const [conceptosDisponibles, setConceptosDisponibles] = useState<Concepto[]>(
    []
  );
  const [conceptosAgregados, setConceptosAgregados] = useState<Concepto[]>([]);

  const [nuevoConcepto, setNuevoConcepto] = useState("");
  const [precioNuevo, setPrecioNuevo] = useState("");

  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [ultimoNumero, setUltimoNumero] = useState<number | 0>(0);
  const [idTicket, setTicket] = useState<number | 0>(0);

  const [unidadSeleccionada, setUnidadSeleccionada] = useState<string>("");
  const [fecha, setFecha] = useState("");
  const [codTaxi, setCodTaxi] = useState("");

  const [codDespachador, setCodDespachador] = useState<number | 0>(0);

  const [open, setOpen] = useState(false);

  
    const obtenerConceptos = async () => {
      try {
        const res = await fetch("https://villa.velsat.pe:8443/api/Caja/servicios");
        const data = await res.json();
        setConceptosDisponibles(data);
      } catch (error) {
        console.error("Error cargando conceptos:", error);
      }
    };

useEffect(() => {
  if (open) {
    const obtenerUltimoNumero = async () => {
      try {
        const response = await axios.get(
          "https://villa.velsat.pe:8443/api/Caja/ultimonumero"
        );
        setUltimoNumero(response.data.numero);
        setTicket(response.data.idticket);
      } catch (error) {
        console.error("Error obteniendo el último número:", error);
      }
    };


    obtenerUltimoNumero();
    obtenerConceptos();
  }
}, [open]); 


  const agregarConceptoSeleccionado = () => {
    const concepto = conceptosDisponibles.find(
      (c) => c.concepto === conceptoSeleccionado
    );
    if (concepto) {
      setConceptosAgregados([...conceptosAgregados, concepto]);
      setConceptoSeleccionado("");
    }
  };

  const total = conceptosAgregados.reduce((acc, c) => acc + c.monto, 0);

  const eliminarConcepto = (index: number) => {
    const nuevosConceptos = conceptosAgregados.filter((_, i) => i !== index);
    setConceptosAgregados(nuevosConceptos);
  };

  const handleConductorSelect = (conductor: {
    codigo: string;
    apepate: string;
  }) => {
    console.log("Seleccionado:", conductor);
    setCodTaxi(conductor.codigo);
  };

  const handleUnidadSelect = (unidad: { id: number; codunidad: string }) => {
    console.log("Unidad seleccionada:", unidad);
    setUnidadSeleccionada(unidad.codunidad);
  };

  const handleSelectDespachadores = (despachador: {
    codDespachador: number;
    apellidos: string;
  }) => {
    console.log("Despachador seleccionado:", despachador);
    setCodDespachador(despachador.codDespachador);
  };

  const agregarNuevoConcepto = async () => {
    if (!nuevoConcepto.trim() || !precioNuevo || parseFloat(precioNuevo) <= 0) {
      toast.error("Por favor, complete todos los campos correctamente.");
      return;
    }

    try {
      const response = await fetch("https://villa.velsat.pe:8443/api/Caja/nuevoServicio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          concepto: nuevoConcepto.trim(),
          monto: parseFloat(precioNuevo),
        }),
      });

      if (!response.ok) {
        throw new Error("Error al agregar concepto");
      }

      toast.success("Concepto agregado correctamente");
      setNuevoConcepto("");
      setPrecioNuevo("");
      setMostrarFormulario(false);
      await obtenerConceptos();
    } catch (error) {
      console.error(error);

      toast.error("Hubo un error al enviar los datos.");
    }
  };

  const enviarDatosAPI = async () => {
    if (!unidadSeleccionada || !fecha || !codTaxi || !codDespachador) {
      toast.error("Completa todos los campos antes de guardar.");
      return;
    }

    const pagos = conceptosAgregados.map(({ codServicio, monto }) => ({
      codServicio,
      monto,
    }));

    if (pagos.length === 0) {
      toast.error("Agrega al menos un concepto antes de guardar.");
      return;
    }

    const datos = {
      idTicket: idTicket + 1,
      numero: ultimoNumero + 1,
      unidad: unidadSeleccionada,
      fecha: formatDateToDDMMYYYY(fecha),
      codtaxi: codTaxi,
      codDespachador: codDespachador,
      pagos,
    };

    const toastId = toast.loading("Guardando ticket...");

    try {
      await axios.post("https://villa.velsat.pe:8443/api/Caja/nuevoTicket", datos);

      console.log("data enviada " + datos);

      toast.success("Ticket guardado con éxito", { id: toastId });
      setOpen(false);

      setConceptosAgregados([]);
      setUnidadSeleccionada("");
      setFecha("");
      setCodTaxi("");
      setCodDespachador(0);
      onSaveSuccess?.();
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar el ticket", { id: toastId });
      console.log(datos);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={() => setOpen(true)}
          className="bg-[#ffb703] hover:bg-yellow-500 text-gray-800 font-bold px-6 py-2 shadow-md"
        >
          Nuevo Recibo <IoReceiptSharp  />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[80%] bg-white z-[900]">
        <DialogHeader className=" flex ">
          <DialogTitle className="text-[14px] font-bold flex justify-center items-center gap-2 text-gray-900">
            NUEVO RECIBO <IoReceiptSharp  size={25} />
          </DialogTitle>

          <div>
            <span className="text-[14px] font-bold">
              RECIBO N°:{" "}
              <span className="text-red-600 font-bold">{ultimoNumero + 1}</span>
            </span>
          </div>
        </DialogHeader>
        <hr />

        <div className="space-y-4 text-sm">
          <div className="flex justify-between">
            <div className="flex items-center gap-1">
              <InputDate value={fecha} onChange={setFecha} />
            </div>
            <div className="w-[300px]">
              <InputDespachadores onSelect={handleSelectDespachadores} />
            </div>
            <div className="w-[300px]">
              <InputConductor onSelect={handleConductorSelect} />
            </div>
            <div className="w-[300px]">
              <InputUnidad onSelect={handleUnidadSelect} />
            </div>
          </div>

          <hr />

          <div className="flex gap-0 flex-wrap">
            <div className="w-[50%]">
              <span className="font-semibold">Conceptos:</span>
              <div className="flex gap-6 mt-1 flex-wrap">
                <select
                  value={conceptoSeleccionado}
                  onChange={(e) => setConceptoSeleccionado(e.target.value)}
                  className="bg-gray-100 border px-3 py-1 rounded focus:outline-none w-[350px] text-[12px]"
                >
                  <option value="" className="text-[12px]">
                    Seleccione un concepto
                  </option>
                  {conceptosDisponibles.map((c) => (
                    <option key={c.codServicio} value={c.concepto}>
                      {c.concepto} - S/. {c.monto.toFixed(2)}
                    </option>
                  ))}
                </select>
                <Button
                  onClick={agregarConceptoSeleccionado}
                  className="bg-blue-600 text-white hover:bg-blue-500 text-[12px]"
                >
                  Agregar
                </Button>
                <Button
                  onClick={() => setMostrarFormulario(true)}
                  className="bg-blue-600 text-white hover:bg-blue-500 text-[12px]"
                >
                  Nuevo Concepto
                </Button>
              </div>
            </div>

            {mostrarFormulario && (
              <div className="flex items-end gap-3 w-[50%] justify-end">
                <div className="flex flex-col">
                  <label className="mb-1 text-sm font-medium text-gray-800">
                    Nuevo Concepto
                  </label>
                  <input
                    type="text"
                    value={nuevoConcepto}
                    onChange={(e) => setNuevoConcepto(e.target.value)}
                    className="border px-2 py-1 rounded w-[180px] focus:outline-none"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="mb-1 text-sm font-medium text-gray-800">
                    Precio
                  </label>
                  <div className="flex items-center border rounded px-2 py-1 w-[120px]">
                    <span className="text-gray-500 text-sm">S/.</span>
                    <input
                      type="number"
                      value={precioNuevo}
                      onChange={(e) => setPrecioNuevo(e.target.value)}
                      className="border-none outline-none focus:ring-0 w-full ml-1"
                    />
                  </div>
                </div>

                <button
                  onClick={agregarNuevoConcepto}
                  className="bg-gray-300 text-black hover:bg-gray-400 h-[32px] mt-[22px] px-3 rounded font-semibold text-[12px] text-center"
                >
                  Agregar
                </button>
              </div>
            )}
          </div>

          <div className="mt-4">
            <span className="font-semibold">Resumen:</span>
            <table className="w-full mt-2 text-sm border border-gray-300">
              <thead className="bg-gray-200 text-gray-700">
                <tr>
                  <th className="py-1 px-2 border">Cantidad</th>
                  <th className="py-1 px-2 border text-left">Concepto</th>
                  <th className="py-1 px-2 border text-right">Precio</th>
                  <th className="py-1 px-2 border text-center">Acción</th>
                </tr>
              </thead>
              <tbody>
                {conceptosAgregados.map((c, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="border px-2 text-center">{i + 1}</td>
                    <td className="border px-2">{c.concepto}</td>
                    <td className="border px-2 text-right">
                      S/. {c.monto.toFixed(2)}
                    </td>
                    <td className="border px-2 text-center p-1">
                      <button
                        onClick={() => eliminarConcepto(i)}
                        className="text-red-600 hover:text-red-800 font-semibold text-sm bg-red-200 rounded p-1"
                      >
                        <MdDelete size={17} />
                      </button>
                    </td>
                  </tr>
                ))}
                {conceptosAgregados.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center text-gray-400 py-2">
                      No hay conceptos agregados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="text-right font-bold mt-2 text-sm">
              Total: S/. {total.toFixed(2)}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <DialogClose asChild>
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                Cerrar
              </Button>
            </DialogClose>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={enviarDatosAPI}
            >
              Guardar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModalTicket;
