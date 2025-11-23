import { useState } from "react";
import { UserPlus, Save, AlertTriangle } from "lucide-react";

export default function UserManagement() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("user");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, role }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: `Usuário ${email} cadastrado com sucesso!` });
        setEmail("");
        setPassword("");
        setName("");
        setRole("user");
      } else {
        setMessage({ type: "error", text: data.error || "Erro ao cadastrar usuário." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erro de conexão ao tentar cadastrar usuário." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="premium-card p-8 rounded-xl">
      <div className="flex items-center space-x-3 mb-6">
        <UserPlus className="w-6 h-6 text-yellow-500" />
        <h3 className="text-2xl font-bold text-white">Cadastro de Novo Usuário</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nome
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-black border border-yellow-500/30 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors duration-200"
              placeholder="Nome Completo"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-black border border-yellow-500/30 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors duration-200"
              placeholder="email@exemplo.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Senha *
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-black border border-yellow-500/30 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors duration-200"
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nível de Acesso (Role)
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-black border border-yellow-500/30 text-white focus:outline-none focus:border-yellow-500 transition-colors duration-200"
            >
              <option value="user">Usuário Comum</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
        </div>

        {message && (
          <div
            className={`p-4 rounded-lg flex items-center space-x-3 ${
              message.type === "success"
                ? "bg-green-500/20 text-green-400"
                : "bg-red-500/20 text-red-400"
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex items-center space-x-2 px-6 py-3 rounded-xl premium-button text-black font-semibold shadow-lg shadow-yellow-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
          <span>{loading ? "Cadastrando..." : "Cadastrar Usuário"}</span>
        </button>
      </form>
    </div>
  );
}
