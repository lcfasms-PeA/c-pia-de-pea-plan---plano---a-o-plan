import { useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Zap, Target, Award, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";

const ACHIEVEMENT_ICONS: Record<string, string> = {
  first_section: "🎯",
  all_sections: "🏆",
  swot_master: "🧠",
  canvas_master: "🎨",
  financial_master: "💰",
  team_leader: "👑",
  class_champion: "🥇",
  speedrunner: "⚡",
  perfectionist: "✨",
  collaborator: "🤝",
};

function calculatePlanProgress(planData: Record<string, any> | null | undefined) {
  if (!planData) return 0;

  const sections = [
    planData.descricaoEmpresa,
    planData.produtosServicos,
    planData.estruturaOrganizacional,
    planData.planoMarketing,
    planData.planoOperacional,
    planData.estruturaCapitalizacao,
    planData.planoFinanceiro,
    planData.sumarioExecutivo,
  ];

  const completedSections = sections.filter((section) => {
    if (!section || typeof section !== "object") return false;

    return Object.values(section).some((value) => {
      if (Array.isArray(value)) return value.length > 0;
      return value !== null && value !== undefined && value !== "";
    });
  }).length;

  return Math.round((completedSections / sections.length) * 100);
}

export default function DashboardAluno() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { data: scoreData, isLoading: scoreLoading } = trpc.gamification.getScore.useQuery();
  const { data: plansData, isLoading: plansLoading } = trpc.businessPlans.list.useQuery();
  const { data: achievementsData, isLoading: achievementsLoading } = trpc.gamification.getAchievements.useQuery();
  const { data: summaryData, isLoading: summaryLoading } = trpc.gamification.getSummary.useQuery();
  const rankingLoading = summaryLoading;
  const createPlanMutation = trpc.businessPlans.create.useMutation();

  const plansWithProgress = useMemo(
    () => (plansData || []).map((plan) => ({ ...plan, progress: calculatePlanProgress(plan.data as Record<string, any>) })),
    [plansData]
  );

  const userStats = {
    level: scoreData?.level || 1,
    xp: scoreData?.xp || 0,
    xpNext: scoreData?.xpNext || 1000,
    points: scoreData?.points || 0,
    achievements: summaryData?.totalAchievements || 0,
    rank: summaryData?.rankingPosition || 0,
    rankingTotal: summaryData?.rankingTotal || 0,
  };

  const handleCreatePlan = async () => {
    try {
      const title = `Plano ${new Date().toLocaleDateString("pt-BR")}`;
      const result = await createPlanMutation.mutateAsync({ title, classId: plansData?.find((plan) => plan.classId)?.classId || undefined });
      navigate(`/plano/${result.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao criar plano";
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Aluno</h1>
          <p className="text-gray-600 mt-2">Bem-vindo, {user?.name}</p>
        </div>
        <Button onClick={handleCreatePlan} disabled={createPlanMutation.isPending}>
          {createPlanMutation.isPending ? "Criando..." : "+ Novo Plano"}
        </Button>
      </div>

      {/* Gamificação */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Nível */}
        <Card className="p-6 text-center">
          {scoreLoading ? (
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
          ) : (
            <>
              <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-gray-600 text-sm">Nível</p>
              <p className="text-4xl font-bold">{userStats.level}</p>
            </>
          )}
        </Card>

        {/* XP */}
        <Card className="p-6">
          {scoreLoading ? (
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
          ) : (
            <>
              <Zap className="w-8 h-8 text-blue-600 mb-2" />
              <p className="text-gray-600 text-sm">Experiência</p>
              <p className="text-2xl font-bold">
                {userStats.xp}/{userStats.xpNext}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${(userStats.xp / userStats.xpNext) * 100}%`,
                  }}
                />
              </div>
            </>
          )}
        </Card>

        {/* Pontos */}
        <Card className="p-6 text-center">
          {scoreLoading ? (
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
          ) : (
            <>
              <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-gray-600 text-sm">Pontos</p>
              <p className="text-3xl font-bold">{userStats.points}</p>
            </>
          )}
        </Card>

        {/* Ranking */}
        <Card className="p-6 text-center">
          {rankingLoading ? (
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
          ) : (
            <>
              <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-gray-600 text-sm">Ranking</p>
              <p className="text-3xl font-bold">{userStats.rank > 0 ? `#${userStats.rank}` : "-"}</p>
              {userStats.rankingTotal > 0 && (
                <p className="text-xs text-gray-500 mt-1">de {userStats.rankingTotal} aluno(s)</p>
              )}
            </>
          )}
        </Card>
      </div>

      {/* Meus Planos */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Meus Planos</h2>
        {plansLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : plansWithProgress.length > 0 ? (
          plansWithProgress.map((plan) => (
            <Card key={plan.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold">{plan.title}</h3>
                  <p className="text-sm text-gray-600">
                    Criado em {new Date(plan.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <Button variant="default" onClick={() => navigate(`/plano/${plan.id}`)}>Continuar</Button>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progresso</span>
                  <span className="font-medium">{plan.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all"
                    style={{ width: `${plan.progress}%` }}
                  />
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-6 text-center">
            <p className="text-gray-500">Nenhum plano encontrado</p>
          </Card>
        )}
      </div>

      {/* Conquistas */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Próximas Conquistas</h2>
        {summaryLoading || achievementsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : summaryData && summaryData.nextAchievements.length > 0 ? (
          <div className="space-y-4">
            {achievementsData && achievementsData.length > 0 && (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <p className="text-sm font-semibold text-yellow-900">
                  {achievementsData.length} conquista(s) já desbloqueada(s)
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {summaryData.nextAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="p-4 rounded-lg text-center transition-all bg-gray-100 border-2 border-gray-300"
              >
                <p className="text-4xl mb-2">{ACHIEVEMENT_ICONS[achievement.id] || achievement.icone || "🏆"}</p>
                <p className="text-sm font-medium">{achievement.nome}</p>
                <p className="text-xs text-gray-600 mt-1">{achievement.descricao}</p>
              </div>
            ))}
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">Nenhuma conquista pendente encontrada</p>
        )}
      </Card>

      {/* Dicas */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="font-bold text-blue-900 mb-2">💡 Dica do Dia</h3>
        <p className="text-sm text-blue-800">
          {summaryData?.nextAchievements[0]
            ? `Próximo foco: ${summaryData.nextAchievements[0].nome} - ${summaryData.nextAchievements[0].criterio}.`
            : "Continue avançando no seu plano para subir de nível e ganhar mais pontos."}
        </p>
      </Card>
    </div>
  );
}
