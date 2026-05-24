import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { LogIn, BookOpen } from "lucide-react";

export default function Login() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">PeA-Plan</h1>
          <p className="text-gray-600 mt-2">Plataforma de Elaboração de Planos de Negócios</p>
        </div>

        <Card className="p-8 shadow-lg">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Bem-vindo ao PeA-Plan</h2>
              <p className="text-sm text-gray-600">
                Faça login para acessar sua plataforma de elaboração de planos de negócios.
              </p>
            </div>

            <div className="space-y-3 bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center mt-0.5">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
                <p className="text-sm text-gray-700">Crie planos de negócios estruturados em 8 seções.</p>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center mt-0.5">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
                <p className="text-sm text-gray-700">Análise financeira completa com VPL, TIR e Payback.</p>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center mt-0.5">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
                <p className="text-sm text-gray-700">Ferramentas estratégicas: SWOT e Business Model Canvas.</p>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center mt-0.5">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
                <p className="text-sm text-gray-700">Gamificação com pontos, níveis e ranking.</p>
              </div>
            </div>

            <Button
              onClick={async () => { await fetch("/api/trpc/auth.devLogin", { method: "POST", credentials: "include" }); window.location.href = "/dashboard"; }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
            >
              <LogIn className="w-5 h-5" />
              <span>Fazer Login</span>
            </Button>

            <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-200">
              <p>Ao fazer login, você concorda com nossos Termos de Serviço e Política de Privacidade.</p>
            </div>
          </div>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>© 2026 PeA-Plan. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
}


