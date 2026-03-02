import { cerrarMesProduccion, regenerarPdfReporteMensual } from "../helpers/cerrarMesProduccion.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import ReporteMensual from "../models/reporteMensual.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function obtenerMesAnterior(fecha = new Date()) {
    const anterior = new Date(fecha.getFullYear(), fecha.getMonth() - 1, 1);
    return {
        mes: anterior.getMonth() + 1,
        año: anterior.getFullYear()
    };
}

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

    async cerrarMesCron(req, res) {
        try {
            const configuredSecret = process.env.CRON_SECRET;
            const providedSecret = req.headers["x-cron-secret"];
            const authHeader = req.headers.authorization || "";
            const bearerSecret = authHeader.startsWith("Bearer ")
                ? authHeader.slice(7)
                : null;

            if (!configuredSecret) {
                return res.status(500).json({
                    ok: false,
                    error: "CRON_SECRET no configurado en el servidor"
                });
            }

            if (providedSecret !== configuredSecret && bearerSecret !== configuredSecret) {
                return res.status(401).json({
                    ok: false,
                    error: "No autorizado"
                });
            }

            let { mes, año } = req.body ?? {};

            if (!mes || !año) {
                const anterior = obtenerMesAnterior(new Date());
                mes = anterior.mes;
                año = anterior.año;
            }

            const resultado = await cerrarMesProduccion(Number(mes), Number(año));

            return res.json({
                ok: true,
                message: "Cierre mensual ejecutado por cron",
                reporte: resultado.cierre
            });
        } catch (error) {
            if (error.message?.includes("ya fue cerrado")) {
                return res.status(200).json({
                    ok: true,
                    skipped: true,
                    message: error.message
                });
            }

            return res.status(400).json({
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
    
            const candidatos = [
                path.join(process.cwd(), "reportes", reporte.archivo_pdf),
                path.join(process.cwd(), "backend", "reportes", reporte.archivo_pdf),
                path.join(__dirname, "..", "..", "reportes", reporte.archivo_pdf)
            ];

            let rutaPdf = candidatos.find((ruta) => fs.existsSync(ruta));
            

            if (!rutaPdf) {
                try {
                    const nombreRegenerado = await regenerarPdfReporteMensual(
                        Number(reporte.mes),
                        Number(reporte.año)
                    );

                    if (nombreRegenerado && reporte.archivo_pdf !== nombreRegenerado) {
                        reporte.archivo_pdf = nombreRegenerado;
                        await reporte.save();
                    }

                    const candidatosRegenerados = [
                        path.join(process.cwd(), "reportes", reporte.archivo_pdf),
                        path.join(process.cwd(), "backend", "reportes", reporte.archivo_pdf),
                        path.join(__dirname, "..", "..", "reportes", reporte.archivo_pdf)
                    ];

                    rutaPdf = candidatosRegenerados.find((ruta) => fs.existsSync(ruta));
                } catch (regenError) {
                    console.error("No se pudo regenerar el PDF:", regenError);
                }
            }

            if (!rutaPdf) {
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
