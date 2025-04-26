function setupEventHandlers(sock) {
  sock.ev.on('messages.upsert', async ({ messages }) => {
    if (messages && messages[0]) {
      console.log('📩 Mensagem recebida:', messages[0]);
    }
  });
}

module.exports = { setupEventHandlers };