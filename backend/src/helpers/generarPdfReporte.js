import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

const MESES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

function money(value) {
    return Number(value || 0).toLocaleString("es-AR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function qty(value) {
    return Number(value || 0).toLocaleString("es-AR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
}

function ensureSpace(doc, y, needed) {
    if (y + needed > doc.page.height - 40) {
        doc.addPage();
        return 40;
    }
    return y;
}

function drawHeader(doc, mes, anio) {
    doc.rect(35, 30, doc.page.width - 70, 36).fill("#7C2D12");
    doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(14)
        .text("Planilla de Resultados Mensuales", 45, 43);
    doc.fillColor("#374151").font("Helvetica").fontSize(10)
        .text(`Mes: ${MESES[mes - 1]} ${anio}`, 40, 75)
        .text(`Generado: ${new Date().toLocaleString("es-AR")}`, 40, 89);
}

function drawTableHeader(doc, y, columns, color) {
    const x = 40;
    const totalWidth = columns.reduce((sum, c) => sum + c.width, 0);
    let cursorX = x;

    doc.rect(x, y, totalWidth, 24).fill(color);
    doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(8);

    columns.forEach((col) => {
        doc.text(col.label, cursorX + 5, y + 8, {
            width: col.width - 10,
            align: col.align || "left"
        });
        cursorX += col.width;
    });

    return y + 24;
}

function drawTableRow(doc, y, columns, row, striped) {
    const x = 40;
    const totalWidth = columns.reduce((sum, c) => sum + c.width, 0);
    let cursorX = x;

    doc.rect(x, y, totalWidth, 22).fill(striped ? "#FEF3C7" : "#FFFFFF");
    doc.fillColor("#111827").font("Helvetica").fontSize(8);

    columns.forEach((col) => {
        doc.text(String(row[col.key] ?? ""), cursorX + 5, y + 7, {
            width: col.width - 10,
            align: col.align || "left"
        });
        cursorX += col.width;
    });

    return y + 22;
}

function generarPdfReporte({
    mes,
    anio,
    resumenPorProducto,
    totalIngresos,
    totalEgresosInsumos,
    diferenciaMes,
    resumenMensualAcumulado = []
}) {
    return new Promise((resolve, reject) => {
        const carpeta = path.join(process.cwd(), "reportes");
        const nombreArchivo = `reporte_${mes}_${anio}.pdf`;
        const ruta = path.join(carpeta, nombreArchivo);

        if (!fs.existsSync(carpeta)) fs.mkdirSync(carpeta, { recursive: true });

        const doc = new PDFDocument({ margin: 35, size: "A4" });
        const stream = fs.createWriteStream(ruta);
        doc.pipe(stream);

        drawHeader(doc, mes, anio);
        let y = 114;

        doc.fillColor("#111827").font("Helvetica-Bold").fontSize(11)
            .text("1) Produccion, ventas e ingresos por producto", 40, y);
        y += 16;

        const colsFinanzas = [
            { key: "producto", label: "Producto", width: 170, align: "left" },
            { key: "cantidadProducida", label: "Prod.", width: 75, align: "right" },
            { key: "cantidadVendida", label: "Vta.", width: 75, align: "right" },
            { key: "cantidadTapas", label: "Tapas", width: 75, align: "right" },
            { key: "ingresos", label: "Ingresos ($)", width: 125, align: "right" }
        ];

        y = drawTableHeader(doc, y, colsFinanzas, "#991B1B");
        resumenPorProducto.forEach((item, idx) => {
            y = ensureSpace(doc, y, 24);
            y = drawTableRow(doc, y, colsFinanzas, {
                producto: item.producto,
                cantidadProducida: qty(item.cantidadProducida),
                cantidadVendida: qty(item.cantidadVendida),
                cantidadTapas: qty(item.cantidadTapas),
                ingresos: money(item.ingresos)
            }, idx % 2 === 0);
        });

        y = ensureSpace(doc, y, 94);
        y += 8;
        const summaryW = doc.page.width - 80;
        doc.rect(40, y, summaryW, 62).fill("#ECFCCB");
        doc.fillColor("#14532D").font("Helvetica-Bold").fontSize(10)
            .text(`Ingreso total productos: $${money(totalIngresos)}`, 50, y + 10)
            .text(`Gasto total insumos: $${money(totalEgresosInsumos)}`, 50, y + 28)
            .text(`Diferencia (ganado - gastado): $${money(diferenciaMes)}`, 50, y + 46);
        y += 76;

        y = ensureSpace(doc, y, 180);
        doc.fillColor("#111827").font("Helvetica-Bold").fontSize(11)
            .text("2) Acumulado mensual en unidades (docenas x 12)", 40, y);
        y += 16;

        const colsAcumulado = [
            { key: "mes", label: "Mes", width: 45, align: "left" },
            { key: "docenasAlfajoresMes", label: "Alf Doc", width: 58, align: "right" },
            { key: "alfajoresUnidadesMes", label: "Alf x12", width: 58, align: "right" },
            { key: "docenasGalletasConSemillaMes", label: "GCS Doc", width: 58, align: "right" },
            { key: "galletasConSemillaUnidadesMes", label: "GCS x12", width: 58, align: "right" },
            { key: "docenasGalletasSinSemillaMes", label: "GSS Doc", width: 58, align: "right" },
            { key: "galletasSinSemillaUnidadesMes", label: "GSS x12", width: 58, align: "right" },
            { key: "tapasMes", label: "Tapas Mes", width: 70, align: "right" }
        ];

        y = drawTableHeader(doc, y, colsAcumulado, "#1D4ED8");
        resumenMensualAcumulado.forEach((item, idx) => {
            y = ensureSpace(doc, y, 24);
            y = drawTableRow(doc, y, colsAcumulado, {
                mes: (MESES[item.mes - 1] || item.mes).slice(0, 3).toLowerCase(),
                docenasAlfajoresMes: qty(item.docenasAlfajoresMes),
                alfajoresUnidadesMes: qty(item.alfajoresUnidadesMes),
                docenasGalletasConSemillaMes: qty(item.docenasGalletasConSemillaMes),
                galletasConSemillaUnidadesMes: qty(item.galletasConSemillaUnidadesMes),
                docenasGalletasSinSemillaMes: qty(item.docenasGalletasSinSemillaMes),
                galletasSinSemillaUnidadesMes: qty(item.galletasSinSemillaUnidadesMes),
                tapasMes: qty(item.tapasMes)
            }, idx % 2 === 0);
        });

        const totalDocenasAlf = resumenMensualAcumulado.reduce(
            (sum, item) => sum + Number(item.docenasAlfajoresMes || 0),
            0
        );
        const totalUnidadesAlf = resumenMensualAcumulado.reduce(
            (sum, item) => sum + Number(item.alfajoresUnidadesMes || 0),
            0
        );
        const totalDocenasGcs = resumenMensualAcumulado.reduce(
            (sum, item) => sum + Number(item.docenasGalletasConSemillaMes || 0),
            0
        );
        const totalUnidadesGcs = resumenMensualAcumulado.reduce(
            (sum, item) => sum + Number(item.galletasConSemillaUnidadesMes || 0),
            0
        );
        const totalDocenasGss = resumenMensualAcumulado.reduce(
            (sum, item) => sum + Number(item.docenasGalletasSinSemillaMes || 0),
            0
        );
        const totalUnidadesGss = resumenMensualAcumulado.reduce(
            (sum, item) => sum + Number(item.galletasSinSemillaUnidadesMes || 0),
            0
        );
        const ultimo = resumenMensualAcumulado[resumenMensualAcumulado.length - 1] || {};

        y = ensureSpace(doc, y, 92);
        y += 8;
        const acumuladoW = doc.page.width - 80;
        doc.rect(40, y, acumuladoW, 66).fill("#DBEAFE");
        doc.fillColor("#1E3A8A").font("Helvetica-Bold").fontSize(9)
            .text(`Acumulado al ultimo mes - Alfajores: ${qty(totalDocenasAlf)} doc / ${qty(totalUnidadesAlf)} un`, 50, y + 10)
            .text(`Acumulado al ultimo mes - Galletas C/S: ${qty(totalDocenasGcs)} doc / ${qty(totalUnidadesGcs)} un`, 50, y + 26)
            .text(`Acumulado al ultimo mes - Galletas S/S: ${qty(totalDocenasGss)} doc / ${qty(totalUnidadesGss)} un`, 50, y + 42)
            .text(`Tapas acumuladas: ${qty(ultimo.tapasAcumulado || 0)}`, 390, y + 42);

        doc.end();
        stream.on("finish", () => resolve(nombreArchivo));
        stream.on("error", reject);
    });
}

export default generarPdfReporte;
