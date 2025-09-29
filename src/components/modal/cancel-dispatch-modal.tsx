"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AiFillDelete } from "react-icons/ai";
import { toast } from "sonner";

type CancelDispatchModalProps = {
  codigo: number;
  onDespachoGuardado?: () => void;
};

export default function CancelDispatchModal({
  codigo,
  onDespachoGuardado,
}: CancelDispatchModalProps) {
  const [selectedReason, setSelectedReason] = useState("Refrigerio");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Nuevo estado para loading

  const reasons = [
    "Refrigerio",
    "Sistema",
    "Gas",
    "Deuda",
    "Conductor Restringido",
    "Unidad Inoperativa",
    "Tardanza",
    "Autorizacion por Operaciones",
  ];

  const handleCancel = async () => {
    setIsLoading(true); // Activar loading

    const loadingToastId = toast.loading(
      "Cancelando despacho, espere por favor..."
    );

    try {
      const response = await fetch("https://villa.velsat.pe:8443/api/Caja/eliminar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          codigo: String(codigo),
          motivoelim: selectedReason,
        }),
      });

      if (!response.ok) throw new Error("Error al cancelar el despacho");

      toast.dismiss(loadingToastId);
      toast.success("Despacho cancelado correctamente");
      setIsOpen(false);

      if (onDespachoGuardado) {
        onDespachoGuardado();
      }
    } catch (error) {
      toast.dismiss(loadingToastId);
      toast.error("Hubo un error al cancelar el despacho");
      console.error(error);
    } finally {
      setIsLoading(false); // Desactivar loading
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded bg-red-500 hover:bg-red-600 text-white p-1"
      >
        <AiFillDelete size={15} />
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[14px] font-medium text-gray-700 dark:text-gray-100">
              CANCELAR DESPACHO
              {/* <p>{codigo}</p> */}
            </DialogTitle>
          </DialogHeader>

          <div className="py-0">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-600 min-w-[60px] dark:text-gray-100">
                  Motivo:
                </label>
                <Select
                  value={selectedReason}
                  onValueChange={setSelectedReason}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Selecciona un motivo" />
                  </SelectTrigger>
                  <SelectContent>
                    {reasons.map((reason) => (
                      <SelectItem
                        key={reason}
                        value={reason}
                        className="data-[highlighted]:bg-blue-500 data-[highlighted]:text-white"
                      >
                        {reason}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              onClick={handleCancel}
              disabled={isLoading}
              className="px-6 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Cancelando..." : "Guardar"}
            </Button>

            <Button
              onClick={handleClose}
              disabled={isLoading}
              className="px-6 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
