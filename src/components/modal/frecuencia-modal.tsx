"use client";

import { GoClockFill } from "react-icons/go";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface FrecuenciaModalProps {
  frecuencia: number;
  setFrecuencia: (n: number) => void;
}

export default function FrecuenciaModal({
  frecuencia,
  setFrecuencia,
}: FrecuenciaModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [frequency, setFrequencyLocal] = useState(frecuencia.toString());

  useEffect(() => {
    if (isOpen) {
      setFrequencyLocal(frecuencia.toString());
    }
  }, [isOpen, frecuencia]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFrequencyLocal(e.target.value);
  };

  const handleSave = () => {
    const numericValue = Number.parseFloat(frequency);
    if (!isNaN(numericValue)) {
      setFrecuencia(numericValue);
      toast.success("Frecuencia guardada correctamente.");
      setIsOpen(false);
    }
  };

  const handleClose = () => {
    setFrequencyLocal(frecuencia.toString());
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded bg-blue-600 hover:bg-blue-400 text-gray-50"
      >
        <GoClockFill />
      </button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[14px] font-semibold text-gray-700 dark:text-gray-100">
              MODIFICAR FRECUENCIA
            </DialogTitle>
          </DialogHeader>

          <div className="py-2 space-y-2">
            <Label
              htmlFor="frequency"
              className="text-sm font-normal text-gray-800 dark:text-gray-200"
            >
              Frecuencia
            </Label>
            <input
              id="frequency"
              type="number"
              step="any"
              value={frequency}
              onChange={handleInputChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              placeholder="Ingresa la frecuencia"
              autoFocus
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              onClick={handleSave}
              disabled={!frequency.trim()}
              className="px-6 bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
            >
              Guardar
            </Button>
            <Button
              onClick={handleClose}
              className="px-6 bg-red-600 text-white hover:bg-red-700"
            >
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
