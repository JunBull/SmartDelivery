const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'smartdelivery.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error al conectar con SQLite:', err.message);
  } else {
    console.log('Conectado exitosamente a la base de datos SQLite:', DB_PATH);
  }
});

// Métodos utilitarios con soporte para Promesas
const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

// Función para poblar datos iniciales si las tablas están vacías
const seedData = async () => {
  try {
    // 1. Verificar y poblar usuarios
    const userCount = await get('SELECT COUNT(*) as count FROM users');
    if (userCount.count === 0) {
      const saltRounds = 10;
      const adminPasswordHash = await bcrypt.hash('admin123', saltRounds);
      const clientPasswordHash = await bcrypt.hash('cliente123', saltRounds);

      await run(
        `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
        ['Administrador Tienda', 'admin@smartdelivery.com', adminPasswordHash, 'tienda']
      );

      await run(
        `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
        ['Cliente Registrado', 'cliente@smartdelivery.com', clientPasswordHash, 'cliente']
      );

      console.log('Usuarios iniciales creados exitosamente (admin@smartdelivery.com / cliente@smartdelivery.com).');
    }

    // 2. Verificar y poblar productos tecnológicos
    const productCount = await get('SELECT COUNT(*) as count FROM products');
    if (productCount.count === 0) {
      const initialProducts = [
        {
          name: 'Teclado Mecánico RGB Pro',
          description: 'Teclado para gaming con switches mecánicos táctiles, retroiluminación RGB configurable y chasis de aluminio pulido.',
          price: 79.99,
          stock: 15,
          image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80'
        },
        {
          name: 'Mouse Inalámbrico Pro Ultra',
          description: 'Sensor óptico avanzado de 16,000 DPI, latencia ultra baja de 1ms, diseño ergonómico y batería recargable de larga duración.',
          price: 49.99,
          stock: 25,
          image_url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80'
        },
        {
          name: 'Monitor Gamer 24" 144Hz FHD',
          description: 'Pantalla IPS con tasa de refresco ultra rápida de 144Hz, tiempo de respuesta de 1ms y tecnología FreeSync Premium.',
          price: 189.99,
          stock: 10,
          image_url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80'
        },
        {
          name: 'Auriculares Bluetooth Noise-Cancelling',
          description: 'Cancelación activa de ruido (ANC), audio de alta resolución con graves dinámicos, micrófono HD y 30 horas de autonomía.',
          price: 89.99,
          stock: 20,
          image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'
        }
      ];

      for (const product of initialProducts) {
        await run(
          `INSERT INTO products (name, description, price, stock, image_url) VALUES (?, ?, ?, ?, ?)`,
          [product.name, product.description, product.price, product.stock, product.image_url]
        );
      }

      console.log('Catálogo de 4 productos tecnológicos inicializado correctamente.');
    }
  } catch (error) {
    console.error('Error durante la ejecución de seedData:', error);
    throw error;
  }
};

// Inicialización de esquemas de tablas
const initDB = async () => {
  try {
    await run('PRAGMA foreign_keys = ON;');

    await run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('cliente', 'tienda'))
      );
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        stock INTEGER NOT NULL,
        image_url TEXT
      );
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        status TEXT DEFAULT 'Pendiente',
        origin_lat REAL,
        origin_lng REAL,
        dest_lat REAL,
        dest_lng REAL,
        current_lat REAL,
        current_lng REAL,
        address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(client_id) REFERENCES users(id),
        FOREIGN KEY(product_id) REFERENCES products(id)
      );
    `);

    await seedData();
    console.log('Base de datos inicializada y tablas verificadas.');
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    throw error;
  }
};

// Inicializar automáticamente al importar
initDB().catch((err) => {
  console.error('Fallo en la auto-inicialización de la base de datos:', err);
});

module.exports = {
  db,
  query,
  get,
  run,
  seedData,
  initDB
};
