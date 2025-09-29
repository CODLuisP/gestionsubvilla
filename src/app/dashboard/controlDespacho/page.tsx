"use client";
import React, { useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import { FileSpreadsheet, FileText, Search, X, Loader2 } from "lucide-react";
import DataOffLineGps from "./DataOffLineGps";

const headersRuta5 = [
  "Unidad",
  "Hora Inicio",
  "Hora Registro",
  "VENEZUELA",
  "GARZON",
  "OBRERO",
  "AV SAN JUAN",
  "MADRID",
  "CT",
  "GRIFO MILAGRO",
  "Conductor",
  "Total",
];

const headersRuta6 = [
  "Unidad",
  "Hora Inicio",
  "Hora Registro",
  "PACIFICO",
  "CT",
  "MADRID",
  "ARRIOLA",
  "TRANSITO",
  "BOLIVAR",
  "INSURGENTES",
  "Conductor",
  "Total",
];

const controlesRuta5 = [
  "VENEZUELA",
  "GARZON",
  "OBRERO",
  "AV SAN JUAN",
  "MADRID",
  "CT",
  "GRIFO MILAGRO",
];

const controlesRuta6 = [
  "PACIFICO",
  "CT",
  "MADRID",
  "ARRIOLA",
  "TRANSITO",
  "BOLIVAR",
  "INSURGENTES",
];

interface Control {
  nom_control: string;
  hora_estimada?: string;
  hora_llegada?: string;
  volado?: string;
}

interface Despacho {
  codasig: number;
  deviceid: string;
  hora_inicio: string;
  hora_registro: string;
  nombreConductor: string;
  controles: Control[];
}

export default function Page() {
  const [selectedRoute, setSelectedRoute] = useState("5");
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const getTodayLocal = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const today = getTodayLocal();
  const [date, setDate] = useState(today);

  const [searchText, setSearchText] = useState("");
  const [activeHeaders, setActiveHeaders] = useState(headersRuta5);
  const [rows, setRows] = useState<(string | string[])[][]>([]);
  const [subdividedColumns, setSubdividedColumns] = useState<number[]>([
    3, 4, 5, 6, 7, 8, 9,
  ]);

  // Función para verificar si una fila tiene al menos una hora en los controles
  const hasControlTimes = (row: (string | string[])[]) => {
    const conductorIndex = row.length - 1;
    const visibleData = row.slice(0, conductorIndex);

    return visibleData.some((cell, index) => {
      if (subdividedColumns.includes(index) && Array.isArray(cell)) {
        // Verificar si hay hora estimada o hora de llegada
        return (
          (cell[0] && cell[0].trim() !== "") ||
          (cell[1] && cell[1].trim() !== "")
        );
      }
      return false;
    });
  };

  const exportExcel = () => {
    const headerRow: string[] = [];

    activeHeaders.forEach((header, index) => {
      if (subdividedColumns.includes(index)) {
        headerRow.push(`${header} - Estimada`);
        headerRow.push(`${header} - Llegada`);
        headerRow.push(`${header} - Volado`);
      } else {
        headerRow.push(header);
      }
    });

    headerRow.push("Total");

    const excelData: (string | number)[][] = [];

    filteredRows.forEach((row) => {
      const rowData: (string | number)[] = [];
      const conductorIndex = row.length - 1;
      const visibleData = row.slice(0, conductorIndex);
      const conductorCell = row[conductorIndex];

      let total = 0;

      visibleData.forEach((cell, i) => {
        if (subdividedColumns.includes(i) && Array.isArray(cell)) {
          const voladoRaw = cell[2]?.trim() || "0";
          // No sumar si es "+0" (que viene de valores "seg")
          if (voladoRaw !== "+0") {
            const volado = parseInt(voladoRaw);
            if (!isNaN(volado) && volado > 0) total += volado;
          }

          rowData.push(cell[0] || "");
          rowData.push(cell[1] || "");
          rowData.push(voladoRaw);
        } else if (typeof cell === "string") {
          rowData.push(cell);
        } else {
          rowData.push("");
        }
      });

      // Conductor
      if (typeof conductorCell === "string") {
        rowData.push(conductorCell);
      } else {
        rowData.push("");
      }

      rowData.push(total > 0 ? `+${total}` : total < 0 ? total : "+0");

      excelData.push(rowData);
    });

    const worksheet = XLSX.utils.aoa_to_sheet([headerRow, ...excelData]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Despachos");

    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, "0")}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${today.getFullYear()}`;

    XLSX.writeFile(workbook, `ControlDespacho_${formattedDate}.xlsx`);
  };

  const exportPDF = async () => {
    const input = document.getElementById("tabla-pdf");
    if (!input) return;

    const clone = input.cloneNode(true) as HTMLElement;

    const paddingBottom = document.createElement("div");
    paddingBottom.style.height = "80px";
    clone.appendChild(paddingBottom);

    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.appendChild(clone);
    document.body.appendChild(container);

    const canvas = await html2canvas(clone);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("l", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.setFontSize(16);
    pdf.text("Control Despacho", pdfWidth / 2, 15, { align: "center" });

    pdf.addImage(imgData, "PNG", 0, 20, pdfWidth, pdfHeight);
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, "0")}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${today.getFullYear()}`;

    pdf.save(`ControlDespacho_${formattedDate}.pdf`);

    document.body.removeChild(container);
  };

  const handleSearch = async () => {
    setIsLoading(true);
    setHasSearched(true);

    let headers = headersRuta5;
    let controles = controlesRuta5;
    let newSubdividedColumns = [3, 4, 5, 6, 7, 8, 9];

    if (selectedRoute === "6") {
      headers = headersRuta6;
      controles = controlesRuta6;
      newSubdividedColumns = [3, 4, 5, 6, 7, 8, 9];
    }

    setActiveHeaders(headers);
    setSubdividedColumns(newSubdividedColumns);

    try {
      const url = `https://villa.velsat.pe:8443/api/Datero/control/${date}/${selectedRoute}`;
      const response = await fetch(url);
      if (!response.ok)
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      const result = await response.json();

      if (result.data.length === 0) {
        setRows([]);
        return;
      }

      result.data.sort((a: Despacho, b: Despacho) => b.codasig - a.codasig);

      const newRows = result.data.map((item: Despacho) => {
        const base = [item.deviceid, item.hora_inicio, item.hora_registro];

        const controlMap: Record<string, string[]> = {};
        controles.forEach((control) => {
          controlMap[control.toUpperCase()] = ["", "", ""];
        });

        item.controles.forEach((c: Control) => {
          const nom = c.nom_control?.toUpperCase()?.trim();
          if (nom && controlMap[nom]) {
            let voladoNumerico = "0";
            if (c.volado) {
              const voladoStr = c.volado.trim();
              if (voladoStr.toLowerCase().includes("m")) {
                // Si contiene "m" (como "5min"), procesar normalmente
                voladoNumerico = voladoStr.match(/^[+-]?\d+/)?.[0] || "0";
              } else if (voladoStr.toLowerCase().endsWith("seg")) {
                // Si NO contiene "m" pero termina en "seg", mostrar +0
                voladoNumerico = "+0";
              } else {
                // Otros casos, procesar normalmente
                voladoNumerico = voladoStr.match(/^[+-]?\d+/)?.[0] || "0";
              }
            } else {
              voladoNumerico = "0";
            }
            controlMap[nom] = [
              c.hora_estimada || "",
              c.hora_llegada || "",
              voladoNumerico,
            ];
          }
        });

        const controlValues = headers
          .map((header, i) =>
            newSubdividedColumns.includes(i) ? controlMap[header] : null
          )
          .filter((v) => v !== null) as string[][];

        return [...base, ...controlValues, item.nombreConductor];
      });

      setRows(newRows);
    } catch (error) {
      console.error("Error al obtener datos:", error);
      setRows([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDataSent = () => {
    console.log("Datos enviados exitosamente, actualizando tabla...");
    handleSearch();
  };


  const filteredRows = rows.filter((row) => {
    return row.some((cell, index) => {
      if (subdividedColumns.includes(index)) {
        return (cell as string[]).some((subcell) =>
          subcell.toLowerCase().includes(searchText.toLowerCase())
        );
      } else if (typeof cell === "string") {
        return cell.toLowerCase().includes(searchText.toLowerCase());
      }
      return false;
    });
  });

  // Nueva variable para determinar si hay datos cargados
  const hasLoadedData = hasSearched && rows.length > 0;

  // Variable para determinar si hay resultados de búsqueda
  const hasSearchResults = filteredRows.length > 0;

  return (
    <div className="p-2 space-y-4">
      {/* Cabecera */}
      <div className="border border-gray-800 p-4 sm:p-2">
        <h2 className="text-center text-blue-800 font-semibold text-lg mb-4 dark:text-gray-100">
          Búsqueda de Despacho
        </h2>

<div className="flex flex-col xl:flex-row gap-4 xl:gap-6 items-center justify-center">
  {/* Ruta */}
  <div className="w-full max-w-md xl:max-w-none xl:w-auto">
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 sm:w-28 xl:w-22 flex-shrink-0">
        Seleccionar Ruta:
      </label>
      <select
        className="w-full sm:min-w-[250px] xl:min-w-[230px] border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm bg-white dark:bg-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md dark:text-gray-300"
        value={selectedRoute}
        onChange={(e) => setSelectedRoute(e.target.value)}
        disabled={isLoading}
      >
        <option value="5">1234 - La Perla - San Juan (A)</option>
        <option value="6">1234 - San Juan - La Perla (B)</option>
      </select>
    </div>
  </div>

  {/* Fecha */}
  <div className="w-full max-w-md xl:max-w-none xl:w-auto">
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 sm:w-28 xl:w-30 flex-shrink-0">
        Fecha Búsqueda:
      </label>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full sm:min-w-[200px] xl:min-w-[150px] border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm bg-white dark:bg-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md dark:text-gray-300"
        disabled={isLoading}
      />
    </div>
  </div>

  {/* Botón */}
  <div className="w-full max-w-md xl:max-w-none xl:w-auto flex justify-center xl:justify-start mt-2 xl:mt-0">
    <button
      onClick={handleSearch}
      disabled={isLoading}
      className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-medium px-6 py-2 rounded flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Cargando...
        </>
      ) : (
        <>
          <Search className="w-4 h-4" />
          Buscar
        </>
      )}
    </button>
  </div>

  <div className="w-full xl:w-auto flex justify-center items-center">
    <DataOffLineGps
      ruta={selectedRoute}
      fecha={date}
      onDataSent={handleDataSent}
    />
  </div>
</div>


      </div>

      {/* Sección de búsqueda y botones - Solo mostrar si hay datos cargados */}
      {!isLoading && hasLoadedData && (
        <div className="space-y-2">
          <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
            {/* BUSCAR (izquierda) */}
            <div className="relative flex items-center w-[390px]">
              <Search className="absolute left-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar Despachos"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 text-sm bg-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md placeholder-gray-800"
              />
              {searchText && (
                <button
                  onClick={() => setSearchText("")}
                  className="absolute right-3 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* BOTONES DESCARGA (derecha) */}
            <div className="flex items-center gap-3">
              <button
                onClick={exportExcel}
                className="flex items-center gap-2 bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded text-sm font-medium"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Excel
              </button>
              <button
                onClick={exportPDF}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium"
              >
                <FileText className="w-4 h-4" />
                PDF
              </button>
            </div>
          </div>

          {/* Mensaje cuando no hay resultados de búsqueda pero sí hay datos */}
          {searchText && !hasSearchResults && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <p className="text-yellow-800">
                No se encontraron resultados para &quot;{searchText}&quot;.
                <button
                  onClick={() => setSearchText("")}
                  className="ml-2 text-yellow-600 hover:text-yellow-800 underline"
                >
                  Limpiar búsqueda
                </button>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Mensaje inicial - Solo mostrar si no se ha buscado */}
      {!isLoading && !hasSearched && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="text-6xl text-gray-400">🔍</div>
          <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300">
            Seleccione una ruta, fecha y presione en Buscar
          </h3>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600 dark:text-gray-300">
            Cargando despachos...
          </p>
        </div>
      )}

      {/* Mensaje cuando no hay datos del API */}
      {!isLoading && hasSearched && rows.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="text-6xl text-gray-300">📋</div>
          <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300">
            No se encontraron despachos
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-center">
            No hay despachos registrados para la fecha y ruta seleccionada.
          </p>
        </div>
      )}

      {/* Tabla - Solo mostrar si hay datos cargados */}
      {!isLoading && hasLoadedData && (
        <div id="tabla-pdf" className="overflow-x-auto">
          <table className="min-w-full border text-sm text-center border-collapse">
            <thead>
              {/* CABECERAS */}
              <tr className="bg-slate-200">
                {activeHeaders.map((header, index) => {
                  if (subdividedColumns.includes(index)) {
                    return (
                      <th
                        key={index}
                        colSpan={3}
                        className="border border-gray-500 px-3 py-2 font-bold text-[11px] uppercase text-center text-black"
                      >
                        {header}
                      </th>
                    );
                  } else {
                    return (
                      <th
                        key={index}
                        rowSpan={2}
                        className="border border-gray-500 px-3 py-2 font-bold text-[11px] align-middle text-center text-black"
                      >
                        {header}
                      </th>
                    );
                  }
                })}
              </tr>
            </thead>

            <tbody>
              {filteredRows.map((row, rowIndex) => {
                const conductorIndex = row.length - 1;
                const visibleData = row.slice(0, conductorIndex);
                const conductor = row[conductorIndex];
                const total = visibleData.reduce((acc, cell, index) => {
                  
                  if (
                    subdividedColumns.includes(index) &&
                    Array.isArray(cell)
                  ) {
                    const raw = (cell[2] || "0").trim();
                    // No sumar si es "+0" (que viene de valores "seg")
                    if (raw === "+0") return acc;
                    const value = parseInt(raw);
                    if (!isNaN(value) && value > 0) acc += value;
                  }
                  return acc;
                }, 0);

                // Verificar si esta fila tiene horas en los controles
                const hasHours = hasControlTimes(row);

                return (
                  <tr key={rowIndex} className={"bg-gray"}>
                    {visibleData.map((cell, cellIndex) => (
                      <React.Fragment key={cellIndex}>
                        {subdividedColumns.includes(cellIndex) ? (
                          (cell as string[]).map((value, i) => {
                            // Definir colores: grises si no hay horas, normales si las hay
                            let bgColor = "";
                            if (hasHours) {
                              // Colores normales
                              bgColor =
                                i === 0
                                  ? "bg-[#fdecc1]" // Estimada
                                  : i === 1
                                  ? "bg-[#cbfdc1]" // Llegada
                                  : "bg-[#c1fdeb]"; // Volado
                            } else {
                              // Colores grises
                              bgColor = "bg-gray-200";
                            }

                            return (
                              <td
                                key={`${cellIndex}-${i}`}
                                className={`border border-gray-500 py-1 text-xs text-center ${bgColor} text-gray-800`}
                              >
                                {value}
                              </td>
                            );
                          })
                        ) : (
                          <td className="border border-gray-500 px-2 py-1 text-xs text-center dark:text-gray-300">
                            {cell}
                          </td>
                        )}
                      </React.Fragment>
                    ))}

                    {/* Conductor */}
                    <td className="border border-gray-500 px-2 py-1 text-xs text-center dark:text-gray-300">
                      {conductor}
                    </td>
                    {/* Total */}
                    <td className="border border-gray-500 px-2 py-1 text-xs text-center dark:text-gray-300">
                      {total > 0 ? `+${total}` : total < 0 ? total : "+0"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
