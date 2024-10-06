const sqlite3 = require('sqlite3').verbose();

// Conectar a la base de datos cuentas.db
let db = new sqlite3.Database('./cuentas.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Conectado a la base de datos cuentas.db.');
});

// Reemplaza '12345678' con el DNI que quieras buscar
const dni = '45908939';

db.get("SELECT * FROM cuentas WHERE dni = ?", [dni], (err, row) => {
    if (err) {
        throw err;
    }
    if (row) {
        console.log("Información encontrada:", row);
    } else {
        console.log("No se encontró información asociada a ese DNI.");
    }
});

// Cerrar la conexión cuando se haya terminado
db.close((err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Cerrada la conexión a la base de datos.');
});
