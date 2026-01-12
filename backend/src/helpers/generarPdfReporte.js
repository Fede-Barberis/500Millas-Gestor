import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

function generarPdfReporte({
    mes,
    año,
    totalProducciones,
    totalVentas,
    totalPedidos,
    alfajoresProducidos,
    galletasMarinasSSProducidas,
    galletasMarinasCSProducidas,
    stocks, 
    totalTapasMes,
    tapasPorProducto, 
}) {
    return new Promise((resolve, reject) => {
        // 📁 Carpeta absoluta
        const carpeta = path.join(process.cwd(), "reportes");
        const nombreArchivo = `reporte_${mes}_${año}.pdf`;
        const ruta = path.join(carpeta, nombreArchivo);

        // Crear carpeta si no existe
        if (!fs.existsSync(carpeta)) {
        fs.mkdirSync(carpeta, { recursive: true });
        }

        const doc = new PDFDocument({
        margin: 50,
        size: "A4",
        bufferPages: true
        });

        const stream = fs.createWriteStream(ruta);
        doc.pipe(stream);

        // Colores modernos
        const colors = {
        primary: "#4F46E5", // Indigo
        secondary: "#818CF8", // Indigo claro
        accent: "#10B981", // Verde
        orange: "#F59E0B", // Naranja
        purple: "#8B5CF6", // Púrpura
        red: "#EF4444", // Rojo
        blue: "#3B82F6", // Azul
        text: "#1F2937", // Gris oscuro
        textLight: "#6B7280", // Gris medio
        background: "#F3F4F6", // Gris muy claro
        white: "#FFFFFF"
        };

        const meses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        ];

        // ========================================
        // 🎨 ENCABEZADO CON DISEÑO MODERNO
        // ========================================

        doc.rect(0, 0, doc.page.width, 200).fill(colors.primary);

        doc.fontSize(36)
        .fillColor(colors.white)
        .font("Helvetica-Bold")
        .text("500-Millas", 50, 50, { align: "left" });

        doc.rect(50, 100, 180, 4).fill(colors.accent);

        doc.fontSize(26)
        .fillColor(colors.white)
        .font("Helvetica-Bold")
        .text("Reporte Mensual", 50, 120);

        doc.fontSize(18)
        .fillColor(colors.secondary)
        .font("Helvetica")
        .text(`${meses[mes - 1]} ${año}`, 50, 155);

        doc.fontSize(9)
        .fillColor(colors.white)
        .text(`Generado: ${new Date().toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit", 
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        })}`,
        doc.page.width - 200, 50,
        { align: "right", width: 150 });

        // ========================================
        // 📊 TARJETAS DE ACTIVIDAD (3 columnas)
        // ========================================

        const startY = 240;
        const cardWidth = (doc.page.width - 200) / 3;
        const cardHeight = 110;
        const cardSpacing = 25;

        const activityCards = [
        {
            title: "PRODUCCIONES",
            value: totalProducciones.toString(),
            color: colors.primary,
            x: 50
        },
        {
            title: "VENTAS",
            value: totalVentas.toString(),
            color: colors.accent,
            x: 50 + cardWidth + cardSpacing
        },
        {
            title: "PEDIDOS",
            value: totalPedidos.toString(),
            color: colors.orange,
            x: 50 + (cardWidth + cardSpacing) * 2
        }
        ];

        activityCards.forEach(card => {
            doc.rect(card.x, startY, cardWidth, cardHeight).fill(colors.background);
            doc.rect(card.x, startY, cardWidth, 6).fill(card.color);
            
            doc.fontSize(10)
                .fillColor(colors.textLight)
                .font("Helvetica")
                .text(card.title, card.x + 15, startY + 25, { width: cardWidth - 30, align: "left" });
            
            doc.fontSize(32)
                .fillColor(card.color)
                .font("Helvetica-Bold")
                .text(card.value, card.x + 15, startY + 50, { width: cardWidth - 30, align: "left" });
        });

        // ========================================
        // 🍪 PRODUCCIÓN POR TIPO DE PRODUCTO
        // ========================================

        const produccionY = startY + cardHeight + 40;

        doc.fontSize(20)
        .fillColor(colors.text)
        .font("Helvetica-Bold")
        .text("Producción por Tipo de Producto", 50, produccionY);

        doc.rect(50, produccionY + 28, doc.page.width - 100, 3).fill(colors.primary);

        const prodCardY = produccionY + 50;
        const prodCardWidth = (doc.page.width - 175) / 3;
        const prodCardSpacing = 12.5;

        const produccionCards = [
            {
                title: "Alfajores",
                value: alfajoresProducidos.toLocaleString(),
                color: colors.purple
            },
            {
                title: "Galletas Marinas S/S",
                value: galletasMarinasSSProducidas.toLocaleString(),
                color: colors.blue
            },
            {
                title: "Galletas Marinas C/S",
                value: galletasMarinasCSProducidas.toLocaleString(),
                color: colors.orange
            }
        ];

        produccionCards.forEach((card, index) => {
            const xPos = 50 + (prodCardWidth + prodCardSpacing) * index;
            
            doc.rect(xPos, prodCardY, prodCardWidth, 95).fill(colors.background);
            doc.rect(xPos, prodCardY, prodCardWidth, 5).fill(card.color);
            
            doc.fontSize(9)
                .fillColor(colors.textLight)
                .font("Helvetica")
                .text(card.title, xPos + 12, prodCardY + 20, { width: prodCardWidth - 24, align: "center" });
            
            doc.fontSize(28)
                .fillColor(card.color)
                .font("Helvetica-Bold")
                .text(card.value, xPos + 12, prodCardY + 45, { width: prodCardWidth - 24, align: "center" });
            
            doc.fontSize(8)
                .fillColor(colors.textLight)
                .font("Helvetica")
                .text("unidades", xPos + 12, prodCardY + 78, { width: prodCardWidth - 24, align: "center" });
        });

        // ========================================
        // 🎯 TAPAS PRODUCIDAS
        // ========================================

        let currentY = prodCardY + 130;

        if (currentY > doc.page.height - 400) {
        doc.addPage();
        currentY = 80;
        }

        doc.fontSize(20)
        .fillColor(colors.text)
        .font("Helvetica-Bold")
        .text("Tapas Producidas del Mes", 50, currentY);

        doc.rect(50, currentY + 28, doc.page.width - 100, 3).fill(colors.accent);

        // Total de tapas destacado
        currentY += 50;
        doc.rect(50, currentY, doc.page.width - 100, 80).fill(colors.background);
        doc.rect(50, currentY, doc.page.width - 100, 5).fill(colors.accent);

        doc.fontSize(11)
        .fillColor(colors.textLight)
        .font("Helvetica")
        .text("TOTAL DE TAPAS DEL MES", 70, currentY + 22);

        doc.fontSize(36)
        .fillColor(colors.accent)
        .font("Helvetica-Bold")
        .text(totalTapasMes.toLocaleString(), 70, currentY + 42);

        // Tabla de tapas por producto
        currentY += 105;

        doc.rect(50, currentY, doc.page.width - 100, 35).fill(colors.accent);

        doc.fontSize(11)
        .fillColor(colors.white)
        .font("Helvetica-Bold")
        .text("PRODUCTO", 65, currentY + 11)
        .text("TAPAS PRODUCIDAS", doc.page.width - 350, currentY + 11)
        .text("% DEL TOTAL", doc.page.width - 150, currentY + 11, { width: 80, align: "center" });

        currentY += 35;
        let alternate = false;

        tapasPorProducto.forEach((item, index) => {
        if (currentY > doc.page.height - 100) {
            doc.addPage();
            currentY = 80;
            alternate = false;
        }

        const rowHeight = 30;
        
        if (alternate) {
            doc.rect(50, currentY, doc.page.width - 100, rowHeight).fill(colors.background);
        }

        const porcentaje = ((item.tapas / totalTapasMes) * 100).toFixed(1);

        doc.fontSize(10)
            .fillColor(colors.text)
            .font("Helvetica")
            .text(item.producto, 65, currentY + 9, { width: 250, ellipsis: true })
            .font("Helvetica-Bold")
            .text(item.tapas.toLocaleString(), doc.page.width - 350, currentY + 9)
            .fillColor(colors.accent)
            .text(`${porcentaje}%`, doc.page.width - 150, currentY + 9, { width: 40, align: "center" });

        // Barra de progreso
        const barWidth = 45;
        const barX = doc.page.width - 50;
        const barY = currentY + 8;

        doc.rect(barX - barWidth, barY, barWidth, 14).fill("#E5E7EB");
        doc.rect(barX - barWidth, barY, (barWidth * parseFloat(porcentaje)) / 100, 14).fill(colors.accent);

        currentY += rowHeight;
        alternate = !alternate;
        });

        // ========================================
        // 📦 STOCK DE PRODUCTOS
        // ========================================

        currentY += 40;

        if (currentY > doc.page.height - 250) {
        doc.addPage();
        currentY = 80;
        }

        doc.fontSize(20)
        .fillColor(colors.text)
        .font("Helvetica-Bold")
        .text("Stock Actual de Productos", 50, currentY);

        doc.rect(50, currentY + 28, doc.page.width - 100, 3).fill(colors.purple);

        currentY += 45;

        doc.rect(50, currentY, doc.page.width - 100, 35).fill(colors.purple);

        doc.fontSize(11)
        .fillColor(colors.white)
        .font("Helvetica-Bold")
        .text("ID", 65, currentY + 11)
        .text("PRODUCTO", 120, currentY + 11)
        .text("STOCK DISPONIBLE", doc.page.width - 180, currentY + 11);

        currentY += 35;
        alternate = false;

        stocks.forEach((item, index) => {
            if (currentY > doc.page.height - 100) {
                doc.addPage();
                currentY = 80;
                alternate = false;
            }

            const rowHeight = 28;
            
            if (alternate) {
                doc.rect(50, currentY, doc.page.width - 100, rowHeight).fill(colors.background);
            }

            doc.fontSize(10)
                .fillColor(colors.text)
                .font("Helvetica")
                .text(`#${item.id_producto}`, 65, currentY + 8)
                .text(item.nombre, 120, currentY + 8, { width: 100, ellipsis: true })
                .fillColor(colors.purple)
                .font("Helvetica-Bold")
                .text(`${item.stock} unidades`, doc.page.width - 180, currentY + 8);

            currentY += rowHeight;
            alternate = !alternate;
        });


        // ========================================
        // 🔖 PIE DE PÁGINA EN TODAS LAS PÁGINAS
        // ========================================

        const range = doc.bufferedPageRange();
        for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);

        const footerY = doc.page.height - 60;

        doc.rect(50, footerY - 10, doc.page.width - 100, 1).fill(colors.textLight);

        doc.fontSize(8)
            .fillColor(colors.textLight)
            .font("Helvetica")
            .text("Sistema de Gestión de Producción © 2025", 50, footerY, { align: "left" })
            .text(`Página ${i + 1} de ${range.count}`, doc.page.width / 2 - 50, footerY, { 
            align: "center",
            width: 100 
            })
            .text("Confidencial", doc.page.width - 150, footerY, { 
            align: "right",
            width: 100 
            });
        }

        doc.end();

        stream.on("finish", () => resolve(nombreArchivo));
        stream.on("error", reject);
    });
}

export default generarPdfReporte;