import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award } from "lucide-react";
import { trpc } from "@/lib/trpc";

const ACHIEVEMENT_ICONS: Record<string, string> = {
  "Primeiro Passo": "🎯",
  "Plano Completo": "✅",
  "Estrategista": "🧠",
  "Financista": "💰",
  "Líder de Turma": "👑",
  "Inovador": "💡",
  "Persistente": "🔥",
  "Colaborador": "🤝",
  "Mestre": "🎓",
  "Campeão": "🏆",
};

export default function Conquistas() {
  const { data: achievements, isLoading } = trpc.gamification.getAchievements.useQuery();
  const { data: summary, isLoading: summaryLoading } = trpc.gamification.getSummary.useQuery();

  const unlockedAchievements = useMemo(() => {
    if (!achievements) return [];
    return achievements || [];
  }, [achievements]);

  const nextAchievements = summary?.nextAchievements || [];

  if (isLoading || summaryLoading) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">Carregando conquistas...</div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-6 h-6 text-yellow-500" />
          <h2 className="text-2xl font-bold">Conquistas Desbloqueadas</h2>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-center">
            <p className="text-3xl font-bold text-yellow-700">{unlockedAchievements.length}</p>
            <p className="text-sm text-yellow-900">Desbloqueadas</p>
          </div>
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-center">
            <p className="text-3xl font-bold text-blue-700">{nextAchievements.length}</p>
            <p className="text-sm text-blue-900">Próximas metas</p>
          </div>
        </div>

        {unlockedAchievements.length === 0 ? (
          <div className="space-y-4 py-2">
            <p className="text-center text-gray-500">Nenhuma conquista desbloqueada ainda</p>
            {nextAchievements.length > 0 && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="mb-3 text-sm font-semibold text-blue-900">Próximas conquistas sugeridas</p>
                <div className="space-y-3">
                  {nextAchievements.map((achievement) => (
                    <div key={achievement.id} className="rounded-md bg-white p-3">
                      <p className="font-medium">{achievement.nome}</p>
                      <p className="text-sm text-gray-600">{achievement.criterio}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {unlockedAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex flex-col items-center p-4 bg-gradient-to-b from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-300 hover:shadow-lg transition-shadow"
                >
                  <div className="text-4xl mb-2">{achievement.icone || ACHIEVEMENT_ICONS[achievement.nome] || "⭐"}</div>
                  <p className="font-semibold text-center text-sm">{achievement.nome}</p>
                  <p className="text-xs text-gray-600 text-center mt-1">{achievement.descricao || "Conquista"}</p>
                  <Badge className="mt-2 bg-yellow-500 text-white">+{achievement.pontos || 0} pts</Badge>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                💡 <strong>Dica:</strong> Você já desbloqueou {unlockedAchievements.length} conquista(s). Continue evoluindo para liberar as próximas.
              </p>
            </div>

            {nextAchievements.length > 0 && (
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="mb-3 text-sm font-semibold text-gray-900">Próximas conquistas</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {nextAchievements.map((achievement) => (
                    <div key={achievement.id} className="rounded-md bg-gray-50 p-3">
                      <p className="font-medium">{achievement.nome}</p>
                      <p className="text-sm text-gray-600">{achievement.criterio}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
