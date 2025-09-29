import React, { useEffect, useState } from "react";

type Conductor = {
  codigo: string;
  apepate: string;
};

type Props = {
  onSelect: (conductor: Conductor) => void;
};

const InputConductor: React.FC<Props> = ({ onSelect }) => {
  const [inputValue, setInputValue] = useState("");
  const [conductores, setConductores] = useState<Conductor[]>([]);
  const [filtered, setFiltered] = useState<Conductor[]>([]);
  const [showOptions, setShowOptions] = useState(false);
  const [isSelected, setIsSelected] = useState(false);

  useEffect(() => {
    const fetchConductores = async () => {
      try {
        const res = await fetch("https://villa.velsat.pe:8443/api/Caja/conductores");
        const data = await res.json();
        setConductores(data);
      } catch (error) {
        console.error("Error al cargar conductores:", error);
      }
    };
    fetchConductores();
  }, []);

  useEffect(() => {
    if (isSelected || inputValue.trim() === "") {
      setFiltered([]);
      setShowOptions(false);
      return;
    }

    const filteredData = conductores.filter((c) =>
      c.apepate.toLowerCase().includes(inputValue.toLowerCase())
    );
    setFiltered(filteredData);
    setShowOptions(true);
  }, [inputValue, conductores, isSelected]);

  const handleSelect = (conductor: Conductor) => {
    setInputValue(conductor.apepate);
    setShowOptions(false);
    setIsSelected(true);
    onSelect(conductor);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsSelected(false);
  };

  return (
    <div className="relative w-full max-w-md">
      <span className="block mb-1 text-sm font-semibold text-gray-800">
        Escriba conductor
      </span>
      <input
        type="text"
        placeholder="Conductor"
        value={inputValue}
        onChange={handleChange}
        className="w-full rounded border bg-gray-100 border-gray-200 p-1.5 text-[12px] text-gray-900 placeholder-gray-700 focus:border-gray-300 focus:outline-none focus:ring-0"
      />
      {showOptions && filtered.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filtered.map((conductor) => (
            <li
              key={conductor.codigo}
              onClick={() => handleSelect(conductor)}
              className="px-4 py-2 cursor-pointer hover:bg-blue-100"
            >
              {conductor.apepate}
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

export default InputConductor;
