const express = require('express');
const router = express.Router();
const { getSocket } = require('../wpp/client');

router.post('/send-message', async (req, res) => {
  const { phoneNumber, message, messageType = 'text', imageUrl } = req.body;
  const sock = getSocket();

  if (!sock) return res.status(503).json({ success: false, message: 'WhatsApp não conectado' });
  if (!phoneNumber || !message) return res.status(400).json({ success: false, message: 'Campos obrigatórios faltando' });

  const jid = phoneNumber.includes('@') ? phoneNumber : phoneNumber.replace(/[^\d]/g, '') + '@s.whatsapp.net';

  try {
    let result;
    if (messageType === 'text') {
      result = await sock.sendMessage(jid, { text: message });
    } else if (messageType === 'image' && imageUrl) {
      result = await sock.sendMessage(jid, { image: { url: imageUrl }, caption: message });
    } else {
      return res.status(400).json({ success: false, message: 'Tipo de mensagem não suportado' });
    }

    res.json({ success: true, result });
  } catch (err) {
    console.error('Erro no envio:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
