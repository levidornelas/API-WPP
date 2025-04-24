const express = require('express');
const bodyParser = require('body-parser');
const { connectToWhatsApp } = require('./wpp/client');
const messageRoutes = require('./routes/message');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use('/api', messageRoutes);

app.get('/status', (req, res) => {
  res.json({ status: 'running', timestamp: new Date().toISOString() });
});

app.listen(PORT, async () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  await connectToWhatsApp();
});
