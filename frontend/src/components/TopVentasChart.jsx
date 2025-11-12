import { useState } from "react";
import { PieChart, Pie, Label, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import FiltroFecha from "./FiltroFecha";

export default function TopVentasChart({ data, mes,anio, setMes, setAnio }) {
    const COLORS = ['#10b981', '#3b82f6', '#f59e0b'];
    // Calcular total general para mostrar en el centro del gráfico
    const total = data.reduce((acc, curr) => acc + curr.value, 0);
    const [activeIndex, setActiveIndex] = useState(null);

    const onPieEnter = (_, index) => setActiveIndex(index);
    const onPieLeave = () => setActiveIndex(null);

    return (
        <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center">
            <h2 className="text-lg sm:text-2xl font-heading font-semibold text-gray-800 mb-4">Productos Vendidos</h2>

            <FiltroFecha mes={mes} anio={anio} setMes={setMes} setAnio={setAnio}/>

            <div className="w-full h-[300px] flex justify-center items-center">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    {/* Detectamos si hay datos */}
                    {(() => {
                        const hasData = data && data.length > 0;
                        const chartData = hasData ? data : [{ name: "Sin datos", value: 1 }];
                        const total = hasData ? data.reduce((acc, curr) => acc + curr.value, 0) : 0;

                        return (
                        <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius="60%"
                            outerRadius="80%"
                            paddingAngle={3}
                            isAnimationActive={false}
                            onMouseEnter={onPieEnter}
                            onMouseLeave={onPieLeave}
                            labelLine={false}
                        >
                            {chartData.map((_, i) => (
                            <Cell
                                key={`cell-${i}`}
                                fill={hasData ? COLORS[i % COLORS.length] : "#e5e7eb"}
                                fillOpacity={activeIndex === i ? 1 : 0.7}
                                stroke={hasData && activeIndex === i ? "#374151" : "none"}
                                strokeWidth={hasData && activeIndex === i ? 2 : 0}
                                style={{
                                cursor: hasData ? "pointer" : "default",
                                transform: activeIndex === i ? "scale(1.05)" : "scale(1)",
                                transformOrigin: "center",
                                transition: "all 0.2s ease",
                                }}
                            />
                            ))}

                            {/* Etiqueta central */}
                            <Label
                            value={hasData ? `${total}` : "Sin datos"}
                            position="center"
                            fill="#374151"
                            style={{
                                fontSize: hasData ? "26px" : "18px",
                                fontWeight: "700",
                                fontFamily: "Outfit",
                            }}
                            />
                        </Pie>
                        );
                    })()}

                    {/* Mantiene leyenda y tooltip (solo si hay datos reales) */}
                    {data.length > 0 && (
                        <>
                        <Legend
                            verticalAlign="bottom"
                            align="center"
                            iconType="circle"
                            wrapperStyle={{
                            fontFamily: "Outfit",
                            fontSize: "16px",
                            maxWidth: "100%",
                            whiteSpace: "wrap",
                            textOverflow: "ellipsis",
                            overflow: "hidden",
                            }}
                        />
                        <Tooltip
                            formatter={(value) => [`${value} unidades`]}
                            contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                            }}
                        />
                        </>
                    )}
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
