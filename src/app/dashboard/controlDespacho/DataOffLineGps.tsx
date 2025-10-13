"use client";
import { useState, useEffect, useMemo } from "react";
import {
  AlertTriangle,
  MapPin,
  TrendingUp,
  Download,
  RefreshCw,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";

// Definir los tipos de las props
interface DataOffLineGpsProps {
  ruta: string;
  fecha: string;
  onDataSent?: () => void;
  specificVehicle?: string; // ⬅️ NUEVO: Para cargar una unidad específica
  buttonVariant?: "default" | "small"; 
}

// Tipos TypeScript
interface GPSPoint {
  item: number;
  fecha: string;
  hora: string;
  speedKPH: number;
  longitude: number;
  latitude: number;
  odometerKM: number;
  address: string;
}

interface Geofence {
  id: number;
  name: string;
  centerLat: number;
  centerLon: number;
  radius: number;
  active: boolean;
}

interface Detection {
  type: "entry" | "exit" | "pass_through" | "near_zone";
  fromPoint: GPSPoint;
  toPoint: GPSPoint;
  distanceFrom: number;
  distanceTo: number;
  minDistanceToCenter?: number;
  geofence: Geofence;
  confidence: "high" | "medium" | "low";
  timestamp: string;
  vehicleId: string;
  adaptiveRadius?: number; // Radio usado para la detección
  endTime?: string;
}

// interface DetectionResult {
//   geofence: Geofence;
//   detections: Detection[];
//   summary: {
//     total: number;
//     entries: number;
//     exits: number;
//     passThrough: number;
//     nearZone: number;
//   };
// }

interface APIResponse {
  listaTablas: GPSPoint[];
}

interface VehicleSchedule {
  vehicleId: string;
  codigo: number;
  startTime: string;
  endTime: string;
}

interface BatchAnalysisResult {
  vehicleId: string;
  codigo: number; // ← AGREGAR ESTO
  fechaini: string; // ← AGREGAR ESTO
  status: "detected" | "not_detected" | "error";
  detections: Detection[];
  error?: string;
  gpsPointsCount: number;
}

interface APIVehicleData {
  codigo: number;
  deviceID: string;
  fechaini: string;
  fechafin: string;
}

interface APIDataItem {
  Codasig: string;
  DeviceID: string;
  Nom_control: string;
  Hora_inicio: string;
  Hora_estimada: string;
  Hora_llegada: string;
  Volado: string;
  Fecha: string;
}

// Modificar la función para recibir las props con tipos
export default function DataOffLineGps({
  ruta,
  fecha,
  onDataSent,
  specificVehicle, // ⬅️ NUEVO
  buttonVariant = "default", // ⬅️ NUEVO
}: DataOffLineGpsProps) {
  const [open, setOpen] = useState(false);

  const getDynamicMinutesForRoute25 = (
    hours: number,
    minutes: number,
    seconds: number = 0
  ): number[] => {
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;

    const timeRanges = [
      {
        start: 5 * 3600 + 0 * 60 + 0,
        end: 5 * 3600 + 4 * 60 + 59,
        minutes: [5, 35, 60, 75, 90, 110, 140, 146],
      }, // 5:00:00 - 5:04:59
      {
        start: 5 * 3600 + 5 * 60 + 0,
        end: 5 * 3600 + 9 * 60 + 59,
        minutes: [5, 35, 60, 75, 90, 110, 140, 146],
      }, // 5:05:00 - 5:09:59
      {
        start: 5 * 3600 + 10 * 60 + 0,
        end: 5 * 3600 + 14 * 60 + 59,
        minutes: [5, 35, 60, 75, 90, 110, 140, 146],
      }, // 5:10:00 - 5:14:59
      {
        start: 5 * 3600 + 15 * 60 + 0,
        end: 5 * 3600 + 19 * 60 + 59,
        minutes: [5, 35, 60, 75, 90, 110, 141, 147],
      }, // 5:15:00 - 5:19:59
      {
        start: 5 * 3600 + 20 * 60 + 0,
        end: 5 * 3600 + 24 * 60 + 59,
        minutes: [5, 35, 60, 75, 90, 110, 142, 148],
      }, // 5:20:00 - 5:24:59
      {
        start: 5 * 3600 + 25 * 60 + 0,
        end: 5 * 3600 + 29 * 60 + 59,
        minutes: [5, 35, 60, 75, 90, 110, 143, 149],
      }, // 5:25:00 - 5:29:59
      {
        start: 5 * 3600 + 30 * 60 + 0,
        end: 5 * 3600 + 34 * 60 + 59,
        minutes: [5, 35, 60, 75, 90, 110, 144, 150],
      }, // 5:30:00 - 5:34:59
      {
        start: 5 * 3600 + 35 * 60 + 0,
        end: 5 * 3600 + 39 * 60 + 59,
        minutes: [5, 35, 60, 75, 90, 110, 145, 151],
      }, // 5:35:00 - 5:39:59
      {
        start: 5 * 3600 + 40 * 60 + 0,
        end: 5 * 3600 + 44 * 60 + 59,
        minutes: [5, 36, 62, 77, 92, 113, 149, 155],
      }, // 5:40:00 - 5:44:59
      {
        start: 5 * 3600 + 45 * 60 + 0,
        end: 5 * 3600 + 49 * 60 + 59,
        minutes: [5, 37, 64, 79, 94, 116, 153, 159],
      }, // 5:45:00 - 5:49:59
      {
        start: 5 * 3600 + 50 * 60 + 0,
        end: 5 * 3600 + 54 * 60 + 59,
        minutes: [5, 38, 66, 81, 96, 119, 157, 163],
      }, // 5:50:00 - 5:54:59
      {
        start: 5 * 3600 + 55 * 60 + 0,
        end: 5 * 3600 + 59 * 60 + 59,
        minutes: [5, 39, 68, 83, 98, 122, 161, 167],
      }, // 5:55:00 - 5:59:59
    ];

    for (const range of timeRanges) {
      if (totalSeconds >= range.start && totalSeconds <= range.end) {
        return range.minutes;
      }
    }

    // Para 6:00 en adelante (minutos constantes)
    return [5, 40, 70, 85, 100, 125, 165, 171];
  };

  const adjustTimeForLargeRadius = (
    timeString: string,
    adaptiveRadius?: number
  ): string => {
    let secondsToSubtract = 0;

    switch (adaptiveRadius) {
      case 10:
        secondsToSubtract = 40; // 0:40
        break;
      case 20:
      case 30:
      case 40:
        secondsToSubtract = 45; // 0:45
        break;
      case 50:
        secondsToSubtract = 30; // 0:30
        break;
      case 100:
        secondsToSubtract = 90; // 1:30
        break;
      case 200:
        secondsToSubtract = 150; // 2:30
        break;
      case 300:
        secondsToSubtract = 140; // 2:20
        break;
      case 400:
        secondsToSubtract = 180; // 3:00
        break;
      case 500:
        secondsToSubtract = 240; // 4:00
        break;
      default:
        return timeString; // no ajuste
    }

    const [hours, minutes, seconds] = timeString.split(":").map(Number);
    let totalSeconds = hours * 3600 + minutes * 60 + seconds;

    totalSeconds -= secondsToSubtract;

    // Evitar tiempos negativos
    if (totalSeconds < 0) totalSeconds = 0;

    const adjustedHours = Math.floor(totalSeconds / 3600);
    const adjustedMinutes = Math.floor((totalSeconds % 3600) / 60);
    const remainingSeconds = totalSeconds % 60;

    return `${adjustedHours.toString().padStart(2, "0")}:${adjustedMinutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const calculateTimeDifference = (
    startTime: string,
    endTime: string
  ): string => {
    const timeToSeconds = (time: string): number => {
      const parts = time.split(":").map(Number);
      const hours = parts[0] || 0;
      const minutes = parts[1] || 0;
      const seconds = parts[2] || 0;
      return hours * 3600 + minutes * 60 + seconds;
    };

    const startSeconds = timeToSeconds(startTime);
    const endSeconds = timeToSeconds(endTime);

    const rawDifference = endSeconds - startSeconds;
    const isNegative = rawDifference < 0;
    const differenceSeconds = Math.abs(rawDifference);

    const hours = Math.floor(differenceSeconds / 3600);
    const minutes = Math.floor((differenceSeconds % 3600) / 60);
    const seconds = differenceSeconds % 60;

    let result = "";
    if (hours > 0) {
      result = `${hours}h ${minutes}min ${seconds}seg`;
    } else if (minutes > 0) {
      result = `${minutes}min ${seconds}seg`;
    } else {
      result = `${seconds}seg`;
    }

    return isNegative ? `-${result}` : result;
  };

  const calculateEndTime = (
    startTime: string,
    minutesToAdd: number
  ): string => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + minutesToAdd;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, "0")}:${endMinutes
      .toString()
      .padStart(2, "0")}`;
  };

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [batchLoading, setBatchLoading] = useState<boolean>(false);
  const [batchResults, setBatchResults] = useState<BatchAnalysisResult[]>([]);

  useEffect(() => {
    if (open) {
      // Cuando el modal se abre, reinicia los estados
      setBatchResults([]);
      setBatchLoading(false);
    }
  }, [open]);

  // NUEVO: Estados para manejar la API de horarios
  const [vehicleSchedules, setVehicleSchedules] = useState<VehicleSchedule[]>(
    []
  );
  const [loadingSchedules, setLoadingSchedules] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>(fecha);
  const [selectedRoute, setSelectedRoute] = useState<string>(ruta);

  useEffect(() => {
    setSelectedRoute(ruta);
    setSelectedDate(fecha);
  }, [ruta, fecha]);

  // 7 GEOCERCAS FIJAS

  const getGeofencesByRoute = (route: string): Geofence[] => {
    if (route === "25") {
      return [
        {
          id: 1,
          name: "PACÍFICO",
          centerLat: -12.199361,
          centerLon: -77.028537,
          radius: 10,
          active: true,
        },
        {
          id: 2,
          name: "GALENA",
          centerLat: -12.166361,
          centerLon: -76.976759,
          radius: 10,
          active: true,
        },
        {
          id: 3,
          name: "CVA. ESPERANZA I",
          centerLat: -12.180301,
          centerLon: -76.943743,
          radius: 10,
          active: true,
        },
        {
          id: 4,
          name: "PARADERO 15",
          centerLat: -12.173399,
          centerLon: -76.916099,
          radius: 10,
          active: true,
        },
        {
          id: 5,
          name: "CVA. ESPERANZA",
          centerLat: -12.180073,
          centerLon: -76.943156,
          radius: 10,
          active: true,
        },
        {
          id: 6,
          name: "CT",
          centerLat: -12.165106,
          centerLon: -76.972775,
          radius: 10,
          active: true,
        },
        {
          id: 7,
          name: "FERRETERÍA",
          centerLat: -12.197397,
          centerLon: -77.026855,
          radius: 10,
          active: true,
        },
        {
          id: 8,
          name: "MIYASHIRO",
          centerLat: -12.202822,
          centerLon: -77.03312,
          radius: 10,
          active: true,
        },
      ];
    } else {
      // Por defecto, usar las geocercas de ruta 5
      return getGeofencesByRoute("25");
    }
  };

  const geofences: Geofence[] = useMemo(
    () => getGeofencesByRoute(selectedRoute),
    [selectedRoute]
  );

  useEffect(() => {
    // Limpiar resultados cuando cambie la ruta o fecha
    setBatchResults([]);
  }, [selectedRoute, selectedDate]);

  // NUEVA FUNCIÓN: Cargar horarios desde la API
  const loadVehicleSchedules = async (): Promise<void> => {
  setLoadingSchedules(true);
  setError(null);

  try {
    const url = `https://villa.velsat.pe:8443/api/Datero/GPSUniDespEdu?fecha=${selectedDate}&ruta=${selectedRoute}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Error HTTP ${response.status}: No se pudieron cargar los horarios`
      );
    }

    const apiData: APIVehicleData[] = await response.json();

    if (!apiData || apiData.length === 0) {
      throw new Error(
        "No se encontraron vehículos para la fecha y ruta seleccionadas"
      );
    }

    // Convertir los datos de la API al formato VehicleSchedule
    let schedules: VehicleSchedule[] = apiData.map((item) => ({
      vehicleId: item.deviceID,
      codigo: item.codigo,
      startTime: item.fechaini,
      endTime: item.fechafin,
    }));

    // ⬇️ NUEVO: Filtrar por vehículo específico si se proporciona
    if (specificVehicle) {
      schedules = schedules.filter((s) => s.vehicleId === specificVehicle);
      
      if (schedules.length === 0) {
        throw new Error(`No se encontró el vehículo ${specificVehicle}`);
      }
    }

    setVehicleSchedules(schedules);
    setBatchResults([]);
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Error al cargar los horarios de vehículos"
    );
    setVehicleSchedules([]);
  } finally {
    setLoadingSchedules(false);
  }
};

  // Cargar horarios al montar el componente y cuando cambien ruta o fecha
  useEffect(() => {
    loadVehicleSchedules();
  }, [selectedDate, selectedRoute]);

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371000; // Radio de la Tierra en metros
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

