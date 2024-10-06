const { Client } = require('whatsapp-web.js');
const sqlite3 = require('sqlite3').verbose();
const qrcode = require('qrcode-terminal');

const db = new sqlite3.Database('cuentas.db');

db.serialize(() => {

    db.run("CREATE TABLE IF NOT EXISTS cuentas (dni TEXT, cuenta_banco TEXT, banco TEXT, nombre TEXT)");


    db.run("CREATE TABLE IF NOT EXISTS usuarios (chat_id TEXT)");
});


const client = new Client();

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});


client.on('ready', () => {
    console.log('El bot está listo');
});


let expectingDNI = {};

client.on('message', (message) => {
    const chatId = message.from;
    console.log(message.body);
    

    if (!message.isGroupMsg) {
        db.get("SELECT chat_id FROM usuarios WHERE chat_id = ?", [chatId], (err, row) => {
            if (err) {
                console.error(err);
            } else if (!row) {
                message.reply(`¡Hola! Bienvenido/a al consultor de cuentas de AQUANQA.\nEstamos aquí para ayudarte. Para conocer en qué banco se abrió tu cuenta y cuál es tu número de cuenta, simplemente envía la palabra !micuenta.\n\n¡Estamos a tu disposición para cualquier consulta!`);
                db.run("INSERT INTO usuarios (chat_id) VALUES (?)", [chatId]);
            }
        });
    }



    if (message.body.toLowerCase() === '!micuenta') {
        message.reply("¡Hola! Para poder ayudarte mejor, por favor ingresa tu número de DNI sin espacios. 🫐");
        expectingDNI[chatId] = true; 
    } 

    else if (expectingDNI[chatId] && /^\d{8}$/.test(message.body)) {
        const dni = message.body;


        db.get("SELECT cuenta_banco, banco, nombre FROM cuentas WHERE TRIM(dni) = ?", [dni.trim()], (err, row) => {
            if (err) {
                message.reply('Hubo un error al buscar tu información. Vuelve a usar !micuenta');
                console.error(err);
            } else if (row) {
                message.reply(`¡Hola, ${row.nombre.trim()}! 🎉\nSe te ha aperturado tu cuenta en ${row.banco.trim()} con el número: ${row.cuenta_banco.trim()}.\nSi necesitas más información, ¡no dudes en preguntar!\n\n¡Gracias por pertenecer a la familia AQUANQA! 🤗`);
            } else {
                message.reply('No encontré ninguna información asociada a ese DNI. Vuelve a enviar la palabra !micuenta para consultar otro DNI.');
            }
        });
          


        delete expectingDNI[chatId];
    } 

    else if (expectingDNI[chatId]) {
        message.reply('Por favor, ingresa un DNI válido (8 dígitos).');
    }
});


client.initialize();
