import { MessageCircle, Mail, Instagram, Facebook, Phone } from "lucide-react";
export default function Footer() {
  return <footer className="bg-black border-t border-yellow-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="mb-6">
              <img src="https://mocha-cdn.com/019a4ef9-460a-7ccc-8e69-fa98bfaa96f0/repasses_premium_logo_transparente_2.png" alt="Repasses Premium" className="h-16 w-auto object-contain hover:scale-105 transition-transform duration-300" />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-md">
              Sua plataforma premium para compra e venda de motos. Qualidade,
              segurança e transparência em cada negociação. Velocidade e confiança
              em todos os seus repasses.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-yellow-500 flex items-center justify-center text-gray-400 hover:text-black transition-all duration-300 hover:scale-110">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-yellow-500 flex items-center justify-center text-gray-400 hover:text-black transition-all duration-300 hover:scale-110">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-bold mb-6 text-lg">Contato Rápido</h3>
            <div className="space-y-4">
              <a href="https://wa.me/5593991334064" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 text-gray-400 hover:text-yellow-400 transition-all duration-300 group">
                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center group-hover:bg-green-500/30 transition-colors duration-300">
                  <MessageCircle className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <div className="text-sm font-medium">WhatsApp</div>
                  <div className="text-xs text-gray-500">(93) 99133-4064</div>
                </div>
              </a>
              
              <a href="tel:+5593991334064" className="flex items-center space-x-3 text-gray-400 hover:text-yellow-400 transition-all duration-300 group">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors duration-300">
                  <Phone className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <div className="text-sm font-medium">Telefone</div>
                  <div className="text-xs text-gray-500">(93) 99133-4064</div>
                </div>
              </a>


            </div>
          </div>

          <div>
            <h3 className="text-white font-bold mb-6 text-lg">Horário de Atendimento</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Segunda à Sexta:</span>
                <span className="text-white font-medium">8h às 18h</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Sábado:</span>
                <span className="text-white font-medium">8h às 14h</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Domingo:</span>
                <span className="text-red-400 font-medium">Fechado</span>
              </div>
            </div>
            
            <div className="mt-6 p-4 rounded-lg premium-card">
              <div className="text-yellow-400 text-sm font-bold mb-2">
                🚀 Atendimento Expresso
              </div>
              <div className="text-xs text-gray-400">
                Resposta em até 30 minutos durante o horário comercial
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left text-gray-400 text-sm">
              © {new Date().getFullYear()} Repasses Premium. Todos os direitos reservados.
            </div>
            <div className="flex items-center space-x-6 text-xs text-gray-500">
              <a href="#" className="hover:text-yellow-400 transition-colors duration-300">
                Política de Privacidade
              </a>
              <a href="#" className="hover:text-yellow-400 transition-colors duration-300">
                Termos de Uso
              </a>
              <a href="#" className="hover:text-yellow-400 transition-colors duration-300">
                FAQ
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>;
}