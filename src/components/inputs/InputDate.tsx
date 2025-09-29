import React, { useState, useEffect, forwardRef } from "react";

type InputDateProps = {
  value?: string;
  onChange?: (value: string) => void;
};

const InputDate = forwardRef<HTMLInputElement, InputDateProps>(
  ({ value = "", onChange }, ref) => {
    const [selectedDate, setSelectedDate] = useState<string>(value);

    useEffect(() => {
      setSelectedDate(value);
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSelectedDate(e.target.value);
      if (onChange) {
        onChange(e.target.value);
      }
    };

    return (
      <div className="flex flex-col w-full max-w-xs">
        <label htmlFor="date" className="mb-1 text-sm font-medium text-gray-800">
          Fecha
        </label>
        <input
          type="date"
          id="date"
          name="date"
          ref={ref}
          value={selectedDate}
          onChange={handleChange}
          className="rounded border border-gray-300 bg-gray-100 p-1 text-[12px] shadow-sm focus:border-gray-300 focus:outline-none focus:ring-0"
        />
      </div>
    );
  }
);

InputDate.displayName = "InputDate"; // 👈 Esto elimina el error

export default InputDate;
