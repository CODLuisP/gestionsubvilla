'use client'
import { useState, useEffect, useMemo } from 'react';
import { AlertTriangle, MapPin, TrendingUp, Download, RefreshCw } from 'lucide-react';
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner"

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
  type: 'entry' | 'exit' | 'pass_through' | 'near_zone';
  fromPoint: GPSPoint;
  toPoint: GPSPoint;
  distanceFrom: number;
  distanceTo: number;
  minDistanceToCenter?: number;
  geofence: Geofence;
  confidence: 'high' | 'medium' | 'low';
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


interface APIDataItem {
  codasig: string;
  deviceID: string;
  nom_control: string;
  hora_inicio: string;
  hora_estimada: string;
  hora_llegada: string;
  volado: string;
}

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
    codigo: number;      
  fechaini: string;     
  status: 'detected' | 'not_detected' | 'error';
  detections: Detection[];
  error?: string;
  gpsPointsCount: number;
}

interface GeofenceGroupedResults {
  geofence: Geofence;
  vehicleDetections: {
    vehicleId: string;
    detection?: Detection;
    status: 'detected' | 'not_detected' | 'error';
  }[];
}

interface APIVehicleData {
  codigo: number;
  deviceID: string;
  fechaini: string;
  fechafin: string;
}


const GeofenceAnalyzer: React.FC = () => {


const getDynamicMinutesForRoute5 = (
  hours: number,
  minutes: number,
  seconds: number = 0,
): number[] => {
  // Convertir la hora a formato de segundos totales para comparación más precisa
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;

  // Definir los rangos de tiempo y sus respectivos minutos para ruta 5 final (en segundos)
  const timeRanges = [
    {
      start: 6 * 3600 + 0 * 60 + 0,
      end: 6 * 3600 + 7 * 60 + 59,
      minutes: [9, 36, 52, 68, 85, 115, 123],
    }, // 6:00:00 - 6:07:59
    {
      start: 6 * 3600 + 8 * 60 + 0,
      end: 6 * 3600 + 14 * 60 + 59,
      minutes: [10, 36, 53, 69, 87, 117, 125],
    }, // 6:08:00 - 6:14:59
    {
      start: 6 * 3600 + 15 * 60 + 0,
      end: 6 * 3600 + 21 * 60 + 59,
      minutes: [10, 37, 54, 70, 88, 118, 128],
    }, // 6:15:00 - 6:21:59
    {
      start: 6 * 3600 + 22 * 60 + 0,
      end: 6 * 3600 + 28 * 60 + 59,
      minutes: [10, 39, 56, 72, 90, 120, 130],
    }, // 6:22:00 - 6:28:59
    {
      start: 6 * 3600 + 29 * 60 + 0,
      end: 6 * 3600 + 35 * 60 + 59,
      minutes: [10, 41, 58, 74, 92, 122, 132],
    }, // 6:29:00 - 6:35:59
    {
      start: 6 * 3600 + 36 * 60 + 0,
      end: 6 * 3600 + 42 * 60 + 59,
      minutes: [11, 44, 60, 76, 93, 123, 133],
    }, // 6:36:00 - 6:42:59
    {
      start: 6 * 3600 + 43 * 60 + 0,
      end: 6 * 3600 + 43 * 60 + 59,
      minutes: [12, 45, 64, 85, 105, 137, 147],
    }, // 6:43:00 - 6:43:59
  ];

  // Buscar el rango de tiempo que corresponde
  for (const range of timeRanges) {
    if (totalSeconds >= range.start && totalSeconds <= range.end) {
      return range.minutes;
    }
  }

  // Si no está en ningún rango específico (después de 6:43:59 o antes de 6:00:00), usar los minutos constantes
  // Los últimos minutos de la tabla (6:43): [12, 45, 64, 85, 105, 137, 147]
  return [12, 45, 64, 85, 105, 137, 147];
};

// Función para obtener los minutos dinámicos de la ruta 6
const getDynamicMinutesForRoute6 = (
  hours: number,
  minutes: number,
  seconds: number = 0,
): number[] => {
  // Convertir la hora a formato de segundos totales para comparación más precisa
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;

  // Definir los rangos de tiempo y sus respectivos minutos (en segundos)
  const timeRanges = [
    {
      start: 4 * 3600 + 55 * 60 + 0,
      end: 5 * 3600 + 1 * 60 + 59,
      minutes: [4, 13, 32, 46, 56, 76, 96],
    }, // 4:55:00 - 5:01:59
    {
      start: 5 * 3600 + 2 * 60 + 0,
      end: 5 * 3600 + 8 * 60 + 59,
      minutes: [4, 13, 32, 46, 57, 77, 97],
    }, // 5:02:00 - 5:08:59
    {
      start: 5 * 3600 + 9 * 60 + 0,
      end: 5 * 3600 + 14 * 60 + 59,
      minutes: [4, 13, 33, 47, 57, 77, 97],
    }, // 5:09:00 - 5:14:59
    {
      start: 5 * 3600 + 15 * 60 + 0,
      end: 5 * 3600 + 19 * 60 + 59,
      minutes: [4, 13, 34, 48, 58, 78, 98],
    }, // 5:15:00 - 5:19:59
    {
      start: 5 * 3600 + 20 * 60 + 0,
      end: 5 * 3600 + 24 * 60 + 59,
      minutes: [4, 13, 34, 49, 60, 80, 100],
    }, // 5:20:00 - 5:24:59
    {
      start: 5 * 3600 + 25 * 60 + 0,
      end: 5 * 3600 + 29 * 60 + 59,
      minutes: [4, 13, 35, 50, 62, 82, 102],
    }, // 5:25:00 - 5:29:59
    {
      start: 5 * 3600 + 30 * 60 + 0,
      end: 5 * 3600 + 34 * 60 + 59,
      minutes: [4, 13, 35, 51, 62, 82, 102],
    }, // 5:30:00 - 5:34:59
    {
      start: 5 * 3600 + 35 * 60 + 0,
      end: 5 * 3600 + 39 * 60 + 59,
      minutes: [4, 13, 35, 51, 62, 83, 103],
    }, // 5:35:00 - 5:39:59
    {
      start: 5 * 3600 + 40 * 60 + 0,
      end: 5 * 3600 + 44 * 60 + 59,
      minutes: [4, 13, 36, 52, 62, 83, 103],
    }, // 5:40:00 - 5:44:59
    {
      start: 5 * 3600 + 45 * 60 + 0,
      end: 5 * 3600 + 49 * 60 + 59,
      minutes: [4, 13, 38, 53, 63, 84, 104],
    }, // 5:45:00 - 5:49:59
    {
      start: 5 * 3600 + 50 * 60 + 0,
      end: 5 * 3600 + 54 * 60 + 59,
      minutes: [5, 14, 38, 54, 64, 85, 105],
    }, // 5:50:00 - 5:54:59
    {
      start: 5 * 3600 + 55 * 60 + 0,
      end: 5 * 3600 + 59 * 60 + 59,
      minutes: [5, 15, 39, 55, 65, 87, 107],
    }, // 5:55:00 - 5:59:59
    {
      start: 6 * 3600 + 0 * 60 + 0,
      end: 6 * 3600 + 4 * 60 + 59,
      minutes: [5, 15, 40, 56, 66, 88, 108],
    }, // 6:00:00 - 6:04:59
    {
      start: 6 * 3600 + 5 * 60 + 0,
      end: 6 * 3600 + 9 * 60 + 59,
      minutes: [5, 15, 41, 58, 68, 90, 110],
    }, // 6:05:00 - 6:09:59
    {
      start: 6 * 3600 + 10 * 60 + 0,
      end: 6 * 3600 + 14 * 60 + 59,
      minutes: [5, 15, 41, 59, 69, 92, 112],
    }, // 6:10:00 - 6:14:59
    {
      start: 6 * 3600 + 15 * 60 + 0,
      end: 6 * 3600 + 19 * 60 + 59,
      minutes: [5, 15, 42, 60, 70, 94, 114],
    }, // 6:15:00 - 6:19:59
    {
      start: 6 * 3600 + 20 * 60 + 0,
      end: 6 * 3600 + 24 * 60 + 59,
      minutes: [5, 15, 43, 61, 71, 96, 116],
    }, // 6:20:00 - 6:24:59
    {
      start: 6 * 3600 + 25 * 60 + 0,
      end: 6 * 3600 + 29 * 60 + 59,
      minutes: [5, 15, 44, 63, 73, 98, 118],
    }, // 6:25:00 - 6:29:59
    {
      start: 6 * 3600 + 30 * 60 + 0,
      end: 6 * 3600 + 34 * 60 + 59,
      minutes: [5, 15, 45, 64, 74, 100, 120],
    }, // 6:30:00 - 6:34:59
    {
      start: 6 * 3600 + 35 * 60 + 0,
      end: 6 * 3600 + 39 * 60 + 59,
      minutes: [5, 15, 46, 66, 76, 102, 122],
    }, // 6:35:00 - 6:39:59
    {
      start: 6 * 3600 + 40 * 60 + 0,
      end: 6 * 3600 + 44 * 60 + 59,
      minutes: [5, 15, 47, 67, 78, 105, 125],
    }, // 6:40:00 - 6:44:59
    {
      start: 6 * 3600 + 45 * 60 + 0,
      end: 6 * 3600 + 49 * 60 + 59,
      minutes: [5, 15, 48, 68, 80, 107, 127],
    }, // 6:45:00 - 6:49:59
    {
      start: 6 * 3600 + 50 * 60 + 0,
      end: 6 * 3600 + 54 * 60 + 59,
      minutes: [5, 15, 48, 68, 82, 110, 130],
    }, // 6:50:00 - 6:54:59
    {
      start: 6 * 3600 + 55 * 60 + 0,
      end: 6 * 3600 + 59 * 60 + 59,
      minutes: [5, 15, 48, 68, 84, 112, 132],
    }, // 6:55:00 - 6:59:59
    {
      start: 7 * 3600 + 0 * 60 + 0,
      end: 7 * 3600 + 4 * 60 + 59,
      minutes: [5, 15, 48, 68, 85, 115, 135],
    }, // 7:00:00 - 7:04:59
    {
      start: 7 * 3600 + 5 * 60 + 0,
      end: 7 * 3600 + 9 * 60 + 59,
      minutes: [5, 15, 48, 68, 86, 116, 136],
    }, // 7:05:00 - 7:09:59
    {
      start: 7 * 3600 + 10 * 60 + 0,
      end: 7 * 3600 + 14 * 60 + 59,
      minutes: [5, 15, 48, 68, 87, 117, 137],
    }, // 7:10:00 - 7:14:59
    {
      start: 7 * 3600 + 15 * 60 + 0,
      end: 7 * 3600 + 19 * 60 + 59,
      minutes: [5, 15, 48, 68, 88, 118, 138],
    }, // 7:15:00 - 7:19:59
    {
      start: 7 * 3600 + 20 * 60 + 0,
      end: 7 * 3600 + 24 * 60 + 59,
      minutes: [5, 15, 48, 68, 88, 118, 138],
    }, // 7:20:00 - 7:24:59
    {
      start: 7 * 3600 + 25 * 60 + 0,
      end: 7 * 3600 + 25 * 60 + 59,
      minutes: [5, 15, 48, 72, 92, 122, 142],
    }, // 7:25:00 - 7:25:59
  ];

  for (const range of timeRanges) {
    if (totalSeconds >= range.start && totalSeconds <= range.end) {
      return range.minutes;
    }
  }

  // Si no está en ningún rango específico (después de 7:25:59), usar los minutos constantes
  // Los últimos minutos de la tabla (7:25): [5, 15, 48, 72, 92, 122, 142]
  return [5, 15, 48, 72, 92, 122, 142];
};


const calculateTimeDifference = (startTime: string, endTime: string): string => {
  const timeToSeconds = (time: string): number => {
    const parts = time.split(':').map(Number);
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
    result = `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    result = `${minutes}m ${seconds}s`;
  } else {
    result = `${seconds}s`;
  }

  const prefix = isNegative ? "-" : "+";
  return `${prefix}${result}`;
};

const calculateEndTime = (startTime: string, minutesToAdd: number): string => {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + minutesToAdd;
  const endHours = Math.floor(totalMinutes / 60);
  const endMinutes = totalMinutes % 60;
  return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
};




  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [batchLoading, setBatchLoading] = useState<boolean>(false);
  const [batchResults, setBatchResults] = useState<BatchAnalysisResult[]>([]);
  const [groupedResults, setGroupedResults] = useState<GeofenceGroupedResults[]>([]);

// NUEVO: Estados para manejar la API de horarios
  const [vehicleSchedules, setVehicleSchedules] = useState<VehicleSchedule[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState<boolean>(false);
  const [selectedDate] = useState<string>('2025-07-16');
  const [selectedRoute] = useState<string>('6');

  
  
  // 7 GEOCERCAS FIJAS

  const getGeofencesByRoute = (route: string): Geofence[] => {
  if (route === '5') {
    // Geocercas para ruta 5 (las originales)
    return [
      {
        id: 1,
        name: "VENEZUELA",
        centerLat: -12.063352,
        centerLon: -77.105005,
        radius: 10,
        active: true
      },
      {
        id: 2,
        name: "GARZON",
        centerLat: -12.069217,
        centerLon: -77.047214,
        radius: 10,
        active: true
      },
      {
        id: 3,
        name: "OBRERO",
        centerLat: -12.063990,
        centerLon: -77.024997,
        radius: 10,
        active: true
      },
      {
        id: 4,
        name: "AV SAN JUAN",
        centerLat: -12.075216,
        centerLon: -77.001256,
        radius: 10,
        active: true
      },
      {
        id: 5,
        name: "MADRID",
        centerLat: -12.107674,
        centerLon: -76.992534,
        radius: 10,
        active: true
      },
      {
        id: 6,
        name: "CT",
        centerLat: -12.164936,
        centerLon: -76.972806,
        radius: 10,
        active: true
      },
      {
        id: 7,
        name: "GRIFO MILAGRO",
        centerLat: -12.172350,
        centerLon: -76.965037,
        radius: 10,
        active: true
      }
    ];
  } else if (route === '6') {
    // Geocercas para ruta 6 (las nuevas)
    return [
      {
        id: 1,
        name: "PACIFICO",
        centerLat: -12.175959,
        centerLon: -76.957626,
        radius: 10,
        active: true
      },
      {
        id: 2,
        name: "CT",
        centerLat: -12.165202,
        centerLon: -76.972420,
        radius: 10,
        active: true
      },
      {
        id: 3,
        name: "MADRID",
        centerLat: -12.108237,
        centerLon: -76.992485,
        radius: 10,
        active: true
      },
      {
        id: 4,
        name: "ARRIOLA",
        centerLat: -12.077288,
        centerLon: -77.009712,
        radius: 10,
        active: true
      },
      {
        id: 5,
        name: "TRANSITO",
        centerLat: -12.061889,
        centerLon: -77.019737,
        radius: 10,
        active: true
      },
      {
        id: 6,
        name: "BOLIVAR",
        centerLat: -12.071988,
        centerLon: -77.063782,
        radius: 10,
        active: true
      },
      {
        id: 7,
        name: "INSURGENTES",
        centerLat: -12.063117,
        centerLon: -77.104271,
        radius: 10,
        active: true
      }
    ];
  } else {
    // Por defecto, usar las geocercas de ruta 5
    return getGeofencesByRoute('5');
  }
};

const geofences: Geofence[] = useMemo(() => getGeofencesByRoute(selectedRoute), [selectedRoute]);


useEffect(() => {
  setBatchResults([]);
  setGroupedResults([]);
}, [selectedRoute]);

  const loadVehicleSchedules = async (): Promise<void> => {
    setLoadingSchedules(true);
    setError(null);
    
    try {
      const url = `https://villa.velsat.pe:8443/api/Datero/GPSUniDesp?fecha=${selectedDate}&ruta=${selectedRoute}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}: No se pudieron cargar los horarios`);
      }

      const apiData: APIVehicleData[] = await response.json();
      
      if (!apiData || apiData.length === 0) {
        throw new Error('No se encontraron vehículos para la fecha y ruta seleccionadas');
      }

      // Convertir los datos de la API al formato VehicleSchedule
      const schedules: VehicleSchedule[] = apiData.map(item => ({
        vehicleId: item.deviceID,
          codigo: item.codigo, 
        startTime: item.fechaini,
        endTime: item.fechafin
      }));



      setVehicleSchedules(schedules);
      
      // Limpiar resultados anteriores
      setBatchResults([]);
      setGroupedResults([]);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los horarios de vehículos');
      setVehicleSchedules([]);
    } finally {
      setLoadingSchedules(false);
    }
  };

  // Cargar horarios al montar el componente
  useEffect(() => {
    loadVehicleSchedules();
  }, []);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000; // Radio de la Tierra en metros
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  const distanceFromPointToLine = (
    px: number, 
    py: number, 
    x1: number, 
    y1: number, 
    x2: number, 
    y2: number
  ): number => {
    const centerLat = (y1 + y2) / 2;
    const metersPerDegreeLat = 111000;
    const metersPerDegreeLon = 111000 * Math.cos(centerLat * Math.PI / 180);
    
    const pxMeters = px * metersPerDegreeLon;
    const pyMeters = py * metersPerDegreeLat;
    const x1Meters = x1 * metersPerDegreeLon;
    const y1Meters = y1 * metersPerDegreeLat;
    const x2Meters = x2 * metersPerDegreeLon;
    const y2Meters = y2 * metersPerDegreeLat;
    
    const A = pxMeters - x1Meters;
    const B = pyMeters - y1Meters;
    const C = x2Meters - x1Meters;
    const D = y2Meters - y1Meters;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    
    if (lenSq === 0) return Math.sqrt(A * A + B * B);
    
    let param = dot / lenSq;
    param = Math.max(0, Math.min(1, param));
    
    const xx = x1Meters + param * C;
    const yy = y1Meters + param * D;

    const dx = pxMeters - xx;
    const dy = pyMeters - yy;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const analyzeTrajectoryIntersection = (gpsPoints: GPSPoint[], geofence: Geofence, vehicleId: string): Detection[] => {
    const detections: Detection[] = [];
    
    for (let i = 0; i < gpsPoints.length - 1; i++) {
      const p1 = gpsPoints[i];
      const p2 = gpsPoints[i + 1];
      
      if (!p1 || !p2) continue;
      
      const d1 = calculateDistance(geofence.centerLat, geofence.centerLon, p1.latitude, p1.longitude);
      const d2 = calculateDistance(geofence.centerLat, geofence.centerLon, p2.latitude, p2.longitude);
      
      if ((d1 <= geofence.radius && d2 > geofence.radius) || (d1 > geofence.radius && d2 <= geofence.radius)) {
        detections.push({
          type: d1 <= geofence.radius ? 'exit' : 'entry',
          fromPoint: p1,
          toPoint: p2,
          distanceFrom: Math.round(d1),
          distanceTo: Math.round(d2),
          geofence: geofence,
          confidence: 'high',
          timestamp: p2.fecha + ' ' + p2.hora,
          vehicleId: vehicleId
        });
      }
      else if (d1 > geofence.radius && d2 > geofence.radius) {
        const minDistance = distanceFromPointToLine(
          geofence.centerLon, geofence.centerLat,
          p1.longitude, p1.latitude,
          p2.longitude, p2.latitude
        );
        
        if (minDistance <= geofence.radius) {
          detections.push({
            type: 'pass_through',
            fromPoint: p1,
            toPoint: p2,
            distanceFrom: Math.round(d1),
            distanceTo: Math.round(d2),
            minDistanceToCenter: Math.round(minDistance),
            geofence: geofence,
            confidence: 'medium',
            timestamp: p2.fecha + ' ' + p2.hora,
            vehicleId: vehicleId
          });
        }
      }
      else if (d1 <= geofence.radius * 1.2 || d2 <= geofence.radius * 1.2) {
        if (d1 <= geofence.radius || d2 <= geofence.radius) {
          detections.push({
            type: 'near_zone',
            fromPoint: p1,
            toPoint: p2,
            distanceFrom: Math.round(d1),
            distanceTo: Math.round(d2),
            geofence: geofence,
            confidence: 'high',
            timestamp: p2.fecha + ' ' + p2.hora,
            vehicleId: vehicleId
          });
        }
      }
    }
    
    return detections;
  };

  const getBestDetection = (detections: Detection[]): Detection | undefined => {
    if (detections.length === 0) return undefined;
    if (detections.length === 1) return detections[0];
    
    let bestDetection = detections[0];
    let minAvgDistance = (detections[0].distanceFrom + detections[0].distanceTo) / 2;
    
    detections.forEach(detection => {
      const avgDistance = (detection.distanceFrom + detection.distanceTo) / 2;
      
      if (avgDistance < minAvgDistance) {
        minAvgDistance = avgDistance;
        bestDetection = detection;
      }
      else if (avgDistance === minAvgDistance) {
        const typeScore = (type: Detection['type']): number => {
          const scores = { 'entry': 4, 'near_zone': 3, 'pass_through': 2, 'exit': 1 };
          return scores[type] || 0;
        };
        
        if (typeScore(detection.type) > typeScore(bestDetection.type)) {
          bestDetection = detection;
        }
      }
    });
    
    return bestDetection;
  };

  // FUNCIÓN PARA ANALIZAR CON RADIO INTELIGENTE ADAPTATIVO
  const analyzeWithAdaptiveRadius = (gpsPoints: GPSPoint[], geofence: Geofence, vehicleId: string): { detection: Detection | undefined, usedRadius: number } => {
    const radiusSteps = [10,20,30,40,50,100,200,500]; // Incrementos de 10m hasta máximo 500m
    
    for (const radius of radiusSteps) {
      const adaptedGeofence = { ...geofence, radius };
      const detections = analyzeTrajectoryIntersection(gpsPoints, adaptedGeofence, vehicleId);
      const bestDetection = getBestDetection(detections);
      
      if (bestDetection) {
        // Marcar que se usó un radio adaptado
        const adaptedDetection = {
          ...bestDetection,
          geofence: adaptedGeofence,
          adaptiveRadius: radius
        };
        return { detection: adaptedDetection, usedRadius: radius };
      }
    }
    
    return { detection: undefined, usedRadius: 10 };
  };
const analyzeVehicle = async (vehicle: VehicleSchedule): Promise<BatchAnalysisResult> => {
  try {
    const startDate = `2025-07-18T${vehicle.startTime}`;
    const endDate = `2025-07-18T${vehicle.endTime}`;
    const url = `https://villa.velsat.pe:8443/api/Reporting/general/${startDate}/${endDate}/${vehicle.vehicleId}/etudvrb`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      return {
        vehicleId: vehicle.vehicleId,
        codigo: vehicle.codigo,           
        fechaini: vehicle.startTime,      
        status: 'error',
        error: `HTTP ${response.status}`,
        gpsPointsCount: 0,
        detections: []
      };
    }

    const data: APIResponse = await response.json();
    
    if (!data || !data.listaTablas || data.listaTablas.length === 0) {
      return {
        vehicleId: vehicle.vehicleId,
        codigo: vehicle.codigo,           
        fechaini: vehicle.startTime,      
        status: 'not_detected',
        gpsPointsCount: 0,
        detections: []
      };
    }

    // Analizar todas las geocercas para este vehículo CON RADIO ADAPTATIVO
    const allDetections: Detection[] = [];
    geofences.forEach(geofence => {
      const { detection } = analyzeWithAdaptiveRadius(data.listaTablas, geofence, vehicle.vehicleId);
      if (detection) {
        allDetections.push(detection);
      }
    });

    // NUEVO: Calcular horas fin para cada detección
    if (allDetections.length > 0) {
      // Parsear la hora de inicio
      const [startHours, startMinutes] = vehicle.startTime.split(':').map(Number);
      
      // Obtener los minutos dinámicos según la ruta
      const dynamicMinutes = selectedRoute === '5' 
        ? getDynamicMinutesForRoute5(startHours, startMinutes)
        : getDynamicMinutesForRoute6(startHours, startMinutes);
      
      // Asignar hora fin a cada detección basado en el orden de las geocercas
      allDetections.forEach((detection) => {
        // Encontrar el índice de la geocerca en el array de geocercas
        const geofenceIndex = geofences.findIndex(g => g.id === detection.geofence.id);
        
        if (geofenceIndex !== -1 && geofenceIndex < dynamicMinutes.length) {
          detection.endTime = calculateEndTime(vehicle.startTime, dynamicMinutes[geofenceIndex]);
        }
      });
    }

    return {
      vehicleId: vehicle.vehicleId,
      codigo: vehicle.codigo,           
      fechaini: vehicle.startTime,      
      status: allDetections.length > 0 ? 'detected' : 'not_detected',
      detections: allDetections,
      gpsPointsCount: data.listaTablas.length
    };

  } catch (err) {
    return {
      vehicleId: vehicle.vehicleId,
      codigo: vehicle.codigo,           
      fechaini: vehicle.startTime,      
      status: 'error',
      error: err instanceof Error ? err.message : 'Error desconocido',
      gpsPointsCount: 0,
      detections: []
    };
  }
};

