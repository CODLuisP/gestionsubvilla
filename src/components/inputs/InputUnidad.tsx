import React, { useEffect, useState } from "react";

type Unidad = {
  id: number;
  codunidad: string;
};

type Props = {
  onSelect: (unidad: Unidad) => void;
};

const InputUnidad: React.FC<Props> = ({ onSelect }) => {
  const [inputValue, setInputValue] = useState("");
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [filtered, setFiltered] = useState<Unidad[]>([]);
  const [showOptions, setShowOptions] = useState(false);
  const [isSelected, setIsSelected] = useState(false);

  useEffect(() => {
    const fetchUnidades = async () => {
      try {
        const res = await fetch("https://villa.velsat.pe:8443/api/Caja/unidades");
        const data = await res.json();
        setUnidades(data);
      } catch (error) {
        console.error("Error al cargar unidades:", error);
      }
    };
    fetchUnidades();
  }, []);

  useEffect(() => {
    if (isSelected || inputValue.trim() === "") {
      setFiltered([]);
      setShowOptions(false);
      return;
    }

    const filteredData = unidades.filter((u) =>
      u.codunidad.toLowerCase().includes(inputValue.toLowerCase())
    );
    setFiltered(filteredData);
    setShowOptions(true);
  }, [inputValue, unidades, isSelected]);

  const handleSelect = (unidad: Unidad) => {
    setInputValue(unidad.codunidad);
    setShowOptions(false);
    setIsSelected(true);
    onSelect(unidad);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsSelected(false);
  };

  return (
    <div className="relative w-full max-w-md">
      <span className="block mb-1 text-sm font-semibold text-gray-800">
        Escriba unidad
      </span>
      <input
        type="text"
        placeholder="Unidad"
        value={inputValue}
        onChange={handleChange}
        className="w-full rounded border bg-gray-100 border-gray-200 p-1.5 text-[12px] text-gray-900 placeholder-gray-700 focus:border-gray-300 focus:outline-none focus:ring-0"
      />
      {showOptions && filtered.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filtered.map((unidad) => (
            <li
              key={unidad.id}
              onClick={() => handleSelect(unidad)}
              className="px-4 py-2 cursor-pointer hover:bg-blue-100"
            >
              {unidad.codunidad}
            </li>
          ))}
        </ul>
      )}
      {showOptions && filtered.length === 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg px-4 py-2 text-gray-500">
          No se encontraron resultados
        </div>
      )}
    </div>
  );
};

export default InputUnidad;
