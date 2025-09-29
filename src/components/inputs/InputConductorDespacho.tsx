import React, { useState, useEffect } from "react";

interface Conductor {
  apellidos: string;
  codtaxi: string;
  nombres: string | null;
}

export default function AutocompleteConductor({
  onChangeCodTaxi,
  defaultValue,
}: {
  onChangeCodTaxi: (codtaxi: string, apellidos: string) => void;
  defaultValue?: string;
}) {
  const [query, setQuery] = useState(defaultValue || "");
  const [allConductores, setAllConductores] = useState<Conductor[]>([]);
  const [filtered, setFiltered] = useState<Conductor[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Obtener todos los conductores al montar
  useEffect(() => {
    const fetchAllConductores = async () => {
      try {
        const res = await fetch("https://villa.velsat.pe:8443/api/Caja/conductoresDisp/etudvrb");
        const data: Conductor[] = await res.json();
        setAllConductores(data);
      } catch (error) {
        console.error("Error cargando conductores:", error);
      }
    };

    fetchAllConductores();
  }, []);

  // Filtrar cuando cambia el query
  useEffect(() => {
    if (query.length < 2) {
      setFiltered([]);
      return;
    }

    const matches = allConductores.filter((c) =>
      c.apellidos.toLowerCase().includes(query.toLowerCase())
    );
    setFiltered(matches);
  }, [query, allConductores]);

  // Para seleccionar un conductor
  function handleSelect(conductor: Conductor) {
    const apellido = conductor.apellidos.trim();
    setQuery(apellido);
    onChangeCodTaxi(conductor.codtaxi, apellido);
    setShowDropdown(false);
  }

  // Actualizar si viene defaultValue inicial
useEffect(() => {
  if (defaultValue && allConductores.length > 0) {
    setQuery(defaultValue);

    const encontrado = allConductores.find(
      (c) => c.apellidos.trim().toLowerCase() === defaultValue.trim().toLowerCase()
    );

    if (encontrado) {
      onChangeCodTaxi(encontrado.codtaxi, encontrado.apellidos.trim());
    }
  }
}, [defaultValue, allConductores]);


  return (
    <div className="relative">
      <input
        type="text"
        className="bg-white border border-gray-300 px-3 py-1.5 w-full focus:border-orange-400 focus:outline-none"
        placeholder="Escribe apellido..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
      />
      {showDropdown && filtered.length > 0 && (
        <ul className="absolute z-10 bg-white border border-gray-300 w-full max-h-48 overflow-auto rounded mt-1 shadow-lg">
          {filtered.map((conductor) => (
            <li
              key={conductor.codtaxi}
              className="cursor-pointer px-4 py-2 hover:bg-gray-200"
              onClick={() => handleSelect(conductor)}
            >
              {conductor.apellidos.trim()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
