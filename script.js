const sqlite3 = require('sqlite3').verbose();
const xlsx = require('xlsx');
const path = require('path');

// Abrir o crear la base de datos SQLite
const db = new sqlite3.Database('cuentas.db');

db.serialize(() => {
  // Crear la tabla si no existe
  db.run("CREATE TABLE IF NOT EXISTS cuentas (dni TEXT, cuenta_banco TEXT, banco TEXT, nombre TEXT)");

  // Función para leer y procesar un archivo Excel
  const processExcelFile = (filePath) => {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // Usamos la primera hoja
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    const stmt = db.prepare("INSERT INTO cuentas VALUES (?, ?, ?, ?)");

    // Iterar sobre cada fila y extraer DNI, CUENTA_BANCO y BANCO
    data.forEach(row => {
      const dni = row['IDCODIGOGENERAL'];
      const cuenta_banco = row['CUENTA_BANCO'];
      const banco = row['IDBANCO'];
      const nombre = row['APENOM'];
      if (dni && cuenta_banco && banco && nombre) {
        stmt.run(dni, cuenta_banco, banco, nombre);
      }
    });

    stmt.finalize();
  };

  // Procesar cada archivo Excel
  const files = [
    path.join(__dirname, 'CUENTAS AQI CAMPO.xlsx'),
    path.join(__dirname, 'CUENTAS PACKING.xlsx'),
    path.join(__dirname, 'CUENTAS AQ2.xlsx')
  ];

  files.forEach(file => processExcelFile(file));

  // Verificar los datos insertados
  db.each("SELECT dni, cuenta_banco, banco, nombre FROM cuentas", (err, row) => {
    if (err) {
      console.error(err);
    } else {
      console.log(row.dni + ": " + row.cuenta_banco + " - " + row.banco + " - " + row.nombre);
    }
  });
});

db.close();
