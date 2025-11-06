import StatsCards from "../components/StatsCards"
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
    
    return (
        <div className="p-6 space-y-6">
            {/* --- Estadísticas superiores --- */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCards />    
            </section>
        </div> 
    )
}
