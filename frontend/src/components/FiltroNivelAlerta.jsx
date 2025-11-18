
export default function FiltrosAlertas({ filtro, setFiltro }) {
    const botones = [
        { key: "all", label: "Todas", color: "bg-gray-200 text-gray-700", ring: "ring-gray-400" },
        { key: "warning", label: "Warning", color: "bg-amber-200 text-amber-700", ring: "ring-amber-400" },
        { key: "danger", label: "Danger", color: "bg-red-200 text-red-700", ring: "ring-red-400" },
        { key: "expired", label: "Expired", color: "bg-purple-200 text-purple-700", ring: "ring-purple-400" },
        // { key: "success", label: "Success", color: "bg-green-200 text-green-700", ring: "ring-green-400" },
    ];

    return (
        <div className="flex flex-wrap justify-center gap-3 mb-3">
            {botones.map(btn => (
                <button
                    key={btn.key}
                    onClick={() => setFiltro(btn.key)}
                    className={`
                        px-3 py-1 rounded-lg font-semibold transition border
                        ${btn.color}
                        ${btn.border}
                        ${filtro === btn.key ? `ring-2 ${btn.ring}` : ""}
                    `}
                >
                    {btn.label}
                </button>
            ))}
        </div>
    );
}
