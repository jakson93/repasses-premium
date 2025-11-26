import { useEffect, useState } from "react";
import { Link } from "react-router";
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
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <Header />

      {/* ================================= HERO DESKTOP =============================== */}
      <section className="relative h-[85vh] overflow-hidden hidden sm:block">

        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-no-repeat bg-[position:center_-70px]"
          style={{
            backgroundImage:
              "url('https://mocha-cdn.com/019a4ef9-460a-7ccc-8e69-fa98bfaa96f0/repasses-premium-hero.jpg')",
          }}
        ></div>

        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/90"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30"></div>

        {/* Light FX */}
        <div className="absolute inset-0 z-10">
          <div className="absolute top-16 left-10 w-72 h-72 bg-yellow-500 opacity-5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-16 right-10 w-96 h-96 bg-yellow-400 opacity-5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* HERO CONTENT */}
        <div className="relative z-20 flex flex-col items-center justify-start h-full text-center px-4 sm:px-6 lg:px-8 pt-72">
          <div className="max-w-5xl">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-yellow-400 mb-6 leading-tight">
              Encontre sua próxima moto
            </h1>
            <p className="text-xl sm:text-2xl text-gray-200 mb-12 leading-relaxed max-w-3xl mx-auto">
              Os melhores repasses selecionados com cuidado para você
            </p>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-30">
          <div className="w-6 h-10 border-2 border-yellow-400 rounded-full flex justify-center animate-bounce">
            <div className="w-1 h-3 bg-yellow-400 rounded-full mt-2"></div>
          </div>
        </div>

        {/* Bottom Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black via-black/80 to-transparent z-15"></div>
      </section>

      {/* ================================= DESTAQUE =============================== */}
      <section className="relative pt-8 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black via-gray-900/95 to-gray-900">
        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 speed-text mt-4 sm:mt-2">
              Motos em Destaque
            </h2>

            <p className="text-lg text-gray-400 mb-6">Selecionadas especialmente para você</p>
          </div>

          {/* Cards */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="speed-loading rounded-full h-12 w-12"></div>
            </div>
          ) : featuredMotorcycles.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {featuredMotorcycles.map((motorcycle, index) => (
                  <div
                    key={motorcycle.id}
                    className="speed-entry motorcycle-hover"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <MotorcycleCard motorcycle={motorcycle} />
                  </div>
                ))}
              </div>

              {/* Botão Ver Todas as Motos */}
              <div className="text-center mb-12">
                <Link
                  to="/catalog"
                  className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-4 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-yellow-400/50"
                >
                  <span>Ver Todas as Motos</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="text-center py-8 mb-8">
                <p className="text-gray-400 text-lg">Novas motos chegando em breve</p>
              </div>

              <div className="text-center mb-12">
                <Link
                  to="/catalog"
                  className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-4 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-yellow-400/50"
                >
                  <span>Ver Todas as Motos</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            </>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-black/60 backdrop-blur-md p-4 sm:p-6 rounded-xl border border-yellow-500/30 transition-all hover:border-yellow-500/60 hover:scale-105">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-yellow-400 mb-2">30+</div>
              <div className="text-gray-300 text-xs sm:text-sm md:text-base">Motos Disponíveis</div>
            </div>
            <div className="bg-black/60 backdrop-blur-md p-4 sm:p-6 rounded-xl border border-yellow-500/30 transition-all hover:border-yellow-500/60 hover:scale-105">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-yellow-400 mb-2">100%</div>
              <div className="text-gray-300 text-xs sm:text-sm md:text-base">Verificadas</div>
            </div>
            <div className="bg-black/60 backdrop-blur-md p-4 sm:p-6 rounded-xl border border-yellow-500/30 transition-all hover:border-yellow-500/60 hover:scale-105">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-yellow-400 mb-2">24h</div>
              <div className="text-gray-300 text-xs sm:text-sm md:text-base">Resposta Rápida</div>
            </div>
            <div className="bg-black/60 backdrop-blur-md p-4 sm:p-6 rounded-xl border border-yellow-500/30 transition-all hover:border-yellow-500/60 hover:scale-105">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-yellow-400 mb-2">5★</div>
              <div className="text-gray-300 text-xs sm:text-sm md:text-base">Avaliação</div>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}
