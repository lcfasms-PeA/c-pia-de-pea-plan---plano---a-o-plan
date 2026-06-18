import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { skipToken } from "@tanstack/react-query";

interface RankingProps {
  classId?: number;
}

export default function Ranking({ classId }: RankingProps) {
  const { data: ranking, isLoading } = trpc.gamification.getRanking.useQuery(
    classId ? { classId } : skipToken
  );

  const rankedUsers = useMemo(() => {
    if (!ranking) return [];
    return ranking
      .map((user, index) => ({
        ...user,
        medal: index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "",
      }))
      .slice(0, 10);
  }, [ranking]);

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">Carregando ranking...</div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-6 h-6 text-yellow-500" />
        <h2 className="text-2xl font-bold">Ranking da Turma</h2>
      </div>

      <div className="space-y-2">
        {rankedUsers.length === 0 ? (
          <p className="text-center text-gray-500 py-8">Nenhum aluno no ranking ainda</p>
        ) : (
          rankedUsers.map((user) => (
            <div
              key={user.userId}
              className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="w-8 h-8 flex items-center justify-center font-bold text-lg">
                  {user.medal || `#${user.position}`}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{user.userName}</p>
                  <p className="text-xs text-gray-600">Nível {user.level || 1}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="font-bold text-lg text-purple-600">{user.points || 0}</p>
                  <p className="text-xs text-gray-500">pontos</p>
                </div>
                <Badge
                  variant="outline"
                  className={`${
                    user.position === 1
                      ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                      : user.position === 2
                      ? "bg-gray-100 text-gray-800 border-gray-300"
                      : user.position === 3
                      ? "bg-orange-100 text-orange-800 border-orange-300"
                      : "bg-blue-100 text-blue-800 border-blue-300"
                  }`}
                >
                  {user.position}º
                </Badge>
              </div>
            </div>
          ))
        )}
      </div>

      {rankedUsers.length > 0 && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            💡 <strong>Dica:</strong> Complete seções do plano e desbloqueie conquistas para ganhar pontos!
          </p>
        </div>
      )}
    </Card>
  );
}
