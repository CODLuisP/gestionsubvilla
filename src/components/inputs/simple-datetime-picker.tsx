"use client"

import { useState, useEffect } from "react"
import { format, parse, isValid } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SimpleDateTimePickerProps {
  defaultValue?: string // Formato esperado: "DD/MM/YYYY HH:MM"
  onChange?: (value: string, date: Date | null) => void
}

export default function SimpleDateTimePicker({ defaultValue = "", onChange }: SimpleDateTimePickerProps) {
  const [date, setDate] = useState<Date | undefined>(() => {
    if (defaultValue) {
      try {
        const parsedDate = parse(defaultValue, "dd/MM/yyyy HH:mm", new Date())
        return isValid(parsedDate) ? parsedDate : undefined
      } catch {
        console.error("Error parsing default date:")
        return undefined
      }
    }
    return undefined
  })

  const [inputValue, setInputValue] = useState(defaultValue)
  const [open, setOpen] = useState(false)
  const [hours, setHours] = useState(() => {
    if (date) {
      return date.getHours().toString().padStart(2, "0")
    }
    return "12"
  })
  const [minutes, setMinutes] = useState(() => {
    if (date) {
      return date.getMinutes().toString().padStart(2, "0")
    }
    return "00"
  })

  // Actualizar el input cuando cambia la fecha o la hora
  useEffect(() => {
    if (date) {
      const dateWithTime = new Date(date)
      dateWithTime.setHours(Number.parseInt(hours), Number.parseInt(minutes), 0, 0)
      const formattedValue = format(dateWithTime, "dd/MM/yyyy HH:mm")
      setInputValue(formattedValue)

      // Notificar al componente padre si hay un cambio
      onChange?.(formattedValue, dateWithTime)
    } else if (inputValue && !date) {
      // Si se limpió la fecha
      onChange?.("", null)
    }
  }, [date, hours, minutes, onChange])

  // Manejar cambios en el input
  const handleInputChange = (value: string) => {
    setInputValue(value)

    try {
      // Intentar parsear la fecha y hora (formato: DD/MM/YYYY HH:MM)
      const parsedDate = parse(value, "dd/MM/yyyy HH:mm", new Date())

      if (isValid(parsedDate)) {
        setDate(parsedDate)
        setHours(parsedDate.getHours().toString().padStart(2, "0"))
        setMinutes(parsedDate.getMinutes().toString().padStart(2, "0"))
      } else if (value === "") {
        // Si el input está vacío, limpiar la fecha
        setDate(undefined)
        onChange?.("", null)
      }
    } catch {
      // Si hay error al parsear, no actualizamos la fecha
    }
  }

  // Generar opciones de hora (0-23)
  const generateHourOptions = () => {
    const options = []
    for (let hour = 0; hour < 24; hour++) {
      options.push(hour.toString().padStart(2, "0"))
    }
    return options
  }

  // Generar opciones de minutos (0-59)
  const generateMinuteOptions = () => {
    const options = []
    for (let minute = 0; minute < 60; minute++) {
      options.push(minute.toString().padStart(2, "0"))
    }
    return options
  }

  const hourOptions = generateHourOptions()
  const minuteOptions = generateMinuteOptions()

  return (
    <div className="w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Input
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="DD/MM/YYYY HH:MM"
              className="pr-10"
            />
            <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-full" onClick={() => setOpen(true)}>
              <CalendarIcon className="h-4 w-4" />
            </Button>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-4 space-y-4">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => {
                setDate(newDate)
                if (!newDate) {
                  setInputValue("")
                }
              }}
              initialFocus
            />
            <div className="space-y-2">
              <div className="text-sm font-medium">Hora</div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Select value={hours} onValueChange={setHours}>
                    <SelectTrigger>
                      <SelectValue placeholder="HH" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {hourOptions.map((hour) => (
                        <SelectItem key={hour} value={hour}>
                          {hour}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-center">
                  <span className="text-lg font-medium">:</span>
                </div>
                <div className="flex-1">
                  <Select value={minutes} onValueChange={setMinutes}>
                    <SelectTrigger>
                      <SelectValue placeholder="MM" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {minuteOptions.map((minute) => (
                        <SelectItem key={minute} value={minute}>
                          {minute}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  const now = new Date()
                  setDate(now)
                  setHours(now.getHours().toString().padStart(2, "0"))
                  setMinutes(now.getMinutes().toString().padStart(2, "0"))
                }}
                size="sm"
              >
                Ahora
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setDate(undefined)
                  setInputValue("")
                  onChange?.("", null)
                }}
                size="sm"
              >
                Limpiar
              </Button>
              <Button onClick={() => setOpen(false)} size="sm">
                Aceptar
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
