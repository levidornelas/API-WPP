'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [sessionName, setSessionName] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [sessionStatus, setSessionStatus] = useState('');
  const [isPolling, setIsPolling] = useState(false); // Controla o polling

  const createSession = async () => {
    try {
      const response = await fetch('http://localhost:3000/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionName }),
      });

      const data = await response.json();
      if (data.success) {
        setSessionStatus(`Sessão ${sessionName} iniciada.`);
        setIsPolling(true); // Inicia o polling ao criar a sessão
      } else {
        setSessionStatus(`Erro ao iniciar sessão: ${data.error}`);
        setIsPolling(false);
      }
    } catch (error) {
      console.error('Erro ao criar sessão:', error);
      setSessionStatus('Erro ao criar sessão.');
      setIsPolling(false);
    }
  };

  const getQrCode = async () => {
    try {
      const response = await fetch(`http://localhost:3000/get-qr/${sessionName}`);
      const data = await response.json();
      if (data.success) {
        setQrCode(data.qrCode);
        setSessionStatus('QR Code recebido!');
        setIsPolling(false); // Interrompe o polling ao receber o QR code
      } else {
        setSessionStatus(
          data.error || 'Erro ao obter QR Code: Tentando novamente...'
        );
      }
    } catch (error) {
      console.error('Erro ao obter QR Code:', error);
      setSessionStatus('Erro ao obter QR Code.');
      setIsPolling(false);
    }
  };

  useEffect(() => {
    // Inicia o polling se isPolling for true
    if (isPolling) {
      const intervalId = setInterval(() => {
        getQrCode();
      }, 5000); // Tenta a cada 2 segundos

      // Limpa o intervalo quando o componente for desmontado ou isPolling mudar
      return () => clearInterval(intervalId);
    }
  }, [isPolling, sessionName]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-3xl font-bold mb-4">Integração WhatsApp</h1>

      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="sessionName"
          >
            Nome da Sessão:
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="sessionName"
            type="text"
            placeholder="Nome da sessão"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="button"
            onClick={createSession}
            disabled={isPolling} // Desabilita o botão enquanto o polling está ativo
          >
            {isPolling ? 'Carregando...' : 'Criar Sessão'}
          </button>
        </div>
      </div>

      {sessionStatus && (
        <div className="text-center mt-4">
          <p className="text-gray-700">{sessionStatus}</p>
        </div>
      )}

      {qrCode && (
        <div className="mt-4">
          <img src={qrCode} alt="QR Code" />
        </div>
      )}
    </div>
  );
}
