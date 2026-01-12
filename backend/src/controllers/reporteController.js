import { cerrarMesProduccion } from "../helpers/cerrarMesProduccion.js";
import path from "path";
import fs from "fs";
import ReporteMensual from "../models/reporteMensual.js";

const reportesController = {

    async cerrarMes(req, res) {
        try {
            const { mes, año } = req.body;

            if (!mes || !año) {
                throw new Error("Mes y año son obligatorios");
            }

            const resultado = await cerrarMesProduccion(mes, año);

            res.json({
                ok: true,
                message: "Mes cerrado correctamente",
                reporte: resultado.cierre
            });

        } catch (error) {
            res.status(400).json({
                ok: false,
                error: error.message
            });
        }
    },

    // Listar todos los reportes
    async listarReportes(req, res) {
        try {
            const reportes = await ReporteMensual.findAll({
                order: [
                    ["año", "DESC"],
                    ["mes", "DESC"]
                ]
            });

            res.json(reportes);
        } catch (error) {
            console.error("Error al listar reportes:", error);
            res.status(500).json({ error: "Error al obtener reportes" });
        }
    },

    // Descargar PDF
    async descargarReporte(req, res) {
        try {
            const { id } = req.params;
    
            const reporte = await ReporteMensual.findByPk(id);
    
            if (!reporte) {
                return res.status(404).json({
                    ok: false,
                    error: "Reporte no encontrado"
                });
            }
    
            // USAR DIRECTAMENTE LA RUTA GUARDADA
            const rutaPdf = path.join(
                process.cwd(),
                "reportes",
                reporte.archivo_pdf
            );
            
    
            if (!fs.existsSync(rutaPdf)) {
                return res.status(404).json({
                    ok: false,
                    error: "Archivo PDF no encontrado"
                });
            }
    
            // Nombre amigable para descarga
            const nombreDescarga = path.basename(rutaPdf);
    
            return res.download(rutaPdf, nombreDescarga);
    
        } catch (error) {
            console.error("Error al descargar reporte:", error);
            return res.status(500).json({
                ok: false,
                error: "Error al descargar reporte"
            });
        }
    }


};

export default reportesController;
