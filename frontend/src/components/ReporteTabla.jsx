
import {
    useReactTable,
    getCoreRowModel,
    flexRender
} from "@tanstack/react-table";
import { descargarReporte } from "../api/reporteApi";
import { createColumnHelper } from "@tanstack/react-table";
import { Calendar, CheckCircle, AlertCircle, FileText } from 'lucide-react';

function abrirPdf(id) {
    if (!id) {
        alert("ID de reporte inválido");
        return;
    }

    descargarReporte(id)
        .then(blob => {
            const url = window.URL.createObjectURL(blob);

            // abrir en nueva pestaña
            window.open(url, "_blank");

            // descargar
            const a = document.createElement("a");
            a.href = url;
            a.download = `reporte_${id}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();

            window.URL.revokeObjectURL(url);
        })
        .catch(err => {
            console.error("Error al abrir PDF:", err);
            alert("Error al abrir el PDF");
        });
}

const columnHelper = createColumnHelper();

const ReporteTabla = ({ data, loading  }) => {
    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const columns = [
        columnHelper.accessor("id_reporte", {
        header: "ID",
        cell: info => (
            <span className="text-sm font-medium text-gray-900">
            #{info.getValue()}
            </span>
        )
        }),

        columnHelper.accessor(row => ({ mes: row.mes, año: row.año }), {
        id: "periodo",
        header: "Período",
        cell: info => {
            const { mes, año } = info.getValue();
            return (
            <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-900">
                {meses[mes - 1]} {año}
                </span>
            </div>
            );
        }
        }),

        columnHelper.accessor("total_tapas", {
        header: "Total Tapas",
        cell: info => (
            <span className="text-sm text-gray-900 font-semibold">
            {info.getValue().toLocaleString()}
            </span>
        )
        }),

        columnHelper.accessor("total_producciones", {
        header: "Producciones",
        cell: info => (
            <span className="text-sm text-gray-900 font-semibold">
            {info.getValue()}
            </span>
        )
        }),

        columnHelper.accessor("fecha_generacion", {
        header: "Fecha Generación",
        cell: info => {
            const date = new Date(info.getValue());
            return (
            <span className="text-sm text-gray-600">
                {date.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
                })}
            </span>
            );
        }
        }),

        columnHelper.accessor("estado", {
        header: "Estado",
        cell: info => {
            const estado = info.getValue();
            return estado === 'GENERADO' ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3" />
                Generado
            </span>
            ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                <AlertCircle className="w-3 h-3" />
                Error
            </span>
            );
        }
        }),

        columnHelper.display({
            id: "acciones",
            header: "Archivo",
            cell: ({ row }) => {
                const reporte = row.original;

                if (reporte.estado !== "GENERADO") {
                    return (
                        <span className="text-xs text-gray-400 italic">
                            No disponible
                        </span>
                    );
                }

                return (
                    <button
                        onClick={() => abrirPdf(reporte.id_reporte)}
                        className="inline-flex items-center gap-2 px-4 py-2 
                                bg-indigo-600 hover:bg-indigo-700 
                                text-white rounded-lg text-sm font-medium"
                    >
                        Ver PDF
                    </button>
                );
            }
        })
    ];

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel()
    });

    if (loading) {
        return (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
        </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Historial de Reportes</h2>
            <p className="text-sm text-gray-600 mt-1">
            Listado completo de reportes mensuales generados
            </p>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full">
            <thead className="bg-gray-50">
                {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                    <th
                        key={header.id}
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                    >
                        {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                        )}
                    </th>
                    ))}
                </tr>
                ))}
            </thead>

            <tbody className="divide-y divide-gray-200">
                {table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                        {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                        )}
                    </td>
                    ))}
                </tr>
                ))}
            </tbody>
            </table>
        </div>

        {data.length === 0 && (
            <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">No hay reportes generados</p>
            <p className="text-gray-400 text-sm mt-2">
                Los reportes se generan automáticamente el último día de cada mes
            </p>
            </div>
        )}
        </div>
    );
};

export default ReporteTabla;