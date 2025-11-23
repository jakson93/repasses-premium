import { useState } from 'react';
import { useAuth } from '@/react-app/contexts/AuthContext';
import { useNavigate } from 'react-router';
import Header from '@/react-app/components/Header';
import Footer from '@/react-app/components/Footer';

export default function LoginPage() {
  // const [isLogin, setIsLogin] = useState(true); // Removido: Apenas login é permitido
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/admin');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex flex-col">
      <Header zIndex="z-20" />
      <div className="flex-grow flex items-center justify-center p-4 overflow-auto">
        <div className="w-full max-w-md p-8 space-y-8 bg-gray-800/50 rounded-xl shadow-lg backdrop-blur-sm border border-gray-700 relative z-10">
          <h2 className="text-3xl font-bold text-center text-white speed-text">Entrar</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <label htmlFor="email" className="text-sm font-medium text-gray-400">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 mt-1 text-white bg-gray-700/50 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            <div>
              <label htmlFor="password" className="text-sm font-medium text-gray-400">Senha</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 mt-1 text-white bg-gray-700/50 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div>
              <button
                type="submit"
                className="w-full py-3 font-semibold text-black bg-yellow-500 rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-yellow-500 transition-all duration-300 speed-glow"
              >
                Entrar
              </button>
            </div>
          </form>
          
        </div>
      </div>
      <Footer />
    </div>
  );
}
