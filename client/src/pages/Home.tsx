import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, BarChart3, BookOpen, Loader2, Target, Users } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const { isAuthenticated, loading, user } = useAuth();
  const [, navigate] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <main className="max-w-6xl mx-auto px-6 py-16">
        <section className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 mb-6">
              <BookOpen className="w-4 h-4" />
              PeA-Plan - Plano & Ação Plan
            </div>

            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">
              Plataforma para elaboração, gestão e validação de planos de negócios.
            </h1>

            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              Organize ideias, analise viabilidade, acompanhe turmas, desenvolva planos completos
              e utilize ferramentas como SWOT, Canvas, análise financeira, gamificação e relatórios.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              {isAuthenticated ? (
                <Button
                  size="lg"
                  onClick={() => navigate("/dashboard")}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Acessar dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              ) : (
                <Button
                  size="lg"
                  onClick={() => navigate("/login")}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Entrar no sistema
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              )}

              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/financial-analysis")}
              >
                Ver análise financeira
              </Button>
            </div>

            {isAuthenticated && user && (
              <p className="text-sm text-slate-500 mt-4">
                Sessão ativa para {user.name || "usuário"}.
              </p>
            )}
          </div>

          <Card className="p-8 shadow-xl border-slate-200 bg-white/90">
            <h2 className="text-2xl font-semibold text-slate-900 mb-6">
              Módulos principais
            </h2>

            <div className="grid gap-5">
              <div className="flex gap-4">
                <div className="rounded-lg bg-blue-100 p-3 h-fit">
                  <Target className="w-6 h-6 text-blue-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Plano estruturado</h3>
                  <p className="text-sm text-slate-600">
                    Desenvolvimento orientado por seções para transformar ideias em planos completos.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="rounded-lg bg-green-100 p-3 h-fit">
                  <BarChart3 className="w-6 h-6 text-green-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Análise financeira</h3>
                  <p className="text-sm text-slate-600">
                    Apoio a indicadores como fluxo de caixa, viabilidade, VPL, TIR e Payback.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="rounded-lg bg-orange-100 p-3 h-fit">
                  <Users className="w-6 h-6 text-orange-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Turmas e acompanhamento</h3>
                  <p className="text-sm text-slate-600">
                    Gestão de professores, alunos, progresso, gamificação e relatórios.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
}
