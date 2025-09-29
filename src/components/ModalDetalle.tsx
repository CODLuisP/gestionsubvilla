import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IoTicketSharp } from "react-icons/io5";
import { HiTicket } from "react-icons/hi2";
import { DialogClose } from "@/components/ui/dialog";


interface TotalesProps {
  totales: {
    [key: string]: { cantidad: number; monto: number };
  };
}


<DialogClose asChild>
  <Button className="bg-red-600 hover:bg-red-700 text-white">Cerrar</Button>
</DialogClose>;

const ModalTicket = ({ totales }: TotalesProps) => {

  const canon = 4.0;

  // Convertir el objeto en array para mapear y calcular precio unitario
  const items = Object.entries(totales).map(([descripcion, { cantidad, monto }]) => ({
    descripcion,
    cantidad,
    precioUnitario: cantidad > 0 ? monto / cantidad : 0,
    total: monto,
  }));

  const subtotal = items.reduce((acc, item) => acc + item.total, 0);
  const total = subtotal + canon;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-500 text-white font-bold px-6 py-2 shadow-md">
          Detalle
          <IoTicketSharp />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[50%] bg-white">
        <DialogHeader>
          <DialogTitle className="text-[14px] font-bold flex justify-center items-center gap-2 text-gray-900">
            DETALLE <HiTicket size={25} />
          </DialogTitle>
        </DialogHeader>

        <div className="text-sm">
          <div className="mx-auto mt-0 bg-white p-4">
            <table className="w-full border border-gray-300 text-sm">
              <thead>
                <tr className="bg-blue-600 text-center text-white">
                  <th className="p-2 border">Descripción</th>
                  <th className="p-2 border texta-center">Cantidad</th>
                  <th className="p-2 border text-center">Precio Unitario</th>
                  <th className="p-2 border text-center">Total</th>
                </tr>
              </thead>
              <tbody className="bg-gray-50">
                {items.map((item, index) => (
                  <tr key={index}>
                    <td className="p-2 border text-center">
                      {item.descripcion}
                    </td>
                    <td className="p-2 border text-center">{item.cantidad}</td>
                    <td className="p-2 border text-center">
                      S/ {item.precioUnitario.toFixed(2)}
                    </td>
                    <td className="p-2 border text-center">
                      S/ {(item.cantidad * item.precioUnitario).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td
                    colSpan={3}
                    className="p-2 border text-right font-semibold"
                  >
                    Canon
                  </td>
                  <td className="p-2 border text-center">
                    S/ {canon.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td
                    colSpan={3}
                    className="p-2 border text-right font-semibold"
                  >
                    Sub Total
                  </td>
                  <td className="p-2 border text-center">
                    S/ {subtotal.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td
                    colSpan={3}
                    className="p-2 border text-right font-bold text-lg"
                  >
                    Total
                  </td>
                  <td className="p-2 border text-center font-bold text-lg">
                    S/ {total.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* BOTONES FINALES */}
          {/* BOTONES FINALES */}
          <div className="flex justify-end gap-2 mt-4">
            <DialogClose asChild>
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                Cerrar
              </Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModalTicket;
