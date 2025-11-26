import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import Header from "@/react-app/components/Header";
import Footer from "@/react-app/components/Footer";
import MotorcycleCard from "@/react-app/components/MotorcycleCard";
import type { Motorcycle } from "@/shared/types";

export default function Home() {
  const [featuredMotorcycles, setFeaturedMotorcycles] = useState<Motorcycle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const response = await fetch("/api/motorcycles/featured");
        const data = await response.json();
        setFeaturedMotorcycles(data);
      } catch (error) {
        console.error("Failed to load featured motorcycles:", error);
      } finally {
        setLoading(false);
      }
    };
    loadFeatured();
  }, []);

  return (
    <div className="min-h-screen bg-black">
      <Header />

      {/* ================================= HERO =============================== */}
      <section className="relative h-[100vh] overflow-hidden hidden sm:block">

        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-no-repeat bg-[position:center_-70px]"
          style={{
            backgroundImage:
              "url('https://mocha-cdn.com/019a4ef9-460a-7ccc-8e69-fa98bfaa96f0/repasses-premium-hero.jpg')",
          }}
        ></div>

        {/* Light FX */}
        <div className="absolute inset-0 z-10">
          <div className="absolute top-16 left-10 w-72 h-72 bg-yellow-500 opacity-5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-16 right-10 w-96 h-96 bg-yellow-400 opacity-5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-30">
          <div className="w-6 h-10 border-2 border-yellow-400 rounded-full flex justify-center animate-bounce">
            <div className="w-1 h-3 bg-yellow-400 rounded-full mt-2"></div>
          </div>
        </div>

        {/* Bottom Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
      </section>

      {/* ================================= DESTAQUE =============================== */}
      {/* Colado ao final da imagem sem cortar */}
      <section className="relative -mt-4 pb-10 px-4 sm:px-6 lg:px-8 bg-black">
        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-6">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Motos em Destaque
            </h2>
            <p className="text-lg text-gray-400">
              Selecionadas especialmente para você
            </p>
          </div>

          {/* Cards (ESTILO DO CATÁLOGO APLICADO) */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent"></div>
            </div>
          ) : featuredMotorcycles.length > 0 ? (
            <>
              {/* 🔥 EXATAMENTE o mesmo grid do catálogo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {featuredMotorcycles.map((motorcycle, index) => (
                  <MotorcycleCard
                    key={motorcycle.id}
                    motorcycle={motorcycle}
                  />
                ))}
              </div>

              <div className="text-center pt-2 pb-10">
                <Link
                  to="/catalog"
                  className="inline-flex items-center space-x-2 px-8 py-3 rounded-xl premium-button text-black font-semibold shadow-lg shadow-yellow-500/30 transition-all duration-300"
                >
                  <span>Ver Todas as Motos</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400 text-lg">Novas motos chegando em breve</p>
            </div>
          )}

        </div>
      </section>

      <Footer />
    </div>
  );
}
