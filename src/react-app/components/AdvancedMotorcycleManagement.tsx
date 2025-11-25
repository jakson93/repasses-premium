import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Star,
  Upload,
  X,
  Save,
  Search,
  Tag,
  DollarSign,
  CheckCircle,
  Clock,
  AlertTriangle,
  Car,
} from "lucide-react";
import type { Motorcycle } from "@/shared/types";
import { apiGet, apiPost, apiPut, apiDelete, apiUpload } from "@/react-app/utils/api";

export default function AdvancedMotorcycleManagement() {
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [uploadingImages, setUploadingImages] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    color: "",
    mileage: 0,
    displacement: 0,
    price: 0,
    description: "",
    condition: "usado",
    payment_methods: "à vista",
    features: "",
    status: "disponivel",
    is_featured: false,
    is_financed: false,
    is_overdue: false,
    finance_days_remaining: 0,
    finance_monthly_payment: 0,
    finance_total_remaining: 0,
    is_worth_financing: false,
  });

  useEffect(() => {
    loadMotorcycles();
  }, [sortBy]);

  const loadMotorcycles = async () => {
    try {
      const data = await apiGet<Motorcycle[]>(`/api/motorcycles?sortBy=${sortBy}`);
      // Garantir que o campo images exista, mesmo que vazio
      const motorcyclesWithImages = data.map(m => ({
        ...m,
        images: m.images || [],
      }));
      setMotorcycles(motorcyclesWithImages);
    } catch (error) {
      console.error("Failed to load motorcycles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingId
        ? `/api/motorcycles/${editingId}`
        : "/api/motorcycles";

      await (editingId ? apiPut(url, formData) : apiPost(url, formData));

      await loadMotorcycles();
      resetForm();
    } catch (error) {
      console.error("Failed to save motorcycle:", error);
    }
  };

  const handleEdit = (motorcycle: Motorcycle) => {
    setEditingId(motorcycle.id);
    setFormData({
      brand: motorcycle.brand || "",
      model: motorcycle.model || "",
      year: motorcycle.year || new Date().getFullYear(),
      color: motorcycle.color || "",
      mileage: motorcycle.mileage || 0,
      displacement: motorcycle.displacement || 0,
      price: motorcycle.price || 0,
      description: motorcycle.description || "",
      condition: motorcycle.condition || "usado",
      payment_methods: motorcycle.payment_methods || "à vista",
      features: motorcycle.features || "",
      status: (motorcycle as any).status || "disponivel",
      is_featured: motorcycle.is_featured === 1,
      is_financed: motorcycle.is_financed === 1,
      is_overdue: motorcycle.is_overdue === 1,
      finance_days_remaining: motorcycle.finance_days_remaining || 0,
      finance_monthly_payment: motorcycle.finance_monthly_payment || 0,
      finance_total_remaining: motorcycle.finance_total_remaining || 0,
      is_worth_financing: motorcycle.is_worth_financing === 1,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta moto?")) return;

    try {
      await apiDelete(`/api/motorcycles/${id}`);
      await loadMotorcycles();
    } catch (error) {
      console.error("Failed to delete motorcycle:", error);
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };
      
      if (newStatus === "vendida") {
        updateData.sold_at = new Date().toISOString();
      }

      await apiPut(`/api/motorcycles/${id}`, updateData);
      await loadMotorcycles();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const toggleFeatured = async (motorcycle: Motorcycle) => {
    try {
      await apiPut(`/api/motorcycles/${motorcycle.id}`, {
        is_featured: motorcycle.is_featured === 1 ? false : true,
      });
      await loadMotorcycles();
    } catch (error) {
      console.error("Failed to toggle featured:", error);
    }
  };

  const handleImageUpload = async (
    motorcycleId: number,
    files: FileList | null
  ) => {
    if (!files || files.length === 0) return;

    setUploadingImages(motorcycleId);

    try {
      for (const file of Array.from(files)) {
        await apiUpload(`/api/motorcycles/${motorcycleId}/images`, file, "image");
      }

      await loadMotorcycles();
    } catch (error) {
      console.error("Failed to upload images:", error);
    } finally {
      setUploadingImages(null);
    }
  };

  const handleDeleteImage = async (motorcycleId: number, imageId: number) => {
    if (!confirm("Tem certeza que deseja excluir esta imagem?")) return;

    try {
      await apiDelete(`/api/motorcycles/${motorcycleId}/images/${imageId}`);
      await loadMotorcycles();
    } catch (error) {
      console.error("Failed to delete image:", error);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      color: "",
      mileage: 0,
      displacement: 0,
      price: 0,
      description: "",
      condition: "usado",
      payment_methods: "à vista",
      features: "",
      status: "disponivel",
      is_featured: false,
      is_financed: false,
      is_overdue: false,
      finance_days_remaining: 0,
      finance_monthly_payment: 0,
      finance_total_remaining: 0,
      is_worth_financing: false,
    });
  };

  const formatPrice = (price: number | null) => {
    if (!price) return "R$ 0,00";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "disponivel":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "reservada":
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case "vendida":
        return <Tag className="w-4 h-4 text-blue-400" />;
      case "aguardando_pagamento":
        return <DollarSign className="w-4 h-4 text-orange-400" />;
      default:
        return <Car className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "disponivel":
        return "bg-green-500/20 text-green-400";
      case "reservada":
        return "bg-yellow-500/20 text-yellow-400";
      case "vendida":
        return "bg-blue-500/20 text-blue-400";
      case "aguardando_pagamento":
        return "bg-orange-500/20 text-orange-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const filteredMotorcycles = motorcycles.filter(motorcycle => {
    const matchesSearch = 
      (motorcycle.brand?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (motorcycle.model?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || (motorcycle as any).status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Gestão Avançada de Motos</h2>
          <p className="text-gray-400">Controle completo do estoque</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 px-6 py-3 rounded-xl premium-button text-black font-semibold shadow-lg shadow-yellow-500/30 transition-all duration-300"
        >
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          <span>{showForm ? "Cancelar" : "Nova Moto"}</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por marca ou modelo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-black border border-yellow-500/30 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors duration-200"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 rounded-xl bg-black border border-yellow-500/30 text-white focus:outline-none focus:border-yellow-500 transition-colors duration-200"
        >
          <option value="all">Todos os Status</option>
          <option value="disponivel">Disponível</option>
          <option value="reservada">Reservada</option>
          <option value="vendida">Vendida</option>
          <option value="aguardando_pagamento">Aguardando Pagamento</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-3 rounded-xl bg-black border border-yellow-500/30 text-white focus:outline-none focus:border-yellow-500 transition-colors duration-200"
        >
          <option value="newest">Mais Recente</option>
          <option value="oldest">Mais Antigo</option>
          <option value="price-asc">Preço (Menor)</option>
          <option value="price-desc">Preço (Maior)</option>
        </select>
      </div>

      {/* Form */}
      {showForm && (
        <div className="premium-card p-8 rounded-xl">
          <h3 className="text-xl font-bold text-white mb-6">
            {editingId ? "Editar Moto" : "Cadastrar Nova Moto"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Marca *</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-black border border-yellow-500/30 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Modelo *</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-black border border-yellow-500/30 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Ano *</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 rounded-lg bg-black border border-yellow-500/30 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors duration-200"
                    required
                  />
                </div>
              </div>

              {/* Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Preço (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 rounded-lg bg-black border border-yellow-500/30 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Cor</label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-black border border-yellow-500/30 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Quilometragem (km)</label>
                  <input
                    type="number"
                    value={formData.mileage}
                    onChange={(e) => setFormData({ ...formData, mileage: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 rounded-lg bg-black border border-yellow-500/30 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors duration-200"
                  />
                </div>
              </div>

              {/* Status & Condition */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-black border border-yellow-500/30 text-white focus:outline-none focus:border-yellow-500 transition-colors duration-200"
                    required
                  >
                    <option value="disponivel">Disponível</option>
                    <option value="reservada">Reservada</option>
                    <option value="vendida">Vendida</option>
                    <option value="aguardando_pagamento">Aguardando Pagamento</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Condição</label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-black border border-yellow-500/30 text-white focus:outline-none focus:border-yellow-500 transition-colors duration-200"
                  >
                    <option value="usado">Usado</option>
                    <option value="novo">Novo</option>
                    <option value="seminovo">Seminovo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Forma de Pagamento</label>
                  <select
                    value={formData.payment_methods}
                    onChange={(e) => setFormData({ ...formData, payment_methods: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-black border border-yellow-500/30 text-white focus:outline-none focus:border-yellow-500 transition-colors duration-200"
                  >
                    <option value="à vista">À Vista</option>
                    <option value="financiado">Financiado</option>
                    <option value="cartão de crédito">Cartão de Crédito</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Descrição</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 rounded-lg bg-black border border-yellow-500/30 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors duration-200"
              ></textarea>
            </div>

            {/* Finance Info */}
            <div className="space-y-4 p-4 border border-gray-700 rounded-lg">
              <h4 className="text-lg font-semibold text-white">Informações de Financiamento</h4>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_financed}
                    onChange={(e) => setFormData({ ...formData, is_financed: e.target.checked })}
                    className="w-5 h-5 rounded bg-black border-yellow-500/30 text-yellow-500 focus:ring-yellow-500"
                  />
                  <span className="text-gray-300">É financiada?</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_overdue}
                    onChange={(e) => setFormData({ ...formData, is_overdue: e.target.checked })}
                    className="w-5 h-5 rounded bg-black border-yellow-500/30 text-yellow-500 focus:ring-yellow-500"
                  />
                  <span className="text-gray-300">Financiamento em atraso</span>
                </label>
              </div>

              {formData.is_financed && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Dias restantes do financiamento
                    </label>
                    <input
                      type="number"
                      value={formData.finance_days_remaining}
                      onChange={(e) => setFormData({ ...formData, finance_days_remaining: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 rounded-lg bg-black border border-yellow-500/30 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Valor da parcela mensal (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.finance_monthly_payment}
                      onChange={(e) => setFormData({ ...formData, finance_monthly_payment: parseFloat(e.target.value) })}
                      className="w-full px-4 py-3 rounded-lg bg-black border border-yellow-500/30 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Valor total restante (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.finance_total_remaining}
                      onChange={(e) => setFormData({ ...formData, finance_total_remaining: parseFloat(e.target.value) })}
                      className="w-full px-4 py-3 rounded-lg bg-black border border-yellow-500/30 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors duration-200"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="flex items-center space-x-2 px-6 py-3 rounded-xl premium-button text-black font-semibold shadow-lg shadow-yellow-500/30 transition-all duration-300"
              >
                <Save className="w-5 h-5" />
                <span>{editingId ? "Atualizar" : "Cadastrar"}</span>
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-semibold transition-colors duration-200"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Motorcycles List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="speed-loading rounded-full h-12 w-12"></div>
        </div>
      ) : filteredMotorcycles.length > 0 ? (
        <div className="space-y-4">
          {filteredMotorcycles.map((motorcycle) => (
            <div key={motorcycle.id} className="premium-card p-6 rounded-xl">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-xl font-bold text-white">
                      {motorcycle.brand} {motorcycle.model}
                    </h3>
                    {motorcycle.is_featured === 1 && (
                      <span className="px-3 py-1 rounded-full bg-yellow-500 text-black text-xs font-bold">
                        DESTAQUE
                      </span>
                    )}
                    <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor((motorcycle as any).status || 'disponivel')}`}>
                      {getStatusIcon((motorcycle as any).status || 'disponivel')}
                      <span>{((motorcycle as any).status || 'disponivel').replace('_', ' ').toUpperCase()}</span>
                    </div>
                    {/* Tarja de Vendida */}
                    {(motorcycle as any).status === 'vendida' && (
                      <span className="px-3 py-1 rounded-full bg-red-500 text-white text-xs font-bold">
                        VENDIDA
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-400 mb-4">
                    <span>Ano: {motorcycle.year || "N/A"}</span>
                    <span className="text-yellow-400 font-semibold">
                      {formatPrice(motorcycle.price)}
                    </span>
                    {motorcycle.mileage && (
                      <span>{motorcycle.mileage.toLocaleString("pt-BR")} km</span>
                    )}
                    {/* Imagens */}
                    <div className="md:col-span-4 mt-4">
                      <h4 className="text-sm font-semibold text-gray-300 mb-2">Imagens ({motorcycle.images.length})</h4>
                      <div className="flex flex-wrap gap-2">
                        {motorcycle.images.map((image) => (
                          <div key={image.id} className="relative group">
                            <img
                              src={image.url}
                              alt={image.filename}
                              className="w-20 h-20 object-cover rounded-lg border border-gray-700"
                            />
                            <button
                              onClick={() => handleDeleteImage(motorcycle.id, image.id)}
                              className="absolute top-0 right-0 p-1 bg-red-600 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                              title="Excluir imagem"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <span>Condição: {motorcycle.condition || "N/A"}</span>
                  </div>

                  {motorcycle.is_financed === 1 && (
                    <div className="flex items-center space-x-4 text-sm mb-2">
                      <span className="text-purple-400">🏦 Financiada</span>
                      {motorcycle.is_overdue === 1 && (
                        <span className="text-red-400 flex items-center space-x-1">
                          <AlertTriangle className="w-4 h-4" />
                          <span>Em atraso</span>
                        </span>
                      )}
                      {motorcycle.finance_days_remaining && (
                        <span className="text-gray-400">
                          {motorcycle.finance_days_remaining} dias restantes
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Status Change */}
                  <select
                    value={(motorcycle as any).status || 'disponivel'}
                    onChange={(e) => handleStatusChange(motorcycle.id, e.target.value)}
                    className="px-3 py-2 rounded-lg bg-gray-700 text-white text-sm border border-gray-600 focus:outline-none focus:border-yellow-500"
                  >
                    <option value="disponivel">Disponível</option>
                    <option value="reservada">Reservada</option>
                    <option value="vendida">Vendida</option>
                    <option value="aguardando_pagamento">Aguardando Pagamento</option>
                  </select>

                  <button
                    onClick={() => toggleFeatured(motorcycle)}
                    className={`p-3 rounded-lg transition-all duration-200 ${
                      motorcycle.is_featured === 1
                        ? "bg-yellow-500 text-black speed-glow"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                    title={motorcycle.is_featured === 1 ? "Remover destaque" : "Destacar"}
                  >
                    <Star className="w-5 h-5" />
                  </button>

                  <label
                    className="p-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors duration-200 cursor-pointer"
                    title="Upload de imagens"
                  >
                    {uploadingImages === motorcycle.id ? (
                      <div className="speed-loading rounded-full h-5 w-5"></div>
                    ) : (
                      <Upload className="w-5 h-5" />
                    )}
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(motorcycle.id, e.target.files)}
                      disabled={uploadingImages === motorcycle.id}
                    />
                  </label>

                  <button
                    onClick={() => handleEdit(motorcycle)}
                    className="p-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-200"
                    title="Editar"
                  >
                    <Edit className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => handleDelete(motorcycle.id)}
                    className="p-3 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors duration-200"
                    title="Excluir"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Car className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">
            {searchTerm || statusFilter !== "all" 
              ? "Nenhuma moto encontrada com os filtros aplicados" 
              : "Nenhuma moto cadastrada ainda"
            }
          </p>
        </div>
      )}
    </div>
  );
}