const analyzeTrajectoryIntersection = (
  gpsPoints: GPSPoint[],
  geofence: Geofence,
  vehicleId: string
): Detection[] => {
  const detections: Detection[] = [];
  const processedIndices = new Set<number>();

  // Solo log para esta unidad específica
  const shouldLog = vehicleId === "228-aki820";

  if (shouldLog) {
    console.log(`🔍 [${vehicleId}] Analizando ${gpsPoints.length} puntos GPS para geocerca: ${geofence.name}`);
  }

  for (let i = 0; i < gpsPoints.length; i++) {
    const point = gpsPoints[i];
    
    if (!point) continue;

    const distance = calculateDistance(
      geofence.centerLat,
      geofence.centerLon,
      point.latitude,
      point.longitude
    );

    const roundedDistance = Math.round(distance * 10) / 10;

    // LOG solo para esta unidad: Mostrar distancia de puntos cercanos (menos de 50m)
    if (shouldLog && roundedDistance <= 50) {
  console.log(`📍 [${vehicleId}] Punto ${point.item} - Distancia: ${roundedDistance}m - ${point.hora} - Geocerca: ${geofence.name}`);
}

    if (roundedDistance <= geofence.radius && !processedIndices.has(i)) {
      processedIndices.add(i);
      
      if (shouldLog) {
        console.log(`✅ [${vehicleId}] CAPTURADO - Punto ${point.item} dentro del radio (${Math.round(distance)}m) - ${geofence.name}`);
      }
      
      detections.push({
        type: "entry",
        fromPoint: point,
        toPoint: point,
        distanceFrom: Math.round(distance),
        distanceTo: Math.round(distance),
        geofence: geofence,
        confidence: "high",
        timestamp: point.fecha + " " + point.hora,
        vehicleId: vehicleId,
      });
    }
  }

  if (shouldLog) {
    console.log(`📊 [${vehicleId}] Total detecciones para ${geofence.name}: ${detections.length}`);
  }
  
  return detections;
};

