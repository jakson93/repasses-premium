import { useEffect, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import Header from "@/react-app/components/Header";
import Footer from "@/react-app/components/Footer";
import MotorcycleCard from "@/react-app/components/MotorcycleCard";
import type { Motorcycle, MotorcycleFilters } from "@/shared/types";
export default function Catalog() {
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<MotorcycleFilters>({});
  const loadMotorcycles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.brand) params.append("brand", filters.brand);
      if (filters.model) params.append("model", filters.model);
      if (filters.minYear) params.append("minYear", filters.minYear.toString());
      if (filters.maxYear) params.append("maxYear", filters.maxYear.toString());
      if (filters.minPrice) params.append("minPrice", filters.minPrice.toString());
      if (filters.maxPrice) params.append("maxPrice", filters.maxPrice.toString());
      if (filters.minMileage) params.append("minMileage", filters.minMileage.toString());
      if (filters.maxMileage) params.append("maxMileage", filters.maxMileage.toString());
      if (filters.minDisplacement) params.append("minDisplacement", filters.minDisplacement.toString());
      if (filters.maxDisplacement) params.append("maxDisplacement", filters.maxDisplacement.toString());
      if (filters.condition) params.append("condition", filters.condition);
      if (filters.is_financed !== undefined) params.append("is_financed", filters.is_financed.toString());
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      const response = await fetch(`/api/motorcycles?${params.toString()}`);
      const data = await response.json();
      setMotorcycles(data);
    } catch (error) {
      console.error("Failed to load motorcycles:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadMotorcycles();
  }, [filters]);
  const clearFilters = () => {
    setFilters({});
  };
  const hasActiveFilters = Object.keys(filters).length > 0;
  return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />

      <div className="pt-32 pb-12 px-4 sm:px-8 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Catálogo de Motos</h1>
            <p className="text-xl text-slate-400">
              Encontre a moto ideal para você
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className="lg:w-80 flex-shrink-0">
              <div className="sticky top-24">
                <button onClick={() => setShowFilters(!showFilters)} className="lg:hidden w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold mb-4 transition-colors duration-200">
                  <SlidersHorizontal className="w-5 h-5" />
                  <span>Filtros</span>
                </button>

                <div className={`${showFilters ? "block" : "hidden"} lg:block bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700`}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">Filtros</h2>
                    {hasActiveFilters && <button onClick={clearFilters} className="text-sm text-amber-400 hover:text-amber-300 transition-colors duration-200">
                        Limpar
                      </button>}
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Marca
                      </label>
                      <input type="text" placeholder="Ex: Honda, Yamaha..." value={filters.brand || ""} onChange={e => setFilters({
                      ...filters,
                      brand: e.target.value || undefined
                    })} className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors duration-200" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Modelo
                      </label>
                      <input type="text" placeholder="Ex: CG 160, MT-03..." value={filters.model || ""} onChange={e => setFilters({
                      ...filters,
                      model: e.target.value || undefined
                    })} className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors duration-200" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Ano
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <input type="number" placeholder="De" value={filters.minYear || ""} onChange={e => setFilters({
                        ...filters,
                        minYear: e.target.value ? parseInt(e.target.value) : undefined
                      })} className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors duration-200" />
                        <input type="number" placeholder="Até" value={filters.maxYear || ""} onChange={e => setFilters({
                        ...filters,
                        maxYear: e.target.value ? parseInt(e.target.value) : undefined
                      })} className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors duration-200" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Preço (R$)
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <input type="number" placeholder="Mínimo" value={filters.minPrice || ""} onChange={e => setFilters({
                        ...filters,
                        minPrice: e.target.value ? parseFloat(e.target.value) : undefined
                      })} className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors duration-200" />
                        <input type="number" placeholder="Máximo" value={filters.maxPrice || ""} onChange={e => setFilters({
                        ...filters,
                        maxPrice: e.target.value ? parseFloat(e.target.value) : undefined
                      })} className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors duration-200" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Quilometragem
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <input type="number" placeholder="Mínimo" value={filters.minMileage || ""} onChange={e => setFilters({
                        ...filters,
                        minMileage: e.target.value ? parseInt(e.target.value) : undefined
                      })} className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors duration-200" />
                        <input type="number" placeholder="Máximo" value={filters.maxMileage || ""} onChange={e => setFilters({
                        ...filters,
                        maxMileage: e.target.value ? parseInt(e.target.value) : undefined
                      })} className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors duration-200" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Cilindrada (cc)
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <input type="number" placeholder="Mínimo" value={filters.minDisplacement || ""} onChange={e => setFilters({
                        ...filters,
                        minDisplacement: e.target.value ? parseInt(e.target.value) : undefined
                      })} className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors duration-200" />
                        <input type="number" placeholder="Máximo" value={filters.maxDisplacement || ""} onChange={e => setFilters({
                        ...filters,
                        maxDisplacement: e.target.value ? parseInt(e.target.value) : undefined
                      })} className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors duration-200" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Financiamento
                      </label>
                      <select value={filters.is_financed === undefined ? "" : filters.is_financed.toString()} onChange={e => setFilters({
                      ...filters,
                      is_financed: e.target.value === "" ? undefined : e.target.value === "true"
                    })} className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-500 transition-colors duration-200">
                        <option value="">Todos</option>
                        <option value="true">Financiadas</option>
                        <option value="false">Quitadas</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Ordenar por
                      </label>
                      <select value={filters.sortBy || "newest"} onChange={e => setFilters({
                      ...filters,
                      sortBy: e.target.value as any
                    })} className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-500 transition-colors duration-200">
                        <option value="newest">Mais recentes</option>
                        <option value="price_asc">Menor preço</option>
                        <option value="price_desc">Maior preço</option>
                        <option value="year_desc">Ano (mais novo)</option>
                        <option value="year_asc">Ano (mais antigo)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Motorcycles Grid */}
            <div className="flex-1">
              {loading ? <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
                </div> : motorcycles.length > 0 ? <>
                  <div className="mb-6 text-slate-400">
                    {motorcycles.length} {motorcycles.length === 1 ? "moto encontrada" : "motos encontradas"}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {motorcycles.map(motorcycle => <MotorcycleCard key={motorcycle.id} motorcycle={motorcycle} />)}
                  </div>
                </> : <div className="text-center py-20">
                  <Search className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-400 text-lg">
                    Nenhuma moto encontrada com os filtros aplicados
                  </p>
                  {hasActiveFilters && <button onClick={clearFilters} className="mt-4 text-amber-400 hover:text-amber-300 transition-colors duration-200">
                      Limpar filtros
                    </button>}
                </div>}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>;
}