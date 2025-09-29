"use client"
import useFingerprint from "@/hooks/useFingerprint";
import React from "react";

function App() {
  const fingerprint = useFingerprint();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-2xl font-bold text-green-600">FingerprintJS Demo</h1>

      {fingerprint ? (
        <p className="mt-4 text-gray-700">
          Tu fingerprint es: <span className="font-mono">{fingerprint}</span>
        </p>
      ) : (
        <p className="mt-4 text-gray-500">Generando fingerprint…</p>
      )}
    </div>
  );
}

export default App;
