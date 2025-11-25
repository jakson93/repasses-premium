import { useState, useEffect } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "@/react-app/utils/api";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Edit,
  Trash2,
  Download,
  Search,
  FileText,
  BarChart3,
  Save,
  X,
} from "lucide-react";

interface FinancialRecord {
  id: number;
  type: 'entrada' | 'saida';
  description: string;
  amount: number;
  category: string;
  date: string;
  motorcycle_id?: number;
  client_id?: number;
  created_by?: number;
  created_at: string;
  updated_at: string;
  motorcycle_info?: {
    brand: string;
    model: string;
  };
  client_info?: {
    name: string;
  };
}

interface FinancialSummary {
  totalEntradas: number;
  totalSaidas: number;
  saldo: number;
  transacoesHoje: number;
  lucroMes: number;
  gastosMes: number;
  categorias: {
    [key: string]: number;
  };
}

export default function FinancialManagement() {
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [summary, setSummary] = useState<FinancialSummary>({
    totalEntradas: 0,
    totalSaidas: 0,
    saldo: 0,
    transacoesHoje: 0,
    lucroMes: 0,
    gastosMes: 0,
    categorias: {},
  });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  const [formData, setFormData] = useState({
    type: "entrada" as "entrada" | "saida",
    description: "",
    amount: 0,
    category: "",
    date: new Date().toISOString().split('T')[0],
    motorcycle_id: undefined as number | undefined,
    client_id: undefined as number | undefined,
  });

  useEffect(() => {
    loadFinancialData();
  }, []);

  const loadFinancialData = async () => {
    try {
const [recordsData, summaryData] = await Promise.all([
	        apiGet<FinancialRecord[]>("/api/financial/records"),
	        apiGet<FinancialSummary>("/api/financial/summary"),
	      ]);

	      setRecords(recordsData);
	      setSummary(summaryData);
    } catch (error) {
      console.error("Failed to load financial data:", error);
      // Se houver erro, garante que o estado de carregamento seja falso e os dados sejam vazios
      setRecords([]);
      setSummary({
        totalEntradas: 0,
        totalSaidas: 0,
        saldo: 0,
        transacoesHoje: 0,
        lucroMes: 0,
        gastosMes: 0,
        categorias: {},
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingId
        ? `/api/financial/records/${editingId}`
        : "/api/financial/records";
      const method = editingId ? "PUT" : "POST";

await (editingId ? apiPut(url, formData) : apiPost(url, formData));

		      if (true) {
	        await loadFinancialData();
	        resetForm();
	      }
	    } catch (error) {
	      console.error("Failed to save financial record:", error);
	      alert("Erro ao salvar registro financeiro. Verifique o console para detalhes.");
	    }
	  };

  const handleEdit = (record: FinancialRecord) => {
    setEditingId(record.id);
    setFormData({
      type: record.type,
      description: record.description,
      amount: record.amount,
      category: record.category,
      date: record.date,
      motorcycle_id: record.motorcycle_id,
      client_id: record.client_id,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta transação?")) return;

    try {
await apiDelete(`/api/financial/records/${id}`);

		      if (true) {
	        await loadFinancialData();
	      }
	    } catch (error) {
	      console.error("Failed to delete financial record:", error);
	      alert("Erro ao deletar registro financeiro. Verifique o console para detalhes.");
	    }
	  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      type: "entrada",
      description: "",
      amount: 0,
      category: "",
      date: new Date().toISOString().split('T')[0],
      motorcycle_id: undefined,
      client_id: undefined,
    });
  };

  const exportToPDF = () => {
    // Mock export functionality
    alert("Funcionalidade de exportação será implementada em breve!");
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getFilteredRecords = () => {
    return records.filter(record => {
      const matchesSearch = record.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === "all" || record.type === typeFilter;
      const matchesCategory = categoryFilter === "all" || record.category === categoryFilter;
      
      let matchesDate = true;
      if (dateFilter !== "all") {
        const recordDate = new Date(record.date);
        const today = new Date();
        
        switch (dateFilter) {
          case "today":
            matchesDate = recordDate.toDateString() === today.toDateString();
            break;
          case "week":
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            matchesDate = recordDate >= weekAgo;
            break;
          case "month":
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            matchesDate = recordDate >= monthAgo;
            break;
        }
      }
      
      return matchesSearch && matchesType && matchesCategory && matchesDate;
    });
  };

  const filteredRecords = getFilteredRecords();

  const categories = {
    entrada: ['Venda', 'Comissão', 'Entrada de Caixa', 'Outros'],
    saida: ['Aquisição', 'Manutenção', 'Publicidade', 'Combustível', 'Documentação', 'Despesas Fixas', 'Outros']
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="speed-loading rounded-full h-12 w-12"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Controle Financeiro</h2>
          <p className="text-gray-400">Gerencie entradas, saídas e relatórios</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={exportToPDF}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors duration-200"
          >
            <Download className="w-4 h-4" />
            <span>Exportar</span>
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center space-x-2 px-6 py-3 rounded-xl premium-button text-black font-semibold shadow-lg shadow-yellow-500/30 transition-all duration-300"
          >
            {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            <span>{showForm ? "Cancelar" : "Nova Transação"}</span>
          </button>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="premium-card p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Total Entradas</p>
              <p className="text-2xl font-bold text-green-400 mt-1">
                {formatPrice(summary.totalEntradas)}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Este mês: {formatPrice(summary.lucroMes)}
              </p>
            </div>
            <div className="bg-green-500/20 p-4 rounded-xl">
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </div>

        <div className="premium-card p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Total Saídas</p>
              <p className="text-2xl font-bold text-red-400 mt-1">
                {formatPrice(summary.totalSaidas)}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Este mês: {formatPrice(summary.gastosMes)}
              </p>
            </div>
            <div className="bg-red-500/20 p-4 rounded-xl">
              <TrendingDown className="w-8 h-8 text-red-400" />
            </div>
          </div>
        </div>

        <div className="premium-card p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Saldo Atual</p>
              <p className={`text-2xl font-bold mt-1 ${
                summary.saldo >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {formatPrice(summary.saldo)}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Lucro líquido
              </p>
            </div>
            <div className="bg-yellow-500/20 p-4 rounded-xl">
              <DollarSign className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="premium-card p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Transações Hoje</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">
                {summary.transacoesHoje}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Total: {records.length} registros
              </p>
            </div>
            <div className="bg-blue-500/20 p-4 rounded-xl">
              <BarChart3 className="w-8 h-8 text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar transação..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-black border border-yellow-500/30 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors duration-200"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-3 rounded-xl bg-black border border-yellow-500/30 text-white focus:outline-none focus:border-yellow-500 transition-colors duration-200"
        >
          <option value="all">Todos os Tipos</option>
          <option value="entrada">Entradas</option>
          <option value="saida">Saídas</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-3 rounded-xl bg-black border border-yellow-500/30 text-white focus:outline-none focus:border-yellow-500 transition-colors duration-200"
        >
          <option value="all">Todas as Categorias</option>
          {Object.keys(summary.categorias).map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>

        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-4 py-3 rounded-xl bg-black border border-yellow-500/30 text-white focus:outline-none focus:border-yellow-500 transition-colors duration-200"
        >
          <option value="all">Todos os Períodos</option>
          <option value="today">Hoje</option>
          <option value="week">Última Semana</option>
          <option value="month">Último Mês</option>
        </select>
      </div>

      {/* Form */}
      {showForm && (
        <div className="premium-card p-8 rounded-xl">
          <h3 className="text-2xl font-bold text-white mb-6">
            {editingId ? "Editar Transação" : "Nova Transação"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tipo *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'entrada' | 'saida' })}
                  className="w-full px-4 py-3 rounded-lg bg-black border border-yellow-500/30 text-white focus:outline-none focus:border-yellow-500 transition-colors duration-200"
                >
                  <option value="entrada">Entrada</option>
                  <option value="saida">Saída</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Categoria *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-black border border-yellow-500/30 text-white focus:outline-none focus:border-yellow-500 transition-colors duration-200"
                >
                  <option value="">Selecione</option>
                  {categories[formData.type].map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Valor (R$) *
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 rounded-lg bg-black border border-yellow-500/30 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Data *
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-black border border-yellow-500/30 text-white focus:outline-none focus:border-yellow-500 transition-colors duration-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Descrição *
              </label>
              <input
                type="text"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-black border border-yellow-500/30 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors duration-200"
                placeholder="Descreva a transação..."
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="flex items-center space-x-2 px-6 py-3 rounded-xl premium-button text-black font-semibold shadow-lg shadow-yellow-500/30 transition-all duration-300"
              >
                <Save className="w-5 h-5" />
                <span>{editingId ? "Atualizar" : "Salvar"}</span>
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

      {/* Records List */}
      <div className="space-y-4">
        {filteredRecords.length > 0 ? (
          filteredRecords.map((record) => (
            <div key={record.id} className="premium-card p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl ${
                    record.type === 'entrada' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {record.type === 'entrada' ? (
                      <TrendingUp className="w-6 h-6" />
                    ) : (
                      <TrendingDown className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">
                      {record.description}
                    </h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(record.date)}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <FileText className="w-4 h-4" />
                        <span>{record.category}</span>
                      </span>
                      {record.motorcycle_info && (
                        <span className="flex items-center space-x-1">
                          <span>🏍️</span>
                          <span>{record.motorcycle_info.brand} {record.motorcycle_info.model}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className={`text-xl font-bold ${
                    record.type === 'entrada' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {record.type === 'entrada' ? '+' : '-'}{formatPrice(record.amount)}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(record)}
                      className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors duration-200"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(record.id)}
                      className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20">
            <DollarSign className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">
              {searchTerm || typeFilter !== "all" || categoryFilter !== "all" || dateFilter !== "all"
                ? "Nenhuma transação encontrada com os filtros aplicados"
                : "Nenhuma transação registrada ainda"
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
