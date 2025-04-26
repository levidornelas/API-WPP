const express = require('express');
const bodyParser = require('body-parser');
const { startSock, getQrCode } = require('./wpp/client');
const cors = require('cors')
const app = express();

const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors())
// POST para iniciar sessão
app.post('/start-session', async (req, res) => {
  try {
    const sessionName = req.body.sessionName || 'session1';
    await startSock(sessionName);
    res.status(200).json({ success: true, message: `Sessão ${sessionName} iniciada.` });
  } catch (err) {
    console.error('Erro ao iniciar sessão:', err);
    res.status(500).json({ success: false, message: 'Erro ao iniciar sessão.' });
  }
});

// GET para retornar o QR Code em JSON
app.get('/qr', (req, res) => {
  const qr = getQrCode();
  if (qr) {
    res.status(200).json({ success: true, qr });
  } else {
    res.status(404).json({ success: false, message: 'QR Code não disponível ou sessão já conectada.' });
  }
});

// Teste rápido
app.get('/status', (req, res) => {
  res.json({ status: 'running', timestamp: new Date().toISOString() });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
