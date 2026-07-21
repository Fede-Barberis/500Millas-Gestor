import { useState, useMemo } from "react";
import { Plus, FileText } from "lucide-react";
import { jsPDF } from "jspdf";
import { useVentaData } from "../hooks/useVentaData.js";
import { generarRemito } from "../api/ventaApi.js";
import VentaTable from "../components/VentaTabla.jsx";
import VentaForm from "../components/VentaForm.jsx";
import RemitoModal from "../components/RemitoModal.jsx";
import { Loading, ErrorMessage } from "../components/Loading.jsx";
import { toast } from "sonner";

export default function Ventas() {
    const { ventas, productos, loading, error, reload: fetchData, modificarVenta, deleteVenta, toggleEstadoPago } = useVentaData();
    
    const [modalOpen, setModalOpen] = useState(false);
    const [ventaAEditar, setVentaAEditar] = useState(null);
    const [remitoModalOpen, setRemitoModalOpen] = useState(false);
    const [remitoVentaId, setRemitoVentaId] = useState("");
    const [remitoLoading, setRemitoLoading] = useState(false);
    const [remitoError, setRemitoError] = useState("");

    const abrirModalCrear = () => {
        setVentaAEditar(null); // Limpiar datos de edición
        setModalOpen(true);
    };

    const abrirModalEditar = (venta) => {
        setVentaAEditar(venta); // Guardar producción a editar
        setModalOpen(true);
    };

    const cerrarModal = () => {
        setModalOpen(false);
        setVentaAEditar(null); // Limpiar al cerrar
    };

    const abrirModalRemito = () => {
        setRemitoVentaId("");
        setRemitoError("");
        setRemitoModalOpen(true);
    };

    const cerrarModalRemito = () => {
        setRemitoModalOpen(false);
        setRemitoVentaId("");
        setRemitoError("");
        setRemitoLoading(false);
    };

    const generarRemitoEnPestana = async () => {
        const id = Number(remitoVentaId);
        if (!remitoVentaId || Number.isNaN(id) || id <= 0) {
            setRemitoError("ID de venta inválido. Ingrese un número mayor que cero.");
            return;
        }

        setRemitoLoading(true);
        setRemitoError("");

        try {
            const resp = await generarRemito(id);
            if (!resp.ok) {
                setRemitoError(resp.error);
                return;
            }

            abrirRemitoEnNuevaPestana(resp.remito);
            setRemitoModalOpen(false);
            toast.success("Remito generado", {
                description: "Se abrió una vista de impresión para el remito"
            });
        } catch (error) {
            setRemitoError(error.message || "No se pudo generar el remito");
        } finally {
            setRemitoLoading(false);
        }
    };

    const abrirRemitoEnNuevaPestana = (remito) => {
        const doc = new jsPDF({ unit: "pt", format: "a4" });
        const margin = 40;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const contentWidth = pageWidth - margin * 2;
        let y = margin;

        const formatCurrency = (value) => {
            const numericValue = Number(value);
            if (!Number.isFinite(numericValue)) return "$0.00";
            return new Intl.NumberFormat("es-AR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(numericValue);
        };

        const addPageAndHeader = () => {
            doc.addPage();
            y = margin;
            renderTableHeader();
        };

        const tableCols = [50, 260, 95, 90];
        const tableX = margin;
        const colX = [tableX, tableX + tableCols[0], tableX + tableCols[0] + tableCols[1], tableX + tableCols[0] + tableCols[1] + tableCols[2]];

        const renderTableHeader = () => {
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.setFillColor(250, 250, 250);
            doc.rect(margin, y, contentWidth, 22, "F");
            doc.setDrawColor(200);
            doc.line(margin, y, margin + contentWidth, y);
            doc.line(margin, y + 22, margin + contentWidth, y + 22);

            doc.text("Cantidad", colX[0] + 4, y + 15);
            doc.text("Producto", colX[1] + 4, y + 15);
            doc.text("Precio Unitario", colX[2] + tableCols[2] - 4, y + 15, { align: "right" });
            doc.text("Importe", colX[3] + tableCols[3] - 4, y + 15, { align: "right" });

            y += 28;
        };

        const maxY = pageHeight - margin - 140;
        const productos = Array.isArray(remito.productos) ? remito.productos : [];

        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.text("Alfajores 500 Millas", margin, y);
        doc.setFontSize(16);
        doc.text("REMITO", margin, y + 26);
        y += 48;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`ID del remito: ${remito.numeroRemito}`, margin, y);
        doc.text(`Fecha de emisión: ${remito.fechaEmision}`, margin + 330, y);
        y += 18;
        doc.setLineWidth(0.8);
        doc.line(margin, y, pageWidth - margin, y);
        y += 18;

        doc.setFillColor(245, 245, 245);
        doc.rect(margin, y, contentWidth, 72, "F");
        doc.setDrawColor(200);
        doc.rect(margin, y, contentWidth, 72);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text("DATOS DEL CLIENTE", margin + 10, y + 18);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(`Cliente: ${remito.receptor.nombre}`, margin + 10, y + 36);
        doc.text(`Fecha de emisión: ${remito.fechaEmision}`, margin + 10, y + 52);
        doc.text(`Número de remito: ${remito.numeroRemito}`, margin + 330, y + 36);
        y += 88;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("Detalle de productos", margin, y);
        y += 18;

        renderTableHeader();

        productos.forEach((item, index) => {
            if (y + 20 > maxY) {
                addPageAndHeader();
            }

            const cantidad = String(item.cantidad ?? "");
            const nombre = String(item.nombre ?? "Sin nombre");
            const precioUnitario = `$ ${formatCurrency(item.precioUnitario)}`;
            const importe = `$ ${formatCurrency(item.subtotal)}`;

            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.text(cantidad, colX[0] + 4, y + 12);
            doc.text(nombre, colX[1] + 4, y + 12, { maxWidth: tableCols[1] - 8 });
            doc.text(precioUnitario, colX[2] + tableCols[2] - 4, y + 12, { align: "right" });
            doc.text(importe, colX[3] + tableCols[3] - 4, y + 12, { align: "right" });

            doc.setDrawColor(220);
            doc.setLineWidth(0.4);
            doc.line(tableX, y + 20, tableX + contentWidth, y + 20);
            y += 22;
        });

        if (productos.length === 0) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.text("No hay productos registrados para este remito.", margin + 4, y + 12);
            y += 22;
        }

        y += 12;
        if (y + 70 > maxY) {
            addPageAndHeader();
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setFillColor(245, 245, 245);
        doc.rect(margin, y, contentWidth, 36, "F");
        doc.setDrawColor(200);
        doc.rect(margin, y, contentWidth, 36);
        doc.text("Total General:", margin + 10, y + 24);
        doc.text(`$ ${formatCurrency(remito.total)}`, margin + contentWidth - 10, y + 24, { align: "right" });
        y += 56;

        if (y + 120 > pageHeight - margin) {
            doc.addPage();
            y = margin;
        }

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text("Firma del receptor:", margin, y);
        doc.text("Aclaración:", margin, y + 60);
        doc.text("Firma del responsable de entrega:", margin, y + 120);

        doc.setLineWidth(0.8);
        doc.line(margin, y + 16, margin + 250, y + 16);
        doc.line(margin, y + 76, margin + 250, y + 76);
        doc.line(margin, y + 136, margin + 250, y + 136);

        doc.line(margin, y + 76, margin + 250, y + 76);
        doc.line(margin, y + 136, margin + 250, y + 136);

        const pdfBlob = doc.output("blob");
        const blobUrl = URL.createObjectURL(pdfBlob);

        const link = document.createElement("a");
        link.href = blobUrl;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <Loading />;
    if (error) return <ErrorMessage error={error} />;

    return (
        <div className="px-6 py-2 space-y-6">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-5">
                <div>
                    <h2 className="text-center sm:text-left font-heading text-4xl font-semibold text-gray-800">
                        Ventas
                    </h2>
                    <p className="text-center sm:text-left text-gray-500 mt-1">
                        Gestiona el registro de ventas
                    </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={() => setModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-heading font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                        <Plus className="w-5 h-5" />
                        Nueva Venta
                    </button>
                        <button
                        onClick={abrirModalRemito}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-heading font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                        <FileText className="w-5 h-5" />
                        Generar Remito
                    </button>
                </div>
            </div>
            
            <VentaTable
                ventas={ventas} 
                productos={productos}
                eliminarVenta={deleteVenta}
                editarVenta={abrirModalEditar}
                toggleEstadoPago={toggleEstadoPago}
            />

            <div className='space-y-0'>
                {modalOpen && (
                    <VentaForm
                        productos={productos}
                        initialData={ventaAEditar} 
                        isEditing={!!ventaAEditar} 
                        onCreated={() => {
                            fetchData();
                            setModalOpen(false);
                        }}
                        onClose={cerrarModal}
                        onSubmitVenta={modificarVenta}
                    />
                )}
                <RemitoModal
                    open={remitoModalOpen}
                    onClose={cerrarModalRemito}
                    idValue={remitoVentaId}
                    onIdChange={setRemitoVentaId}
                    loading={remitoLoading}
                    error={remitoError}
                    onGenerate={generarRemitoEnPestana}
                />
            </div>
        </div>
    )
}