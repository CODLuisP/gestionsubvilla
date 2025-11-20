'use client'
import React, { useState } from 'react'

interface Coordenada {
  latitud: string
  longitud: string
}

const Page = () => {
  const [puntoReferencia, setPuntoReferencia] = useState<Coordenada>({
    latitud: '',
    longitud: ''
  })
  
  const [puntoTest, setPuntoTest] = useState<Coordenada>({
    latitud: '',
    longitud: ''
  })
  
  const [resultado, setResultado] = useState<string>('')

  const determinarPosicion = () => {
    const lonRef = parseFloat(puntoReferencia.longitud)
    const lonTest = parseFloat(puntoTest.longitud)
    
    if (isNaN(lonRef) || isNaN(lonTest)) {
      setResultado('⚠️ Por favor ingresa valores válidos en ambos puntos')
      return
    }
    
    if (lonTest > lonRef) {
      setResultado('🔵 El punto está a la DERECHA (más al Este)')
    } else if (lonTest < lonRef) {
      setResultado('🔴 El punto está a la IZQUIERDA (más al Oeste)')
    } else {
      setResultado('⚪ Los puntos están en la MISMA LONGITUD (verticalmente alineados)')
    }
  }

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', fontFamily: 'Arial' }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>
        Determinar Posición de Puntos
      </h1>
      
      <div style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h2 style={{ color: '#555', marginBottom: '15px' }}>📍 Punto de Referencia (Blanco)</h2>
        
        <label style={{ display: 'block', marginBottom: '10px' }}>
          <strong>Latitud:</strong>
          <input
            type="text"
            value={puntoReferencia.latitud}
            onChange={(e) => setPuntoReferencia({
              ...puntoReferencia,
              latitud: e.target.value
            })}
            placeholder="-7.165439"
            style={{
              marginLeft: '10px',
              padding: '8px',
              width: '200px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          />
        </label>
        
        <label style={{ display: 'block' }}>
          <strong>Longitud:</strong>
          <input
            type="text"
            value={puntoReferencia.longitud}
            onChange={(e) => setPuntoReferencia({
              ...puntoReferencia,
              longitud: e.target.value
            })}
            placeholder="-78.496107"
            style={{
              marginLeft: '10px',
              padding: '8px',
              width: '200px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          />
        </label>
      </div>

      <div style={{ 
        backgroundColor: '#fff3cd', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h2 style={{ color: '#856404', marginBottom: '15px' }}>📍 Punto a Evaluar (Amarillo)</h2>
        
        <label style={{ display: 'block', marginBottom: '10px' }}>
          <strong>Latitud:</strong>
          <input
            type="text"
            value={puntoTest.latitud}
            onChange={(e) => setPuntoTest({
              ...puntoTest,
              latitud: e.target.value
            })}
            placeholder="-7.156"
            style={{
              marginLeft: '10px',
              padding: '8px',
              width: '200px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          />
        </label>
        
        <label style={{ display: 'block' }}>
          <strong>Longitud:</strong>
          <input
            type="text"
            value={puntoTest.longitud}
            onChange={(e) => setPuntoTest({
              ...puntoTest,
              longitud: e.target.value
            })}
            placeholder="-78.528"
            style={{
              marginLeft: '10px',
              padding: '8px',
              width: '200px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          />
        </label>
      </div>

      <button
        onClick={determinarPosicion}
        style={{
          width: '100%',
          padding: '15px',
          fontSize: '18px',
          fontWeight: 'bold',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        Determinar Posición
      </button>

      {resultado && (
        <div style={{
          padding: '20px',
          backgroundColor: resultado.includes('DERECHA') ? '#d4edda' : 
                          resultado.includes('IZQUIERDA') ? '#f8d7da' : '#fff3cd',
          borderRadius: '8px',
          fontSize: '18px',
          fontWeight: 'bold',
          textAlign: 'center',
          color: resultado.includes('DERECHA') ? '#155724' : 
                 resultado.includes('IZQUIERDA') ? '#721c24' : '#856404'
        }}>
          {resultado}
        </div>
      )}

      <div style={{
        marginTop: '30px',
        padding: '15px',
        backgroundColor: '#e7f3ff',
        borderRadius: '8px',
        fontSize: '14px'
      }}>
        <h3>ℹ️ Ejemplos de coordenadas:</h3>
        <ul>
          <li><strong>Cajamarca:</strong> Lat: -7.156, Lon: -78.528</li>
          <li><strong>Lima:</strong> Lat: -12.046, Lon: -77.043</li>
          <li><strong>Trujillo:</strong> Lat: -8.112, Lon: -79.029</li>
        </ul>
        <p style={{ marginTop: '10px', fontStyle: 'italic' }}>
          💡 Recuerda: Las longitudes en Perú son negativas (Oeste)
        </p>
      </div>
    </div>
  )
}

export default Page