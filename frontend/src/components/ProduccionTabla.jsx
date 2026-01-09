import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    createColumnHelper,
} from "@tanstack/react-table";
import { Calendar, Edit2, Filter, Package, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import ConfirmModal from "../components/ModalConfirmacion";

export default function ProduccionTable({ producciones, productos, eliminarProduccion, editarProduccion }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [idAEliminar, setIdAEliminar] = useState(null);

    const abrirModal = (id) => {
        setIdAEliminar(id);
        setModalOpen(true);
    };

    const confirmarEliminacion = async () => {
        await eliminarProduccion(idAEliminar);
        setModalOpen(false);
        setIdAEliminar(null);
    };
    
    
    const columnHelper = createColumnHelper();

    // Normalizar producción
    const rows = useMemo(() => {
        const lista = [];
        producciones.forEach(p => {
            p.DetalleProduccions?.forEach(d => {
                lista.push({
                    id_produccion: p.id_produccion,
                    fecha: p.fecha,
                    receta: String(p.Recetum?.cantidad ?? ""),
                    producto: d.Producto?.nombre,
                    cantidad: d.cantidad,
                    tapas: d.tapas,
                    lote: d.lote,
                    vencimiento: d.fch_vencimiento
                });
            });
        });
        return lista;
    }, [producciones]);

    // Filtros
    const [productoFiltro, setProductoFiltro] = useState("all");
    const [fechaDesde, setFechaDesde] = useState("");
    const [fechaHasta, setFechaHasta] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    const filteredData = useMemo(() => {
        return rows.filter(item => {
            // Filtro por producto
            if (productoFiltro !== "all" && item.producto !== productoFiltro)
                return false;

            // Filtro por búsqueda (receta, producto o lote)
            if (searchTerm && 
                !(item.receta ?? "").toLowerCase().includes(searchTerm.toLowerCase()) &&
                !(item.lote ?? "").toLowerCase().includes(searchTerm.toLowerCase()))
                return false;

            // Filtro por fecha desde
            if (fechaDesde && item.fecha < fechaDesde)
                return false;

            // Filtro por fecha hasta
            if (fechaHasta && item.fecha > fechaHasta)
                return false;

            return true;
        });
    }, [rows, productoFiltro, fechaDesde, fechaHasta, searchTerm]);

    // Columnas
    const columns = [
        columnHelper.accessor("id_produccion", {
            header: "ID",
            cell: info => (
                <div className="flex items-center gap-2">
                    <span className="font-medium">{info.getValue()}</span>
                </div>
            )
        }),
        columnHelper.accessor("fecha", {
            header: "Fecha Producción",
            cell: info => {
                const fechaStr = info.getValue();
                const [year, month, day] = fechaStr.split('-');
                const fecha = new Date(year, month - 1, day); // Crear fecha local

                return (
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{fecha.toLocaleDateString('es-ES')}</span>
                    </div>
                )
            }
        }),
        columnHelper.accessor("receta", {
            header: "Receta Base",
            cell: info => (
                <span className="text-gray-700">{info.getValue()}</span>
            )
        }),
        columnHelper.accessor("producto", {
            header: "Producto",
            cell: info => (
                <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-500" />
                    <span className="font-semibold text-gray-800">{info.getValue()}</span>
                </div>
            )
        }),
        columnHelper.accessor("cantidad", {
            header: "Cantidad",
            cell: info => {
                // Redondear o formatear sin decimales si es un número entero
                const cantidad = parseFloat(info.getValue());
                const cantidadFormateada = cantidad % 1 === 0 
                    ? cantidad.toFixed(0)  // Sin decimales si es entero
                    : cantidad.toFixed(2); // Con 2 decimales si tiene decimales
                
                return (
                    <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                        {cantidadFormateada}
                    </span>
                );
            }
        }),
        columnHelper.accessor("tapas", {
            header: "Tapas",
            cell: info => (
                <span className="font-mono text-sm bg-purple-200 px-2 py-1 rounded-lg">
                    {info.getValue()}
                </span>
            )
        }),
        columnHelper.accessor("lote", {
            header: "Lote",
            cell: info => (
                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {info.getValue()}
                </span>
            )
        }),
        columnHelper.accessor("vencimiento", {
            header: "Vencimiento",
            cell: info => {
                const fechaStr = info.getValue();
                const [year, month, day] = fechaStr.split('-');
                const fecha = new Date(year, month - 1, day); // Crear fecha local
                
                const hoy = new Date();
                hoy.setHours(0, 0, 0, 0);
                const diasRestantes = Math.ceil((fecha - hoy) / (1000 * 60 * 60 * 24));
                
                let colorClass = "bg-green-100 text-green-700";
                if (diasRestantes < 7) colorClass = "bg-red-100 text-red-700";
                else if (diasRestantes < 15) colorClass = "bg-yellow-100 text-yellow-700";

                return (
                    <span className={`inline-block ${colorClass} px-2 py-1 rounded text-xs font-semibold`}>
                        {fecha.toLocaleDateString('es-ES')}
                    </span>
                );
            }
        }),
        columnHelper.accessor("acciones", {
            header: "Acciones",
            cell: info => {
                const produccionCompleta = producciones.find(
                    p => p.id_produccion === info.row.original.id_produccion
                );

                return (
                    <div className="flex gap-2">
                        <button
                            onClick={() => editarProduccion(produccionCompleta)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => abrirModal(info.row.original.id_produccion)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                )
            }
        })
    ];

    const table = useReactTable({
        data: filteredData,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            
            {/* Header con título y búsqueda */}
            <div className="bg-gradient-to-r from-blue-800 to-blue-500 px-6 py-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Package className="w-6 h-6" />
                            Historial de Producción
                        </h2>
                        <p className="text-blue-100 text-sm mt-1">
                            {filteredData.length} {filteredData.length === 1 ? 'registro' : 'registros'} encontrados
                        </p>
                    </div>
                    
                    {/* Buscador */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por receta o lote..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 rounded-lg border-0 focus:ring-2 focus:ring-blue-300 w-full md:w-80"
                        />
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                    <Filter className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-semibold text-gray-700">Filtros</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Filtro por Producto */}
                    <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">
                            Producto
                        </label>
                        <select
                            className="font-heading border border-gray-300 p-2.5 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            value={productoFiltro}
                            onChange={e => setProductoFiltro(e.target.value)}
                        >
                            <option value="all">Todos los productos</option>
                            {productos.map(prod => (
                                <option key={prod.id_producto} value={prod.nombre}>
                                    {prod.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Filtro Fecha Desde */}
                    <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">
                            Fecha desde
                        </label>
                        <input
                            type="date"
                            className="font-heading border border-gray-300 p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            value={fechaDesde}
                            onChange={e => setFechaDesde(e.target.value)}
                        />
                    </div>

                    {/* Filtro Fecha Hasta */}
                    <div>
                        <label className="block mb-1.5 text-sm font-medium text-gray-700">
                            Fecha hasta
                        </label>
                        <input
                            type="date"
                            className="font-heading border border-gray-300 p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            value={fechaHasta}
                            onChange={e => setFechaHasta(e.target.value)}
                        />
                    </div>
                </div>

                {/* Botón limpiar filtros */}
                {(productoFiltro !== "all" || fechaDesde || fechaHasta || searchTerm) && (
                    <button
                        onClick={() => {
                            setProductoFiltro("all");
                            setFechaDesde("");
                            setFechaHasta("");
                            setSearchTerm("");
                        }}
                        className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                        Limpiar filtros
                    </button>
                )}
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id} className="bg-gray-100 border-b border-gray-200">
                                {headerGroup.headers.map(header => (
                                    <th 
                                        key={header.id} 
                                        className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                                    >
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                        {table.getRowModel().rows.length === 0 ? (
                            <tr>
                                <td className="px-6 py-12 text-center text-gray-500" colSpan={columns.length}>
                                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-lg font-medium">No hay producciones registradas</p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        Los registros aparecerán aquí una vez que agregues producciones
                                    </p>
                                </td>
                            </tr>
                        ) : (
                            table.getRowModel().rows.map((row, index) => (
                                <tr 
                                    key={row.id} 
                                    className={`hover:bg-blue-50 transition-colors ${
                                        index % 2 === 0 ? 'bg-white' : 'bg-gray-100 bg-opacity-50'
                                    }`}
                                >
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <ConfirmModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={confirmarEliminacion}
                title="Confirmar eliminación"
                message="¿Seguro que deseas eliminar esta producción? Esta acción devolverá el stock de materia prima y productos procesados."
            />

        </div>
    );
}