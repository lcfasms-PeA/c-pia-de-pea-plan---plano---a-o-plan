import { useAuth } from "@/_core/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, BarChart3, Trophy, TrendingUp, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function DashboardAdmin() {
  const { user } = useAuth();
  const { data: usersList, isLoading: usersLoading } = trpc.users.list.useQuery();
  const { data: classesList, isLoading: classesLoading } = trpc.classes.list.useQuery();
  const { data: plansData, isLoading: plansLoading } = trpc.businessPlans.list.useQuery();
  const { data: scoreData, isLoading: scoreLoading } = trpc.gamification.getSummary.useQuery();

  const stats = [
    {
      title: "Usuários Totais",
      value: usersLoading ? "..." : (usersList?.length || 0).toString(),
      icon: Users,
      color: "bg-blue-100",
      textColor: "text-blue-600",
    },
    {
      title: "Turmas Ativas",
      value: classesLoading ? "..." : (classesList?.length || 0).toString(),
      icon: BookOpen,
      color: "bg-green-100",
      textColor: "text-green-600",
    },
    {
      title: "Planos Criados",
      value: plansLoading ? "..." : (plansData?.length || 0).toString(),
      icon: BarChart3,
      color: "bg-purple-100",
      textColor: "text-purple-600",
    },
    {
      title: "Pontos Distribuídos",
      value: scoreLoading ? "..." : (scoreData?.totalPoints || 0).toString(),
      icon: Trophy,
      color: "bg-yellow-100",
      textColor: "text-yellow-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Admin</h1>
          <p className="text-gray-600 mt-2">Bem-vindo, {user?.name}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className={`${stat.textColor} w-6 h-6`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Usuários Recentes */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Usuários Recentes</h2>
            <Button variant="outline" size="sm">
              Ver Todos
            </Button>
          </div>
          {usersLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : usersList && usersList.length > 0 ? (
            <div className="space-y-3">
              {usersList.slice(0, 3).map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium">{u.name}</p>
                    <p className="text-sm text-gray-600">{u.email}</p>
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Nenhum usuário encontrado</p>
          )}
        </Card>

        {/* Ações Rápidas */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Ações Rápidas</h2>
          <div className="space-y-2">
            <Button variant="default" className="w-full justify-start">
              + Criar Instituição
            </Button>
            <Button variant="outline" className="w-full justify-start">
              + Adicionar Usuário
            </Button>
            <Button variant="outline" className="w-full justify-start">
              📊 Ver Relatórios
            </Button>
            <Button variant="outline" className="w-full justify-start">
              ⚙️ Configurações
            </Button>
          </div>
        </Card>
      </div>

      {/* Turmas Ativas */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Turmas Ativas</h2>
        {classesLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : classesList && classesList.length > 0 ? (
          <div className="space-y-3">
            {classesList.slice(0, 5).map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-3 border-b last:border-b-0"
              >
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-sm text-gray-600">Professor: {c.professorId}</p>
                </div>
                <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                  Ativa
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">Nenhuma turma encontrada</p>
        )}
      </Card>
    </div>
  );
}
