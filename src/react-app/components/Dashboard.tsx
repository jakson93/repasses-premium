import { useEffect, useState } from "react";
import { apiGet } from "@/react-app/utils/api";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  AlertTriangle,
  DollarSign,
  BarChart3,
  PieChart,
  Activity,
  Car,
  Clock,
} from "lucide-react";

interface DashboardStats {
  totalMotos: number;
  motosDisponiveis: number;
  motosVendidas: number;
  motosReservadas: number;
  totalEntradas: number;
  totalSaidas: number;
  saldo: number;
  motosFinanciadas: number;
  motosAtrasadas: number;
  clientesAtivos: number;
  vendasMes: number;
  lucroMes: number;
}

interface MonthlyData {
  month: string;
  vendas: number;
  entradas: number;
  saidas: number;
  lucro: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalMotos: 0,
    motosDisponiveis: 0,
    motosVendidas: 0,
    motosReservadas: 0,
    totalEntradas: 0,
    totalSaidas: 0,
    saldo: 0,
    motosFinanciadas: 0,
    motosAtrasadas: 0,
    clientesAtivos: 0,
    vendasMes: 0,
    lucroMes: 0,
  });

  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const data = await apiGet<{ stats: DashboardStats, monthlyData: MonthlyData[] }>("/api/dashboard/stats");
      setStats(data.stats);
      setMonthlyData(data.monthlyData);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const formatPercentage = (value: number, total: number) => {
    if (total === 0) return "0%";
    return `${((value / total) * 100).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="speed-loading rounded-full h-12 w-12"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Motos */}
        <div className="premium-card p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Total de Motos</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.totalMotos}</p>
              <p className="text-green-400 text-sm mt-1">
                {stats.motosDisponiveis} disponíveis
              </p>
            </div>
            <div className="bg-blue-500/20 p-4 rounded-xl">
              <Car className="w-8 h-8 text-blue-400" />
            </div>
          </div>
        </div>

        {/* Vendas do Mês */}
        <div className="premium-card p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Vendas do Mês</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.vendasMes}</p>
              <p className="text-yellow-400 text-sm mt-1">
                {formatPercentage(stats.motosVendidas, stats.totalMotos)} do estoque
              </p>
            </div>
            <div className="bg-green-500/20 p-4 rounded-xl">
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </div>

        {/* Saldo Atual */}
        <div className="premium-card p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Saldo Atual</p>
              <p className={`text-3xl font-bold mt-1 ${
                stats.saldo >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {formatPrice(stats.saldo)}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Lucro: {formatPrice(stats.lucroMes)}
              </p>
            </div>
            <div className="bg-yellow-500/20 p-4 rounded-xl">
              <DollarSign className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Motos Financiadas */}
        <div className="premium-card p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Financiadas</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.motosFinanciadas}</p>
              <p className={`text-sm mt-1 ${
                stats.motosAtrasadas > 0 ? 'text-red-400' : 'text-green-400'
              }`}>
                {stats.motosAtrasadas} atrasadas
              </p>
            </div>
            <div className="bg-purple-500/20 p-4 rounded-xl">
              <Clock className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status das Motos */}
        <div className="premium-card p-6 rounded-xl">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
            <PieChart className="w-6 h-6 text-yellow-400" />
            <span>Status das Motos</span>
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-green-400 rounded-full"></div>
                <span className="text-gray-300">Disponíveis</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-white font-semibold">{stats.motosDisponiveis}</span>
                <span className="text-gray-400 text-sm">
                  {formatPercentage(stats.motosDisponiveis, stats.totalMotos)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                <span className="text-gray-300">Reservadas</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-white font-semibold">{stats.motosReservadas}</span>
                <span className="text-gray-400 text-sm">
                  {formatPercentage(stats.motosReservadas, stats.totalMotos)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-blue-400 rounded-full"></div>
                <span className="text-gray-300">Vendidas</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-white font-semibold">{stats.motosVendidas}</span>
                <span className="text-gray-400 text-sm">
                  {formatPercentage(stats.motosVendidas, stats.totalMotos)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-purple-400 rounded-full"></div>
                <span className="text-gray-300">Financiadas</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-white font-semibold">{stats.motosFinanciadas}</span>
                <span className="text-gray-400 text-sm">
                  {formatPercentage(stats.motosFinanciadas, stats.totalMotos)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Fluxo de Caixa */}
        <div className="premium-card p-6 rounded-xl">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-yellow-400" />
            <span>Fluxo de Caixa</span>
          </h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-green-500/20 p-2 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-gray-300">Total Entradas</p>
                  <p className="text-green-400 font-semibold">
                    {formatPrice(stats.totalEntradas)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-red-500/20 p-2 rounded-lg">
                  <TrendingDown className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-gray-300">Total Saídas</p>
                  <p className="text-red-400 font-semibold">
                    {formatPrice(stats.totalSaidas)}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-700 pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    stats.saldo >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'
                  }`}>
                    <Activity className={`w-5 h-5 ${
                      stats.saldo >= 0 ? 'text-green-400' : 'text-red-400'
                    }`} />
                  </div>
                  <div>
                    <p className="text-gray-300">Saldo Total</p>
                    <p className={`font-bold text-lg ${
                      stats.saldo >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {formatPrice(stats.saldo)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas e Notificações */}
      {stats.motosAtrasadas > 0 && (
        <div className="premium-card p-6 rounded-xl border-l-4 border-red-500">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <div>
              <h4 className="text-lg font-semibold text-red-400">Atenção Necessária</h4>
              <p className="text-gray-300">
                Você tem {stats.motosAtrasadas} moto(s) com financiamento em atraso.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Evolução Mensal */}
      {monthlyData.length > 0 && (
        <div className="premium-card p-6 rounded-xl">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
            <Calendar className="w-6 h-6 text-yellow-400" />
            <span>Evolução dos Últimos 6 Meses</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {monthlyData.map((month, index) => (
              <div key={index} className="text-center">
                <p className="text-gray-400 text-sm mb-2">{month.month}</p>
                <div className="space-y-2">
                  <div className="bg-green-500/20 p-2 rounded">
                    <p className="text-green-400 text-xs">Vendas</p>
                    <p className="text-white font-semibold">{month.vendas}</p>
                  </div>
                  <div className="bg-yellow-500/20 p-2 rounded">
                    <p className="text-yellow-400 text-xs">Lucro</p>
                    <p className="text-white font-semibold text-sm">
                      {formatPrice(month.lucro)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
