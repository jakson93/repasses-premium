import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/react-app/contexts/AuthContext";
import {
  LayoutDashboard,
  Car,
  Users,
  DollarSign,
  Settings,
  Shield,
  UserPlus,
} from "lucide-react";
import Header from "@/react-app/components/Header";
import Footer from "@/react-app/components/Footer";
import Dashboard from "@/react-app/components/Dashboard";
import AdvancedMotorcycleManagement from "@/react-app/components/AdvancedMotorcycleManagement";
import ClientManagement from "@/react-app/components/ClientManagement";
import UserManagement from "@/react-app/components/UserManagement";
import FinancialManagement from "@/react-app/components/FinancialManagement";

export default function Admin() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'motos' | 'clientes' | 'financeiro' | 'usuarios' | 'configuracoes'>('dashboard');

  useEffect(() => {
    if (!isPending && !user) {
      navigate("/");
    }
  }, [user, isPending, navigate]);

  if (isPending || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="speed-loading rounded-full h-12 w-12"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'motos', name: 'Gestão de Motos', icon: Car },
    { id: 'clientes', name: 'Clientes', icon: Users },
    { id: 'financeiro', name: 'Financeiro', icon: DollarSign },
    { id: 'usuarios', name: 'Usuários', icon: UserPlus },
    { id: 'configuracoes', name: 'Configurações', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <Header />

      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 speed-text">
                Repasses Premium
              </h1>
              <p className="text-xl text-gray-400">
                Sistema Administrativo Completo
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-400">
                <Shield className="w-5 h-5" />
                <span className="text-sm">Admin: {user.email}</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 mb-8 bg-gray-800/50 p-2 rounded-xl backdrop-blur-sm border border-gray-700">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-yellow-500 text-black speed-glow'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden sm:inline">{tab.name}</span>
                </button>
              );
            })}
          </div>

          {/* Content Area */}
          <div className="min-h-[600px]">
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'motos' && <AdvancedMotorcycleManagement />}
            {activeTab === 'clientes' && <ClientManagement />}
            {activeTab === 'financeiro' && <FinancialManagement />}
            {activeTab === 'usuarios' && <UserManagement />}
            {activeTab === 'configuracoes' && (
              <div className="premium-card p-8 rounded-xl text-center">
                <Settings className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Configurações</h3>
                <p className="text-gray-400">
                  Módulo de configurações será implementado em breve.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
