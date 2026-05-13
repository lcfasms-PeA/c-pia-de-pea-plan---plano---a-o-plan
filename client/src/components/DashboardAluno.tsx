import { useAuth } from "@/_core/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Zap, Target, Award, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function DashboardAluno() {
  const { user } = useAuth();
  const { data: scoreData, isLoading: scoreLoading } = trpc.gamification.getScore.useQuery();
  const { data: plansData, isLoading: plansLoading } = trpc.businessPlans.list.useQuery();
  const { data: achievementsData, isLoading: achievementsLoading } = trpc.gamification.getAchievements.useQuery();
  const { data: rankingData, isLoading: rankingLoading } = trpc.gamification.getRanking.useQuery({ classId: 1 });

  const userStats = {
    level: scoreData?.level || 1,
    xp: scoreData?.xp || 0,
    xpNext: scoreData?.xpNext || 1000,
    points: scoreData?.points || 0,
    achievements: achievementsData?.length || 0,
    rank: rankingData ? rankingData.findIndex((r) => r.userId === user?.id) + 1 : 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Aluno</h1>
          <p className="text-gray-600 mt-2">Bem-vindo, {user?.name}</p>
        </div>
        <Button>+ Novo Plano</Button>
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
              <p className="text-3xl font-bold">#{userStats.rank}</p>
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
        ) : plansData && plansData.length > 0 ? (
          plansData.map((plan) => (
            <Card key={plan.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold">{plan.title}</h3>
                  <p className="text-sm text-gray-600">
                    Criado em {new Date(plan.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <Button variant="default">Continuar</Button>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progresso</span>
                  <span className="font-medium">~65%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all"
                    style={{ width: `65%` }}
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
        <h2 className="text-2xl font-bold mb-4">Conquistas</h2>
        {achievementsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : achievementsData && achievementsData.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {achievementsData.map((achievement, index) => (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg text-center transition-all ${
                  index < 3
                    ? "bg-yellow-50 border-2 border-yellow-300"
                    : "bg-gray-100 border-2 border-gray-300 opacity-50"
                }`}
              >
                <p className="text-4xl mb-2">🏆</p>
                <p className="text-sm font-medium">Conquista {achievement.id}</p>
                {index >= 3 && (
                  <p className="text-xs text-gray-600 mt-1">Bloqueado</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">Nenhuma conquista encontrada</p>
        )}
      </Card>

      {/* Dicas */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="font-bold text-blue-900 mb-2">💡 Dica do Dia</h3>
        <p className="text-sm text-blue-800">
          Complete a seção de análise financeira para ganhar 100 pontos e desbloquear a conquista
          "Financista"!
        </p>
      </Card>
    </div>
  );
}
