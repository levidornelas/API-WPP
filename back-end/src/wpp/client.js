const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const { useMySQLAuthState } = require('mysql-baileys');
const { pino } = require('pino');

const logger = pino({ level: 'silent' }); // ou 'info' se quiser ver mais logs


let sock = null;
let currentQR = null;
async function startSock(sessionName) {
  const { error, version } = await fetchLatestBaileysVersion();
  if (error) {
    console.log(`Session: ${sessionName} | Erro de conexão.`);
    return;
  }

  const { state, saveCreds } = await useMySQLAuthState({
    session: sessionName,
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '1144',
    database: 'wpp_arle',
    tableName: 'auth'
  });

  sock = makeWASocket({
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger)
    },
    version,
    printQRInTerminal: false, // NÃO printar no terminal
    logger,
    browser: ['MySQL-Baileys', 'Chrome', '120.0.0']
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      currentQR = qr; // Atualiza o QR Code
    }

    if (connection === 'open') {
      console.log(`[${sessionName}] ✅ Conectado ao WhatsApp!`);
      currentQR = null; // Limpa o QR Code após a conexão
    }

    if (connection === 'close') {
      const shouldReconnect = lastDisconnect.error?.output?.statusCode !== 403; // Verifica se deve reconectar
      console.log(`[${sessionName}] ❌ Conexão fechada. ${shouldReconnect ? 'Reconectando...' : 'Não reconectável (403)'}`);

      if (shouldReconnect) {
        sock = null; // Limpa a instância de sock antes de tentar reconectar
        setTimeout(() => startSock(sessionName), 3000); // Espera 3 segundos e tenta reconectar
      }
    }
  });

  // Este evento só será registrado se sock for inicializado corretamente
  if (sock) {
    sock.ev.on('messages.upsert', async ({ messages }) => {
      if (messages && messages[0]) {
        console.log('📩 Mensagem recebida:', messages[0]);
      }
    });
  } else {
    console.log('Erro: sock não foi inicializado corretamente.');
  }
}

function getQrCode() {
  return currentQR;
}

module.exports = { startSock, getQrCode };
