import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import {
  Calendar,
  Gauge,
  DollarSign,
  Palette,
  MessageCircle,
  Mail,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Header from "@/react-app/components/Header";
import Footer from "@/react-app/components/Footer";
import ImageCarousel from "@/react-app/components/ImageCarousel";
import type { Motorcycle } from "@/shared/types";

export default function MotorcycleDetail() {
  const { id } = useParams();
  const [motorcycle, setMotorcycle] = useState<Motorcycle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMotorcycle = async () => {
      try {
        const response = await fetch(`/api/motorcycles/${id}`);
        if (response.ok) {
          const data = await response.json();
          setMotorcycle(data);
        }
      } catch (error) {
        console.error("Failed to load motorcycle:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMotorcycle();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!motorcycle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Header />
        <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center py-20">
            <p className="text-slate-400 text-lg mb-4">Moto não encontrada</p>
            <Link
              to="/catalog"
              className="text-amber-400 hover:text-amber-300 transition-colors duration-200"
            >
              Voltar ao catálogo
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number | null) => {
    if (!price) return "Consultar";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const formatMileage = (mileage: number | null) => {
    if (!mileage) return "N/A";
    return `${mileage.toLocaleString("pt-BR")} km`;
  };

  const whatsappMessage = encodeURIComponent(
    `Olá! Gostaria de saber mais sobre a ${motorcycle.brand} ${motorcycle.model} - ${motorcycle.year}. Código: ${motorcycle.id}`
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Header />

      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Link
            to="/catalog"
            className="inline-flex items-center space-x-2 text-slate-400 hover:text-amber-400 transition-colors duration-200 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar ao catálogo</span>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Images */}
            <div className="lg:col-span-2">
              <ImageCarousel
                images={motorcycle.images}
                alt={`${motorcycle.brand} ${motorcycle.model}`}
              />
            </div>

            {/* Right Column - Details */}
            <div className="space-y-6">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
                <h1 className="text-3xl font-bold text-white mb-2">
                  {motorcycle.brand} {motorcycle.model}
                </h1>
                <div className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent mb-6">
                  {formatPrice(motorcycle.price)}
                </div>

                <div className="space-y-4">
                  <a
                    href={`https://wa.me/5593991334064?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-2 w-full px-6 py-3 rounded-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold shadow-lg shadow-green-500/30 transition-all duration-200"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>WhatsApp (93) 99133-4064</span>
                  </a>
                </div>
              </div>

              {/* Financing Info */}
              {motorcycle.is_financed === 1 && (
                <div className="bg-blue-500/10 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
                  <h3 className="text-lg font-bold text-blue-400 mb-4">
                    Informações de Financiamento
                  </h3>
                  <div className="space-y-3">
                    {motorcycle.finance_days_remaining && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Dias restantes:</span>
                        <span className="text-white font-semibold">
                          {motorcycle.finance_days_remaining}
                        </span>
                      </div>
                    )}
                    {motorcycle.finance_monthly_payment && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Parcela mensal:</span>
                        <span className="text-white font-semibold">
                          {formatPrice(
                            motorcycle.finance_monthly_payment
                          )}
                        </span>
                      </div>
                    )}
                    {motorcycle.finance_total_remaining && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Saldo devedor:</span>
                        <span className="text-white font-semibold">
                          {formatPrice(
                            motorcycle.finance_total_remaining
                          )}
                        </span>
                      </div>
                    )}
                    {motorcycle.is_overdue === 1 ? (
                      <div className="flex items-center space-x-2 text-red-400 pt-2 border-t border-blue-500/20">
                        <AlertCircle className="w-5 h-5" />
                        <span className="font-semibold">
                          Parcelas atrasadas
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-green-400 pt-2 border-t border-blue-500/20">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-semibold">Em dia</span>
                      </div>
                    )}

                    {motorcycle.is_worth_financing === 1 && (
                      <div className="mt-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                        <p className="text-sm text-green-400">
                          ✓ Compensa manter o financiamento
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Specifications */}
          <div className="mt-8 bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-6">Especificações</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex items-start space-x-3">
                <Calendar className="w-6 h-6 text-amber-500 mt-1" />
                <div>
                  <p className="text-slate-400 text-sm">Ano</p>
                  <p className="text-white font-semibold">
                    {motorcycle.year || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Gauge className="w-6 h-6 text-amber-500 mt-1" />
                <div>
                  <p className="text-slate-400 text-sm">Cilindrada</p>
                  <p className="text-white font-semibold">
                    {motorcycle.displacement
                      ? `${motorcycle.displacement}cc`
                      : "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <DollarSign className="w-6 h-6 text-amber-500 mt-1" />
                <div>
                  <p className="text-slate-400 text-sm">Quilometragem</p>
                  <p className="text-white font-semibold">
                    {formatMileage(motorcycle.mileage)}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Palette className="w-6 h-6 text-amber-500 mt-1" />
                <div>
                  <p className="text-slate-400 text-sm">Cor</p>
                  <p className="text-white font-semibold">
                    {motorcycle.color || "N/A"}
                  </p>
                </div>
              </div>

              {motorcycle.condition && (
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-amber-500 mt-1" />
                  <div>
                    <p className="text-slate-400 text-sm">Conservação</p>
                    <p className="text-white font-semibold">
                      {motorcycle.condition}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {motorcycle.description && (
            <div className="mt-8 bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-4">Descrição</h2>
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {motorcycle.description}
              </p>
            </div>
          )}

          {/* Features */}
          {motorcycle.features && (
            <div className="mt-8 bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-4">
                Opcionais e Recursos
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {motorcycle.features.split(",").map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 text-slate-300"
                  >
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>{feature.trim()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Methods - NOVO LAYOUT PREMIUM */}
          <div className="mt-8 bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-6">
              Formas de Pagamento
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-amber-500" />
                <p className="text-slate-300 text-lg font-medium">
                  Cartão de Crédito até 12x
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-amber-500" />
                <p className="text-slate-300 text-lg font-medium">
                  Financiamento
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-amber-500" />
                <p className="text-slate-300 text-lg font-medium">
                  Pagamento à Vista
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-amber-500" />
                <p className="text-slate-300 text-lg font-medium">
                  Aceitamos Troca
                </p>
              </div>
            </div>

            <p className="mt-6 text-slate-400 text-sm italic">
              ✔ Aceitamos vários tipos de negociação.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
