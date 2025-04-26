const express = require('express');
const bodyParser = require('body-parser');
const { connectToWhatsApp, getQrCode } = require('./wpp/client');
const messageRoutes = require('./routes/message');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use('/api', messageRoutes);

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

app.get('/status', (req, res) => {
  res.json({ status: 'running', timestamp: new Date().toISOString() });
});

// Endpoint para obter o QR code
app.get('/qr', (req, res) => {
  const qrCode = getQrCode();
  if (qrCode) {
    res.send(`<html>
      <head>
        <title>WhatsApp QR Code</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: Arial, sans-serif; }
          h1 { margin-bottom: 20px; }
          img { max-width: 300px; }
          .container { text-align: center; box-shadow: 0 0 10px rgba(0,0,0,0.1); padding: 20px; border-radius: 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Escaneie o QR Code</h1>
          <img src="${qrCode}" alt="WhatsApp QR Code">
          <p>Abra o WhatsApp no seu celular e escaneie este código para se conectar.</p>
        </div>
        <script>
          // Recarregar a página a cada 30 segundos para atualizar o QR code, se necessário
          setTimeout(() => window.location.reload(), 30000);
        </script>
      </body>
    </html>`);
  } else {
    res.send(`<html>
      <head>
        <title>WhatsApp Status</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: Arial, sans-serif; }
          h1 { margin-bottom: 20px; }
          .container { text-align: center; box-shadow: 0 0 10px rgba(0,0,0,0.1); padding: 20px; border-radius: 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Status do WhatsApp</h1>
          <p>WhatsApp já está conectado ou QR code ainda não foi gerado.</p>
          <p><a href="/qr">Atualizar</a></p>
        </div>
      </body>
    </html>`);
  }
});

app.listen(PORT, async () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  await connectToWhatsApp();
  console.log(`📱 QR Code disponível em http://localhost:${PORT}/qr`);
});