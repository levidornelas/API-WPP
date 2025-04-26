const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const P = require('pino');
const { setupEventHandlers } = require('./handlers');
const qrcode = require('qrcode'); // Adicione esta dependência

let sock = null;
let qrCodeData = null; // Para armazenar os dados do QR code

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");

  sock = makeWASocket({
    auth: state,
    logger: P(),
    markOnlineOnConnect: false,
    browser: ['Windows', 'Opera', '25.04.4'],
    printQRInTerminal: false, // Desativamos a impressão no terminal
  });

  sock.ev.on('creds.update', saveCreds);

  // Captura o evento de QR code
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      // Converter o QR code para formato de imagem
      qrCodeData = await qrcode.toDataURL(qr);
      console.log('QR Code gerado e disponível no endpoint /qr');
    }

    if (connection === 'open') {
      console.log('✅ Conectado ao WhatsApp!');
      qrCodeData = null; // Limpa o QR code quando conectado
    } else if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode;
      console.log('❌ Desconectado. Código:', code);
      if (code !== 403) {
        console.log('🔄 Tentando reconectar...');
        require('./client').connectToWhatsApp();
      }
    }
  });

  setupEventHandlers(sock);

  return sock;
}

// Função para obter o QR code atual
function getQrCode() {
  return qrCodeData;
}

module.exports = { connectToWhatsApp, getSocket: () => sock, getQrCode };