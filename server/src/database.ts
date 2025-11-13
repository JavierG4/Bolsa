// src/database.ts
import { MongoClient } from 'mongodb';

// El código se ejecutará dentro de esta función asíncrona autoejecutable (IIFE).
(async () => {
    const uri = process.env.ATLAS_URI;

    // 1. Verificación de la URI
    if (!uri) {
        // Usamos console.error y process.exit(1) para errores críticos
        console.error('❌ ERROR: No se encontró la variable ATLAS_URI. Asegúrate de usar "node -r dotenv/config" y de que tu archivo .env existe.');
        process.exit(1);
    }

    const client = new MongoClient(uri);

    try {
        console.log('⏳ Intentando conectar a la base de datos...');
        
        // 2. Conexión y Ping
        // Al llamar a client.connect() o client.db().command({ ping: 1 }), 
        // se intenta la conexión.
        await client.db().command({ ping: 1 }); 
        
        console.log('✅ Conexión exitosa a MongoDB.');
    } catch (e) {
        // 3. Manejo de Errores
        if (e instanceof Error) {
            console.error('❌ Error de conexión:', e.message);
        } else {
            console.error('❌ Error desconocido durante la conexión:', e);
        }
        process.exit(1); // Salir con código de error
    } finally {
        // 4. Cerrar la conexión siempre
        await client.close();
        console.log('🔌 Conexión cerrada.');
        process.exit(0); // Salir con éxito
    }
})();