const analyzeBatchVehicles = async (): Promise<void> => {
  // Verificar que los datos estén cargados
  if (vehicleSchedules.length === 0) {
    setError('No hay vehículos cargados. Cargando datos...');
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
      
      const batchPromises = batch.map(vehicle => analyzeVehicle(vehicle));
      const batchResults = await Promise.all(batchPromises);
      
      results.push(...batchResults);
      setBatchResults([...results]);
      
      if (i + 3 < vehicleSchedules.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Agrupar resultados por geocerca
    groupResultsByGeofence(results);

  } catch (err) {
    setError(err instanceof Error ? err.message : 'Error en análisis masivo');
  } finally {
    setBatchLoading(false);
  }
};

  
  const groupResultsByGeofence = (results: BatchAnalysisResult[]): void => {
    const grouped: GeofenceGroupedResults[] = geofences.map(geofence => ({
      geofence,
      vehicleDetections: vehicleSchedules.map(vehicle => {
        const vehicleResult = results.find(r => r.vehicleId === vehicle.vehicleId);
        const detection = vehicleResult?.detections.find(d => d.geofence.id === geofence.id);
        
        return {
          vehicleId: vehicle.vehicleId,
          detection,
          status: detection ? 'detected' : (vehicleResult?.status === 'error' ? 'error' : 'not_detected')
        };
      })
    }));

    setGroupedResults(grouped);
  };

  const exportGroupedResults = (): void => {
    const summary = {
      timestamp: new Date().toISOString(),
      totalVehicles: vehicleSchedules.length,
      totalGeofences: geofences.length,
      analyzed: batchResults.length,
      groupedResults: groupedResults
    };
    
    const blob = new Blob([JSON.stringify(summary, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `geocercas-agrupadas-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };


// NUEVA FUNCIÓN: Enviar datos a la API

const sendDataToAPI = async (): Promise<void> => {
  if (batchResults.length === 0) {
    setError('No hay datos para enviar. Realiza primero el análisis.');
    toast.error("No hay datos para enviar. Realiza primero el análisis.");
    return;
  }

  setLoading(true);
  setError(null);

  try {
const apiData: APIDataItem[] = [];
    const vehiclesWithDetections = batchResults.filter(r => r.detections.length > 0);

    vehiclesWithDetections.forEach(result => {
      result.detections.forEach(detection => {
        apiData.push({
          codasig: result.codigo.toString(),
          deviceID: result.vehicleId,
          nom_control: detection.geofence.name,
          hora_inicio: result.fechaini,
          hora_estimada: detection.endTime || '',
          hora_llegada: detection.timestamp.split(' ')[1],
          volado: calculateTimeDifference(detection.endTime || '', detection.timestamp.split(' ')[1])
        });
      });
    });

    const response = await fetch('https://villa.velsat.pe:8443/api/Datero/EnvioGPS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiData)
    });

    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
    }

    const responseData = await response.json();

    toast.success(`Datos enviados exitosamente. ${apiData.length} registros enviados.`);
    console.log('Respuesta de la API:', responseData);

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido al enviar datos';
    setError(`Error al enviar datos a la API: ${errorMessage}`);
    console.error('Error enviando datos:', err);
    toast.error(`❌ Error al enviar datos: ${errorMessage}`);
  } finally {
    setLoading(false);
  }
};



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <MapPin className="text-blue-600" />
            Sistema de 7 Geocercas Fijas - TransporVilla
          </h1>
          <p className="text-gray-600">Análisis de 27 vehículos en 7 geocercas fijas de 50m de radio</p>
        </div>

        {/* Panel de Geocercas Fijas */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <MapPin className="text-green-600" />
            Geocercas Configuradas (7 Fijas)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {geofences.map(geofence => (
              <div key={geofence.id} className="border border-gray-200 rounded-lg p-4 bg-green-50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-800">{geofence.name}</h3>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    {geofence.radius}m
                  </span>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>📍 Lat: {geofence.centerLat.toFixed(6)}</div>
                  <div>📍 Lon: {geofence.centerLon.toFixed(6)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Análisis Masivo */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              🚛 Análisis Masivo de 27 Vehículos
            </h2>
            <div className="flex gap-3">
          <button
  onClick={analyzeBatchVehicles}
  disabled={batchLoading || loadingSchedules || vehicleSchedules.length === 0}
  className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2"
>
  {batchLoading ? (
    <RefreshCw className="animate-spin h-5 w-5" />
  ) : loadingSchedules ? (
    <RefreshCw className="animate-spin h-5 w-5" />
  ) : (
    <TrendingUp className="h-5 w-5" />
  )}
  {batchLoading 
    ? 'Analizando...' 
    : loadingSchedules 
    ? 'Cargando vehículos...' 
    : vehicleSchedules.length === 0 
    ? 'Sin vehículos' 
    : `Analizar ${vehicleSchedules.length} Vehículos`
  }
</button>
            </div>
          </div>

          {batchLoading && (
            <div className="mb-4 bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-800">
                  Progreso del análisis masivo
                </span>
                <span className="text-sm text-blue-600">
                  {batchResults.length} / {vehicleSchedules.length}
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(batchResults.length / vehicleSchedules.length) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {batchResults.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {batchResults.filter(r => r.status === 'detected').length}
                </div>
                <div className="text-sm text-green-700">Con Detecciones</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {batchResults.filter(r => r.status === 'not_detected').length}
                </div>
                <div className="text-sm text-gray-700">Sin Detecciones</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {batchResults.filter(r => r.status === 'error').length}
                </div>
                <div className="text-sm text-red-700">Errores</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {batchResults.reduce((sum, r) => sum + r.detections.length, 0)}
                </div>
                <div className="text-sm text-blue-700">Total Detecciones</div>
              </div>
            </div>
          )}

          {groupedResults.length > 0 && (
            <div className="flex justify-end">
              <button
                onClick={exportGroupedResults}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Exportar Resultados Agrupados
              </button>

           <>
  <button
    onClick={sendDataToAPI}
    disabled={loading}
    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
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
    {loading ? "Enviando..." : "SEND API"}
  </button>

  <Toaster />
</>

            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Error:</span> {error}
            </div>
          </div>
        )}

    

        {/* Resumen General */}
        {batchResults.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              📊 Resumen General del Análisis
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {/* Estadísticas generales */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-medium text-blue-800 mb-3">📈 Estadísticas Generales</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Vehículos:</span>
                    <span className="font-medium">{vehicleSchedules.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Analizados:</span>
                    <span className="font-medium">{batchResults.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Con Detecciones:</span>
                    <span className="font-medium text-green-600">
                      {batchResults.filter(r => r.status === 'detected').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sin Detecciones:</span>
                    <span className="font-medium text-gray-600">
                      {batchResults.filter(r => r.status === 'not_detected').length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Top geocercas con más detecciones */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-medium text-green-800 mb-3">🏆 Top Geocercas</h3>
                <div className="space-y-2 text-sm">
                  {groupedResults
                    .sort((a, b) => 
                      b.vehicleDetections.filter(v => v.status === 'detected').length - 
                      a.vehicleDetections.filter(v => v.status === 'detected').length
                    )
                    .slice(0, 4)
                    .map((group, index) => (
                      <div key={index} className="flex justify-between">
                        <span>{group.geofence.name}:</span>
                        <span className="font-medium text-green-600">
                          {group.vehicleDetections.filter(v => v.status === 'detected').length}
                        </span>
                      </div>
                    ))
                  }
                </div>
              </div>

              {/* Horarios de mayor actividad */}
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="font-medium text-purple-800 mb-3">⏰ Análisis Temporal</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Inicio más temprano:</span>
                    <span className="font-medium">04:55</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Inicio más tardío:</span>
                    <span className="font-medium">09:50</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ventana de análisis:</span>
                    <span className="font-medium">4h 55m</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total detecciones:</span>
                    <span className="font-medium text-purple-600">
                      {batchResults.reduce((sum, r) => sum + r.detections.length, 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Estadísticas de radio adaptativo */}
              <div className="bg-indigo-50 rounded-lg p-4">
                <h3 className="font-medium text-indigo-800 mb-3">🔍 Sistema Adaptativo</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Radio 10m (óptimo):</span>
                    <span className="font-medium text-green-600">
                      {batchResults.reduce((sum, r) => 
                        sum + r.detections.filter(d => (d.adaptiveRadius || 10) === 10).length, 0
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Radio 20m:</span>
                    <span className="font-medium text-yellow-600">
                      {batchResults.reduce((sum, r) => 
                        sum + r.detections.filter(d => d.adaptiveRadius === 20).length, 0
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Radio 30m+:</span>
                    <span className="font-medium text-orange-600">
                      {batchResults.reduce((sum, r) => 
                        sum + r.detections.filter(d => d.adaptiveRadius && d.adaptiveRadius >= 30).length, 0
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Precisión óptima:</span>
                    <span className="font-medium text-indigo-600">
                      {batchResults.reduce((sum, r) => sum + r.detections.length, 0) > 0 ? 
                        Math.round((batchResults.reduce((sum, r) => 
                          sum + r.detections.filter(d => (d.adaptiveRadius || 10) === 10).length, 0
                        ) / batchResults.reduce((sum, r) => sum + r.detections.length, 0)) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Calidad de datos */}
              <div className="bg-orange-50 rounded-lg p-4">
                <h3 className="font-medium text-orange-800 mb-3">📊 Calidad de Datos</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total puntos GPS:</span>
                    <span className="font-medium">
                      {batchResults.reduce((sum, r) => sum + r.gpsPointsCount, 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Promedio por vehículo:</span>
                    <span className="font-medium">
                      {batchResults.length > 0 ? Math.round(batchResults.reduce((sum, r) => sum + r.gpsPointsCount, 0) / batchResults.length) : 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Errores de conexión:</span>
                    <span className="font-medium text-red-600">
                      {batchResults.filter(r => r.status === 'error').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tasa de éxito:</span>
                    <span className="font-medium text-green-600">
                      {batchResults.length > 0 ? Math.round((batchResults.filter(r => r.status !== 'error').length / batchResults.length) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de vehículos con detecciones múltiples */}
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-800 mb-3">🚛 Vehículos con Múltiples Detecciones</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {batchResults
                  .filter(r => r.detections.length > 1)
                  .sort((a, b) => b.detections.length - a.detections.length)
                  .map((result, index) => (
                    <div key={index} className="bg-white rounded p-3 border">
                      <div className="flex justify-between items-center mb-2">

                     <span className="font-medium">{result.vehicleId} ({result.codigo})</span>


                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {result.detections.length} geocercas
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        {result.detections.map((detection, dIndex) => (
                          <div key={dIndex} className="flex justify-between">
                            <span>{detection.geofence.name}:</span>
                            <span>{result.fechaini}</span>
                            <span>{detection.endTime}</span>
                            <span>{detection.timestamp.split(' ')[1]} ({detection.adaptiveRadius || 10}m)</span>
                            <span>{calculateTimeDifference(detection.endTime!, detection.timestamp.split(' ')[1])}</span>

                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                }
              </div>
              {batchResults.filter(r => r.detections.length > 1).length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">
                  No hay vehículos con detecciones en múltiples geocercas
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeofenceAnalyzer;