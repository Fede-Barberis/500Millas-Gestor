import axios from 'axios'

/**
 * Instancia de Axios configurada con la URL base desde las variables de entorno.
 * Usa esta instancia para realizar solicitudes HTTP al backend.
 *
 * @remarks
 * La URL base se establece usando `import.meta.env.VITE_API_URL`, que debe estar definida en tu configuración de entorno
 */

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
    headers: {
        'Content-Type': 'application/json',
    },
})

/**
 * Recupera el token de autenticación del almacenamiento local del navegador.
 * El token se almacena bajo la clave 'token' y normalmente se utiliza
 * para autorizar solicitudes a la API.
*/
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if(token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export default api