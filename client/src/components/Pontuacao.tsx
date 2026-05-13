import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Zap, TrendingUp } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Pontuacao() {
  const { data: score, isLoading } = trpc.gamification.getScore.useQuery();

  const xpProgress = useMemo(() => {
    if (!score) return 0;
    const nextLevelXp = (score.level + 1) * 1000;
    const currentLevelXp = score.level * 1000;
    const xpInLevel = score.xp - currentLevelXp;
    const xpNeeded = nextLevelXp - currentLevelXp;
    return (xpInLevel / xpNeeded) * 100;
  }, [score]);

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">Carregando pontuação...</div>
      </Card>
    );
  }

  if (!score) {
    return (
      <Card className="p-6">
        <p className="text-center text-gray-500">Nenhuma pontuação encontrada</p>
      </Card>
    );
  }

  const nextLevelXp = (score.level + 1) * 1000;
  const currentLevelXp = score.level * 1000;
  const xpInLevel = score.xp - currentLevelXp;
  const xpNeeded = nextLevelXp - currentLevelXp;

  return (
    <div className="space-y-4">
      {/* Nível e Pontos */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600">{score.level}</div>
            <p className="text-sm text-gray-600 mt-1">Nível</p>
          </div>
          <div className="text-center border-l border-r border-gray-300">
            <div className="text-4xl font-bold text-blue-600">{score.points}</div>
            <p className="text-sm text-gray-600 mt-1">Pontos</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600">{score.xp}</div>
            <p className="text-sm text-gray-600 mt-1">XP Total</p>
          </div>
        </div>
      </Card>

      {/* Progresso para Próximo Nível */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          <h3 className="font-semibold">Progresso para Nível {score.level + 1}</h3>
        </div>

        <div className="space-y-2">
          <Progress value={xpProgress} className="h-3" />
          <p className="text-sm text-gray-600">
            {xpInLevel} / {xpNeeded} XP
          </p>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <Zap className="w-4 h-4 inline mr-1" />
            Faltam <strong>{xpNeeded - xpInLevel} XP</strong> para o próximo nível!
          </p>
        </div>
      </Card>

      {/* Dicas */}
      <Card className="p-4 bg-amber-50 border border-amber-200">
        <p className="text-sm text-amber-900">
          💡 <strong>Como ganhar pontos:</strong>
        </p>
        <ul className="text-sm text-amber-800 mt-2 space-y-1 ml-4">
          <li>• Complete seções do plano: +50 pts</li>
          <li>• Desbloqueie conquistas: +100-500 pts</li>
          <li>• Seja líder de turma: +200 pts</li>
        </ul>
      </Card>
    </div>
  );
}
