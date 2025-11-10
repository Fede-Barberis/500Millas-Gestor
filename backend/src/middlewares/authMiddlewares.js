// src/middlewares/authMiddleware.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) return res.status(401).json({ success: false, message: "Token requerido." });

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        // Podés guardar lo que necesites en req.user
        req.user = { userId: payload.userId, email: payload.email };
        next();
    } catch (err) {
        return res.status(403).json({ success: false, message: "Token inválido." });
    }
};
