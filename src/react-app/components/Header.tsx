import { Link } from "react-router";
import { Menu, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/react-app/contexts/AuthContext";
import LoginModal from "@/react-app/components/LoginModal";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const handleLogin = () => {
    setShowLoginModal(true);
  };

  return (
    <>
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-lg border-b border-yellow-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          <Link to="/" className="flex items-center group">
            <img 
              src="https://mocha-cdn.com/019a4ef9-460a-7ccc-8e69-fa98bfaa96f0/repasses_premium_logo_transparente_2.png" 
              alt="Repasses Premium" 
              className="h-16 w-auto object-contain transition-all duration-300 group-hover:drop-shadow-[0_0_20px_rgba(250,204,21,0.6)] drop-shadow-[0_0_10px_rgba(250,204,21,0.3)]"
            />
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-300 hover:text-yellow-400 transition-all duration-300 font-medium relative group"
            >
              Início
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-400 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              to="/catalog"
              className="text-gray-300 hover:text-yellow-400 transition-all duration-300 font-medium relative group"
            >
              Catálogo
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-400 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            {user && (
              <Link
                to="/admin"
                className="text-gray-300 hover:text-yellow-400 transition-all duration-300 font-medium relative group"
              >
                Administração
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-400 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            )}
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-300">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 border border-yellow-500/30 hover:border-yellow-500/60 transition-all duration-300"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/catalog"
                  className="premium-button px-6 py-2 rounded-lg text-black font-semibold shadow-lg shadow-yellow-500/30 transition-all duration-300 relative overflow-hidden"
                >
                  Ver Motos
                </Link>
                <button
                  onClick={handleLogin}
                  className="px-6 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 border border-yellow-500/30 hover:border-yellow-500/60 transition-all duration-300 font-semibold"
                >
                  Entrar
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 border border-yellow-500/30"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-yellow-500/20 bg-black/95 backdrop-blur-lg">
          <nav className="px-4 py-4 space-y-3">
            <Link
              to="/"
              className="block px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-yellow-400 transition-all duration-300"
              onClick={() => setMobileMenuOpen(false)}
            >
              Início
            </Link>
            <Link
              to="/catalog"
              className="block px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-yellow-400 transition-all duration-300"
              onClick={() => setMobileMenuOpen(false)}
            >
              Catálogo
            </Link>
            {user && (
              <Link
                to="/admin"
                className="block px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-yellow-400 transition-all duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                Administração
              </Link>
            )}
            {user ? (
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-yellow-400 transition-all duration-300"
              >
                Sair
              </button>
            ) : (
              <button
                onClick={() => {
                  handleLogin();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-yellow-400 transition-all duration-300"
              >
                Entrar
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
    </>
  );
}
