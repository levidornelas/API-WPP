
function setupEventHandlers(sock) {
  sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
    if (connection === 'open') {
      console.log('✅ Conectado ao WhatsApp!');
    } else if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode;
      console.log('❌ Desconectado. Código:', code);
      if (code !== 403) {
        console.log('🔄 Tentando reconectar...');
        require('./client').connectToWhatsApp();
      }
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    if (messages && messages[0]) {
      console.log('📩 Mensagem recebida:', messages[0]);
    }
  });
}

module.exports = { setupEventHandlers };
