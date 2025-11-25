import { useState, useEffect } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "@/react-app/utils/api";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Star,
  Phone,
  Mail,
  MapPin,
  User,
  Calendar,
  FileText,
  X,
  Save,
} from "lucide-react";

interface Client {
  id: number;
  name: string;
  document: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  reliability_score: number;
  created_at: string;
  updated_at: string;
  total_motorcycles?: number;
  total_sales?: number;
}

export default function ClientManagement() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    document: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
    reliability_score: 5,
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const data = await apiGet<Client[]>("/api/clients");
        setClients(data);
    } catch (error) {
      console.error("Failed to load clients:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingId ? `/api/clients/${editingId}` : "/api/clients";
      const method = editingId ? "PUT" : "POST";

await (editingId ? apiPut(url, formData) : apiPost(url, formData));

	      if (true) {
        await loadClients();
        resetForm();
      }
    } catch (error) {
      console.error("Failed to save client:", error);
    }
  };

  const handleEdit = (client: Client) => {
    setEditingId(client.id);
    setFormData({
      name: client.name || "",
      document: client.document || "",
      phone: client.phone || "",
      email: client.email || "",
      address: client.address || "",
      notes: client.notes || "",
      reliability_score: client.reliability_score || 5,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este cliente?")) return;

    try {
await apiDelete(`/api/clients/${id}`);

	      if (true) {
        await loadClients();
      }
    } catch (error) {
      console.error("Failed to delete client:", error);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: "",
      document: "",
      phone: "",
      email: "",
      address: "",
      notes: "",
      reliability_score: 5,
    });
  };

  const getReliabilityColor = (score: number) => {
    if (score >= 8) return "text-green-400";
    if (score >= 6) return "text-yellow-400";
    return "text-red-400";
  };

  const getReliabilityText = (score: number) => {
    if (score >= 8) return "Excelente";
    if (score >= 6) return "Bom";
    if (score >= 4) return "Regular";
    return "Ruim";
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.document.includes(searchTerm) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Clientes e Repassadores</h2>
          <p className="text-gray-400">Gerencie sua base de clientes</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 px-6 py-3 rounded-xl premium-button text-black font-semibold shadow-lg shadow-yellow-500/30 transition-all duration-300"
        >
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          <span>{showForm ? "Cancelar" : "Novo Cliente"}</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar por nome, documento ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl bg-black border border-yellow-500/30 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors duration-200"
        />
      </div>

      {/* Form */}
      {showForm && (
        <div className="premium-card p-8 rounded-xl">
          <h3 className="text-2xl font-bold text-white mb-6">
            {editingId ? "Editar Cliente" : "Cadastrar Novo Cliente"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-black border border-yellow-500/30 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors duration-200"
                  placeholder="Nome do cliente"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  CPF/CNPJ
                </label>
                <input
                  type="text"
                  value={formData.document}
                  onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-black border border-yellow-500/30 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors duration-200"
                  placeholder="000.000.000-00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-black border border-yellow-500/30 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors duration-200"
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-black border border-yellow-500/30 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors duration-200"
                  placeholder="cliente@email.com"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Endereço
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-black border border-yellow-500/30 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors duration-200"
                  placeholder="Endereço completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Avaliação de Confiabilidade (1-10)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.reliability_score}
                  onChange={(e) => setFormData({ ...formData, reliability_score: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 rounded-lg bg-black border border-yellow-500/30 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors duration-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Observações
              </label>
              <textarea
                rows={4}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-black border border-yellow-500/30 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors duration-200"
                placeholder="Observações sobre o cliente..."
              />
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

      {/* Clients List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="speed-loading rounded-full h-12 w-12"></div>
        </div>
      ) : filteredClients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <div key={client.id} className="premium-card p-6 rounded-xl">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-yellow-500/20 p-3 rounded-xl">
                    <User className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{client.name}</h3>
                    <div className="flex items-center space-x-2">
                      <Star className={`w-4 h-4 ${getReliabilityColor(client.reliability_score)}`} />
                      <span className={`text-sm font-medium ${getReliabilityColor(client.reliability_score)}`}>
                        {getReliabilityText(client.reliability_score)} ({client.reliability_score}/10)
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(client)}
                    className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors duration-200"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(client.id)}
                    className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {client.document && (
                  <div className="flex items-center space-x-2 text-gray-400">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm">{client.document}</span>
                  </div>
                )}

                {client.phone && (
                  <div className="flex items-center space-x-2 text-gray-400">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{client.phone}</span>
                  </div>
                )}

                {client.email && (
                  <div className="flex items-center space-x-2 text-gray-400">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{client.email}</span>
                  </div>
                )}

                {client.address && (
                  <div className="flex items-center space-x-2 text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{client.address}</span>
                  </div>
                )}

                <div className="flex items-center space-x-2 text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    Cliente desde {new Date(client.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>

              {client.notes && (
                <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
                  <p className="text-gray-400 text-sm">{client.notes}</p>
                </div>
              )}

              {/* Stats */}
              <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
                <div className="text-center">
                  <p className="text-white font-semibold">{client.total_motorcycles || 0}</p>
                  <p className="text-gray-400 text-xs">Motos</p>
                </div>
                <div className="text-center">
                  <p className="text-white font-semibold">{client.total_sales || 0}</p>
                  <p className="text-gray-400 text-xs">Vendidas</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <User className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">
            {searchTerm ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado ainda"}
          </p>
        </div>
      )}
    </div>
  );
}
