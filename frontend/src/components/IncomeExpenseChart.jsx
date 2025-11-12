import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function IncomeExpenseChart({ data }) {
    
    return (
        <div className="bg-white p-6 rounded-2xl shadow-xl">
            <h2 className="text-lg sm:text-2xl font-heading font-semibold text-center text-gray-800 mb-4">Ingresos vs Egresos</h2>
            <ResponsiveContainer width="100%" height={325}>
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="colorEgresos" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                        dataKey="mes" 
                        stroke="#6b7280"
                        style={{ fontSize: '14px' }}
                    />
                    <YAxis 
                        stroke="#6b7280"
                        style={{ fontSize: '14px' }}
                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: '#fff', 
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                        formatter={(value) => `$${value.toLocaleString('es-AR')}`}
                    />
                    <Legend 
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="circle"
                    />
                    <Area 
                        type="monotone" 
                        dataKey="ingresos" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorIngresos)" 
                        name="Ingresos"
                    />
                    <Area 
                        type="monotone" 
                        dataKey="egresos" 
                        stroke="#ef4444" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorEgresos)" 
                        name="Egresos"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
