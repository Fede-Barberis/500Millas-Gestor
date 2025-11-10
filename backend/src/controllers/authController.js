// src/controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Usuario } from "../models/index.js";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const SALT_ROUNDS = 10;


const authController = {

    async register (req, res) {
        try {
            const { name, email, password } = req.body;

            if (!name || !email || !password) {
                return res.status(400).json({ success: false, message: "Todos los campos son obligatorios." });
            }

            const existing = await Usuario.findOne({ where: { email } });
            if (existing) {
                return res.status(409).json({ success: false, message: "El email ya está registrado." });
            }

            const hashed = await bcrypt.hash(password, SALT_ROUNDS);

            const user = await Usuario.create({ name, email, password: hashed });

            // Opcional: no devolver la password
            const userSafe = { id: user.id, name: user.name, email: user.email };

            return res.status(201).json({ success: true, message: "Usuario creado.", user: userSafe });
        } catch (error) {
            console.error("Error en register:", error);
            return res.status(500).json({ success: false, message: "Error interno." });
        }
    },

    async login (req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) return res.status(400).json({ success: false, message: "Email y password requeridos." });

            const user = await Usuario.findOne({ where: { email } });
            if (!user) return res.status(401).json({ success: false, message: "Credenciales inválidas." });

            const match = await bcrypt.compare(password, user.password);
            if (!match) return res.status(401).json({ success: false, message: "Credenciales inválidas." });

            const tokenPayload = { userId: user.id, email: user.email };
            const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

            const userSafe = { id: user.id, name: user.name, email: user.email };

            return res.json({ 
                success: true, 
                message: "Autenticado.", 
                user: userSafe, 
                token 
            });
            
        } catch (error) {
            console.error("Error en login:", error);
            return res.status(500).json({ success: false, message: "Error interno." });
        }
    },
}

export default authController;