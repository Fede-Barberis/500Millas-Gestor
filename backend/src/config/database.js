import Sequelize from 'sequelize'
import dotenv from 'dotenv'

dotenv.config()

//* Configuracion bd con Sequalize
const db = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
});

export default db;

// //* Configuracion de la base de datos con MySql
// const dbConfig = {
//     host: process.env.DB_HOST || 'localHost',
//     user: process.env.DB_USER || 'root',
//     password: process.env.DB_PASSWORD || '',
//     database: process.env.DB_NAME || 'db500Millas',
//     port: process.env.DB_PORT || 3306,
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0
// }

// //* Crear pool de conexiones
// const pool = mysql.createPool(dbConfig);

// //* Funcion para probar la conexion
// const testConnection = async () => {
//     try {
//         const connection = await pool.getConnection()
//         console.log("Conexion a MySql establecida correctamente");
//         connection.release()
//         return true
//     } catch (err) {
//         console.log("Error de conexion con la base de datos:", err);
//         return false
//     }
// }

// export { pool, testConnection }