'use client'; // Se for Next 13+

import { useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [sessionName, setSessionName] = useState('');
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleStartSession = async () => {
    if (!sessionName) {
      alert('Digite o nome da sessão.');
      return;
    }

    setLoading(true);

    try {
      // 1. Iniciar sessão
      await axios.post('http://localhost:3000/start-session', { sessionName });

      // 2. Buscar o QR Code
      const interval = setInterval(async () => {
        const { data } = await axios.get('http://localhost:3000/qr');

        if (data.success && data.qr) {
          setQrCode(`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(data.qr)}&size=300x300`);
          clearInterval(interval); // Para o polling quando tiver QR
        }
      }, 1000); // tenta buscar a cada 1 segundo

    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao iniciar sessão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 20 }}>
      <h1>Iniciar Sessão WhatsApp</h1>

      <input
        type="text"
        placeholder="Nome da sessão"
        value={sessionName}
        onChange={(e) => setSessionName(e.target.value)}
        style={{ padding: 10, marginBottom: 10 }}
      />

      <button onClick={handleStartSession} style={{ padding: '10px 20px', marginBottom: 20 }}>
        {loading ? 'Iniciando...' : 'Iniciar Sessão'}
      </button>

      {qrCode && (
        <div>
          <h2>Escaneie o QR Code</h2>
          <img src={qrCode} alt="QR Code" />
        </div>
      )}
    </div>
  );
}
