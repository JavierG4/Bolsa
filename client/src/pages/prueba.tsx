import React, { useState } from 'react';
import { apiFetch } from '../api';

const PruebaPage: React.FC = () => {
  // estados para mostrar resultado en pantalla
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  // funcion que llame a cualquier metodo de la API que requiera de autenticacion
  const test_token = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);
    setData(null);
    try {
      const res = await apiFetch('/users/690f312d839b0ce45659d5d9', {
        method: 'GET'
      });
      if (res.ok) {
        setMessage('Request successful');
        setData((res as any).data ?? null);
      } else {
        // mostrar mensaje del servidor si existe, o el status
        const errData = (res as any).data;
        const errMsg = errData?.error || errData?.message || `Request failed (status ${res.status})`;
        setError(errMsg);
      }
    }
    catch(err: any) {
      console.error('test_token error:', err);
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md text-center w-full max-w-xl">
        <h1 className="text-2xl font-bold mb-4">Página de prueba</h1>
        <p className="text-gray-600 mb-6">Has iniciado sesión correctamente. Esta página sirve solo para pruebas.</p>

        <div className="mb-4">
          <button
            onClick={test_token}
            disabled={loading}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? 'Running...' : 'Run test request'}
          </button>
        </div>

        {message && (
          <div className="mb-4 text-green-600">{message}</div>
        )}

        {error && (
          <div className="mb-4 text-red-600">Error: {error}</div>
        )}

        {data && (
          <pre className="text-left overflow-auto max-h-48 bg-gray-100 p-3 rounded">{JSON.stringify(data, null, 2)}</pre>
        )}
      </div>
    </div>
  );
};

export default PruebaPage;
