import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/react-app/contexts/AuthContext";
import {
	  Car,
	  Shield,
	} from "lucide-react";
	import Header from "@/react-app/components/Header";
	import Footer from "@/react-app/components/Footer";
	import AdvancedMotorcycleManagement from "@/react-app/components/AdvancedMotorcycleManagement";

export default function Admin() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
	  const [activeTab] = useState<'motos'>('motos');

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



  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <Header />

      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 speed-text">
                Gestão de Motos
              </h1>
              <p className="text-xl text-gray-400">
                Sistema Administrativo
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-400">
                <Shield className="w-5 h-5" />
                <span className="text-sm">Admin: {user.email}</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs (Removido) */}

	          {/* Content Area */}
	          <div className="min-h-[600px]">
	            <AdvancedMotorcycleManagement />
	          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