const analyzeWithAdaptiveRadius = (
  gpsPoints: GPSPoint[],
  geofence: Geofence,
  vehicleId: string
): { detections: Detection[]; usedRadius: number } => {
  const radiusSteps = [10, 20, 30, 40, 50, 100, 200, 300, 400, 500];
  const shouldLog = vehicleId === "228-aki820";

  if (shouldLog) {
    console.log(`🔄 [${vehicleId}] Iniciando análisis adaptativo para: ${geofence.name}`);
  }

  let bestDetections: Detection[] = [];
  let bestRadius = 10;

  // Probar TODOS los radios y quedarse con el que más puntos capture
  for (const radius of radiusSteps) {
    const adaptedGeofence = { ...geofence, radius };
    const detections = analyzeTrajectoryIntersection(
      gpsPoints,
      adaptedGeofence,
      vehicleId
    );

    if (shouldLog) {
      console.log(`🔍 [${vehicleId}] Radio ${radius}m → ${detections.length} detecciones para ${geofence.name}`);
    }

    // Si encontramos más puntos que antes, actualizar
    if (detections.length > bestDetections.length) {
      bestDetections = detections;
      bestRadius = radius;
    }

    // Si con 20m ya capturamos varios puntos, no necesitamos seguir expandiendo
    if (detections.length >= 2 && radius === 20) {
      break;
    }
  }

  if (bestDetections.length > 0) {
    const adaptedDetections = bestDetections.map((detection) => ({
      ...detection,
      geofence: { ...geofence, radius: bestRadius },
      adaptiveRadius: bestRadius,
    }));

    if (shouldLog) {
      console.log(`✅ [${vehicleId}] Mejor radio: ${bestRadius}m - ${bestDetections.length} punto(s) capturado(s)`);
      bestDetections.forEach(d => {
        console.log(`   → Punto: ${d.fromPoint.item} - ${d.timestamp.split(" ")[1]} - Distancia: ${d.distanceFrom}m`);
      });
    }

    return { detections: adaptedDetections, usedRadius: bestRadius };
  }

  if (shouldLog) {
    console.log(`❌ [${vehicleId}] No se encontraron detecciones para ${geofence.name}`);
  }

  return { detections: [], usedRadius: 10 };
};

  const analyzeVehicle = async (
    vehicle: VehicleSchedule
  ): Promise<BatchAnalysisResult> => {
    try {
      const startDate = `${fecha}T${vehicle.startTime}`;
      const endDate = `${fecha}T${vehicle.endTime}`;
      const url = `https://villa.velsat.pe:8443/api/Reporting/general/${startDate}/${endDate}/${vehicle.vehicleId}/etudvrb`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        return {
          vehicleId: vehicle.vehicleId,
          codigo: vehicle.codigo,
          fechaini: vehicle.startTime,
          status: "error",
          error: `HTTP ${response.status}`,
          gpsPointsCount: 0,
          detections: [],
        };
      }

      const data: APIResponse = await response.json();

      if (!data || !data.listaTablas || data.listaTablas.length === 0) {
        return {
          vehicleId: vehicle.vehicleId,
          codigo: vehicle.codigo,
          fechaini: vehicle.startTime,
          status: "not_detected",
          gpsPointsCount: 0,
          detections: [],
        };
      }

      const allDetections: Detection[] = [];
      geofences.forEach((geofence) => {
        const { detections } = analyzeWithAdaptiveRadius(
          // ⬅️ CAMBIO: detections en plural
          data.listaTablas,
          geofence,
          vehicle.vehicleId
        );
        if (detections.length > 0) {
          // ⬅️ CAMBIO: Verificar si hay detecciones
          allDetections.push(...detections); // ⬅️ CAMBIO: Spread operator para agregar todas
        }
      });

      if (allDetections.length > 0) {
        const [startHours, startMinutes] = vehicle.startTime
          .split(":")
          .map(Number);

        const dynamicMinutes = getDynamicMinutesForRoute25(
          startHours,
          startMinutes
        );

        allDetections.forEach((detection) => {
          const geofenceIndex = geofences.findIndex(
            (g) => g.id === detection.geofence.id
          );

          if (geofenceIndex !== -1 && geofenceIndex < dynamicMinutes.length) {
            detection.endTime = calculateEndTime(
              vehicle.startTime,
              dynamicMinutes[geofenceIndex]
            );
          }
        });
      }

      return {
        vehicleId: vehicle.vehicleId,
        codigo: vehicle.codigo,
        fechaini: vehicle.startTime,
        status: allDetections.length > 0 ? "detected" : "not_detected",
        detections: allDetections,
        gpsPointsCount: data.listaTablas.length,
      };
    } catch (err) {
      return {
        vehicleId: vehicle.vehicleId,
        codigo: vehicle.codigo,
        fechaini: vehicle.startTime,
        status: "error",
        error: err instanceof Error ? err.message : "Error desconocido",
        gpsPointsCount: 0,
        detections: [],
      };
    }
  };

  const analyzeBatchVehicles = async (): Promise<void> => {
    if (vehicleSchedules.length === 0) {
      setError("No hay vehículos cargados. Cargando datos...");
      await loadVehicleSchedules();
      return;
    }

    setBatchLoading(true);
    setBatchResults([]);
    setError(null);

    try {
      const results: BatchAnalysisResult[] = [];

      for (let i = 0; i < vehicleSchedules.length; i += 3) {
        const batch = vehicleSchedules.slice(i, i + 3);

        const batchPromises = batch.map((vehicle) => analyzeVehicle(vehicle));
        const batchResults = await Promise.all(batchPromises);

        results.push(...batchResults);
        setBatchResults([...results]);

        if (i + 3 < vehicleSchedules.length) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error en análisis masivo");
    } finally {
      setBatchLoading(false);
    }
  };

  const sendDataToAPI = async (): Promise<void> => {
  if (batchResults.length === 0) {
    setError("No hay datos para enviar. Realiza primero el análisis.");
    toast.error("No hay datos para enviar. Realiza primero el análisis.");
    return;
  }

  setLoading(true);
  setError(null);

  try {
    const apiData: APIDataItem[] = [];
    const vehiclesWithDetections = batchResults.filter(
      (r) => r.detections.length > 0
    );

    vehiclesWithDetections.forEach((result) => {
      const shouldLog = result.vehicleId === "228-aki820";
      
      if (shouldLog) {
        console.log(`🚗 [${result.vehicleId}] Total detecciones: ${result.detections.length}`);
      }
      
      result.detections.forEach((detection) => {
        const originalArrivalTime = detection.timestamp.split(" ")[1];
        const adjustedArrivalTime = adjustTimeForLargeRadius(
          originalArrivalTime,
          detection.adaptiveRadius
        );

        if (shouldLog) {
          console.log(`📤 [${result.vehicleId}] Enviando: ${detection.geofence.name} - Hora original: ${originalArrivalTime} - Hora ajustada: ${adjustedArrivalTime} - Radio: ${detection.adaptiveRadius}m`);
        }

        apiData.push({
          Codasig: result.codigo.toString(),
          DeviceID: result.vehicleId,
          Nom_control: detection.geofence.name,
          Hora_inicio: result.fechaini,
          Hora_estimada: detection.endTime || "",
          Hora_llegada: adjustedArrivalTime,
          Volado: calculateTimeDifference(
            detection.endTime || "",
            adjustedArrivalTime
          ),
          Fecha: fecha,
        });
      });
    });

    // Log final solo para esta unidad
    const dataFor228 = apiData.filter(d => d.DeviceID === "228-aki820");
    if (dataFor228.length > 0) {
      console.log(`📦 [228-aki820] Total registros a enviar: ${dataFor228.length}`);
      console.log('📋 [228-aki820] Datos completos:', JSON.stringify(dataFor228, null, 2));
    }

    const response = await fetch(
      "https://villa.velsat.pe:8443/api/Datero/EnvioGPS/etudvrb",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiData),
      }
    );

      if (!response.ok) {
        throw new Error(
          `Error HTTP ${response.status}: ${response.statusText}`
        );
      }

      const responseData = await response.json();

      toast.success(
        `Datos enviados exitosamente. ${apiData.length} registros enviados.`
      );
      console.log("Respuesta de la API:", responseData);

      setTimeout(() => {
        setOpen(false);
        if (onDataSent) {
          onDataSent();
        }
      }, 500);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Error desconocido al enviar datos";
      setError(`Error al enviar datos a la API: ${errorMessage}`);
      console.error("Error enviando datos:", err);
      toast.error(`❌ Error al enviar datos: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
      onClick={() => setOpen(true)}
      className={
        buttonVariant === "small"
          ? "inline-flex items-center justify-center rounded bg-green-600 px-2 py-1 text-xs font-medium text-white hover:bg-green-700"
          : "inline-flex items-center justify-center rounded-md bg-green-700 px-4 py-[11px] text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-green-700/90 focus:outline-none dark:text-white"
      }
    >
      {buttonVariant === "small" ? "Cargar" : "Cargar Voladas"}
    </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[90vw] max-w-none border-0 shadow-2xl bg-white/95 backdrop-blur-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              CARGAR DATA OFFLINE : UNIDAD DE VILLA - {"Ruta 1384 B"} ({fecha})
            </DialogTitle>
          </DialogHeader>

          {/* <div className="mt-4 p-3 bg-gray-100 rounded">
            <p className="font-medium">Datos recibidos:</p>
            <p className="text-sm">Ruta: {ruta}</p>
            <p className="text-sm">Ruta: {fecha}</p>
          </div> */}

          <div>
            <div className="p-0">
              <div>
                {/* Panel de Geocercas Fijas */}
                <div className="bg-white rounded-xl shadow-lg p-2 mb-2">
                  <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <MapPin className="text-green-600" />
                    Geocercas Configuradas
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {geofences.map((geofence) => (
                      <div
                        key={geofence.id}
                        className="border border-gray-200 rounded-lg p-2 bg-green-50"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-gray-800 text-xs">
                            {geofence.name}
                          </h3>
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            35m
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <div>Lat: {geofence.centerLat.toFixed(6)}</div>
                          <div>Lon: {geofence.centerLon.toFixed(6)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Análisis Masivo */}
                <div className="bg-white rounded-xl shadow-lg p-2 mb-2">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-sm font-semibold flex items-center">
                      Análisis masivo del gps vehicular
                    </h2>
                  </div>

                  {/* Guía paso a paso */}
                  <div className="mb-4 p-2 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded text-sm">
                    {batchResults.length === 0 && !batchLoading ? (
                      <>
                        👆 <strong>Paso 1:</strong> Haz clic en{" "}
                        <span className="font-semibold text-purple-700">
                          “Analizar datos”
                        </span>{" "}
                        para iniciar el análisis.
                      </>
                    ) : batchLoading ? (
                      <>⏳ Análisis en progreso… por favor espera.</>
                    ) : batchResults.length === vehicleSchedules.length ? (
                      <>
                        ✅ Análisis completado. 👇 <strong>Paso 2:</strong> Haz
                        clic en{" "}
                        <span className="font-semibold text-green-700">
                          “Cargar datos al despacho”
                        </span>{" "}
                        para enviar los resultados.
                      </>
                    ) : (
                      <>
                        🔍 Analizando {batchResults.length} /{" "}
                        {vehicleSchedules.length} datos…
                      </>
                    )}
                  </div>

                  {/* Botón Analizar */}
                  <div className="flex gap-3 mb-2">
                    <button
                      onClick={analyzeBatchVehicles}
                      disabled={
                        batchLoading ||
                        loadingSchedules ||
                        vehicleSchedules.length === 0 ||
                        batchResults.length === vehicleSchedules.length
                      }
                      className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2
        ${
          batchResults.length === vehicleSchedules.length
            ? "bg-gray-400"
            : "bg-purple-600 hover:bg-purple-700"
        }
        text-white
      `}
                    >
                      {batchLoading || loadingSchedules ? (
                        <RefreshCw className="animate-spin h-5 w-5" />
                      ) : (
                        <TrendingUp className="h-5 w-5" />
                      )}
                      {batchLoading
                        ? "Analizando..."
                        : loadingSchedules
                        ? "Cargando vehículos..."
                        : vehicleSchedules.length === 0
                        ? "Sin vehículos"
                        : `Analizar datos`}
                    </button>
                  </div>

                  {/* Progreso */}
                  {batchLoading && (
                    <div className="mb-4 bg-blue-50 rounded-lg p-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-blue-800">
                          Progreso del análisis
                        </span>
                        <span className="text-sm text-blue-600">
                          {batchResults.length} / {vehicleSchedules.length}
                        </span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${
                              (batchResults.length / vehicleSchedules.length) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Botón Cargar Datos */}
                  <div className="flex justify-end">
                    <button
                      onClick={sendDataToAPI}
                      disabled={
                        loading ||
                        batchLoading ||
                        batchResults.length !== vehicleSchedules.length
                      }
                      className={`w-full px-4 py-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2
        ${
          batchResults.length === vehicleSchedules.length
            ? "bg-green-600 hover:bg-green-700"
            : "bg-gray-400"
        }
        text-white
      `}
                    >
                      {loading ? (
                        <svg
                          className="animate-spin h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8H4z"
                          />
                        </svg>
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      {loading ? "Enviando..." : "CARGAR DATOS AL DESPACHO"}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-2 text-red-800">
                      <AlertTriangle className="h-5 w-5" />
                      <span className="font-medium">Error:</span> {error}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <button className="px-4 py-2 rounded-md bg-red-600 text-gray-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2">
                Cerrar
              </button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
