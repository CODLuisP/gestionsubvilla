import React, { useEffect, useState } from "react";

type Despachador = {
  codDespachador: number;
  apellidos: string;

};

type Props = {
  onSelect: (despachador: Despachador) => void;
};

const InputDespachadores: React.FC<Props> = ({ onSelect }) => {
  const [inputValue, setInputValue] = useState("");
  const [resultados, setResultados] = useState<Despachador[]>([]);
  const [showOptions, setShowOptions] = useState(false);
  const [isSelected, setIsSelected] = useState(false);

  useEffect(() => {
    if (isSelected || inputValue.trim() === "") {
      setResultados([]);
      setShowOptions(false);
      return;
    }

    const fetchDespachadores = async () => {
      try {
        const res = await fetch(
          `https://villa.velsat.pe:8443/api/Caja/despachadores?palabra=${encodeURIComponent(
            inputValue
          )}`
        );
        const data = await res.json();
        setResultados(data);
        setShowOptions(true);
      } catch (error) {
        console.error("Error al cargar despachadores:", error);
      }
    };

    const timer = setTimeout(fetchDespachadores, 300); 
    return () => clearTimeout(timer);
  }, [inputValue, isSelected]);

  const handleSelect = (despachador: Despachador) => {
    setInputValue(despachador.apellidos);
    setShowOptions(false);
    setIsSelected(true);
    onSelect(despachador);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsSelected(false); 
  };

  return (
    <div className="relative w-full max-w-md">
      <span className="block mb-1 text-sm font-semibold text-gray-800">
        Escriba despachador
      </span>
      <input
        type="text"
        placeholder="Buscar despachador"
        value={inputValue}
        onChange={handleChange}
        className="w-full rounded border bg-gray-100 border-gray-200 p-1.5 text-[12px] text-gray-900 placeholder-gray-700 focus:border-gray-300 focus:outline-none focus:ring-0"
      />
      {showOptions && resultados.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {resultados.map((desp) => (
            <li
              key={desp.codDespachador}
              onClick={() => handleSelect(desp)}
              className="px-4 py-2 cursor-pointer hover:bg-blue-100"
            >
              {desp.apellidos}
            </li>
          ))}
        </ul>
      )}
      {showOptions && resultados.length === 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg px-4 py-2 text-gray-500">
          No se encontraron resultados
        </div>
      )}
    </div>
  );
};

export default InputDespachadores;
