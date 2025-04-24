const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const P = require('pino');
const { setupEventHandlers } = require('./handlers');

let sock = null;

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");

  sock = makeWASocket({
    auth: state,
    logger: P(),
    markOnlineOnConnect: false,
    browser: ['Ubuntu', 'Chrome', '22.04.4'],
    printQRInTerminal: true,
  });

  sock.ev.on('creds.update', saveCreds);

  setupEventHandlers(sock);

  return sock;
}

module.exports = { connectToWhatsApp, getSocket: () => sock };
