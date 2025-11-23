import { Link } from "react-router";
import { Calendar, Gauge, Clock, Zap, Star } from "lucide-react";
import type { Motorcycle } from "@/shared/types";

interface MotorcycleCardProps {
  motorcycle: Motorcycle;
}

export default function MotorcycleCard({ motorcycle }: MotorcycleCardProps) {
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

  return (
    <Link
      to={`/motorcycles/${motorcycle.id}`}
      className="group premium-card rounded-xl overflow-hidden border border-gray-700 hover:border-yellow-500/60 transition-all duration-500 hover:shadow-xl hover:shadow-yellow-500/20 hover:-translate-y-2 motorcycle-hover"
    >
      <div className="relative aspect-video overflow-hidden bg-black">
        {motorcycle.thumbnail_url ? (
          <img
            src={motorcycle.thumbnail_url}
            alt={`${motorcycle.brand} ${motorcycle.model}`}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center speed-lines">
            <Gauge className="w-16 h-16 text-gray-700" />
          </div>
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {motorcycle.is_featured === 1 && (
          <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-yellow-500 text-black text-xs font-bold shadow-lg speed-glow flex items-center space-x-1">
            <Star className="w-3 h-3" />
            <span>DESTAQUE</span>
          </div>
        )}
        
        {motorcycle.is_financed === 1 && (
          <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-blue-500 text-white text-xs font-bold shadow-lg flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>FINANCIADO</span>
          </div>
        )}

        {/* Speed effect overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-1 speed-lines opacity-30"></div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-yellow-400 transition-colors duration-300">
          {motorcycle.brand} {motorcycle.model}
        </h3>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center space-x-2 text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">{motorcycle.year || "N/A"}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">
              {motorcycle.displacement ? `${motorcycle.displacement}cc` : "N/A"}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-gray-400 group-hover:text-gray-300 transition-colors duration-300 col-span-2">
            <Gauge className="w-4 h-4" />
            <span className="text-sm font-medium">{formatMileage(motorcycle.mileage)}</span>
          </div>
        </div>

        {motorcycle.is_financed === 1 && motorcycle.finance_days_remaining && (
          <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm">
            <div className="flex items-center space-x-2 text-blue-400 text-sm font-medium">
              <Clock className="w-4 h-4" />
              <span>{motorcycle.finance_days_remaining} dias restantes</span>
            </div>
            {motorcycle.is_overdue === 1 && (
              <div className="mt-1 text-xs text-red-400 font-semibold">⚠️ Atrasado</div>
            )}
            {motorcycle.is_worth_financing === 1 && (
              <div className="mt-1 text-xs text-green-400 font-semibold">✓ Compensa manter financiamento</div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-700">
          <span className="text-2xl font-bold speed-text">
            {formatPrice(motorcycle.price)}
          </span>
          <div className="flex items-center space-x-2 text-yellow-400 group-hover:translate-x-2 transition-transform duration-300">
            <span className="font-semibold">Ver mais</span>
            <Zap className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}
