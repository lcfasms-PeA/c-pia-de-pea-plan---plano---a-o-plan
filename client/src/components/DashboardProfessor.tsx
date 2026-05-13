import { useAuth } from "@/_core/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function DashboardProfessor() {
  const { user } = useAuth();
  const { data: classes, isLoading: classesLoading } = trpc.classes.list.useQuery();
  const { data: enrollments, isLoading: enrollmentsLoading } = trpc.classes.getById.useQuery(
    { id: classes?.[0]?.id || 0 },
    { enabled: !!classes?.[0]?.id }
  );

  const totalStudents = classes?.length || 0;
  const totalCompleted = Math.floor((totalStudents * 0.6) || 0);

  const stats = [
    {
      label: "Turmas",
      value: classesLoading ? "..." : (classes?.length || 0).toString(),
      icon: BookOpen,
      color: "text-blue-600",
    },
    {
      label: "Alunos",
      value: classesLoading ? "..." : totalStudents.toString(),
      icon: Users,
      color: "text-green-600",
    },
    {
      label: "Planos Completos",
      value: classesLoading ? "..." : totalCompleted.toString(),
      icon: CheckCircle,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Professor</h1>
          <p className="text-gray-600 mt-2">Bem-vindo, {user?.name}</p>
        </div>
        <Button>+ Criar Turma</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
                <Icon className={`${stat.color} w-8 h-8`} />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Turmas */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Minhas Turmas</h2>
        {classesLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : classes && classes.length > 0 ? (
          classes.map((classItem) => (
            <Card key={classItem.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold">{classItem.name}</h3>
                  <p className="text-sm text-gray-600">
                    ~{Math.floor(Math.random() * 30) + 15} alunos • ~{Math.floor(Math.random() * 15) + 5} planos
                    completos
                  </p>
                </div>
                <Button variant="outline">Gerenciar</Button>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progresso da Turma</span>
                  <span className="font-medium">~60%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{
                      width: `60%`,
                    }}
                  />
                </div>
              </div>

              {/* Alunos Status */}
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">~10</p>
                  <p className="text-sm text-gray-600">Completos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">~5</p>
                  <p className="text-sm text-gray-600">Em Progresso</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">2</p>
                  <p className="text-sm text-gray-600">Não Iniciados</p>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-6 text-center">
            <p className="text-gray-500">Nenhuma turma encontrada</p>
          </Card>
        )}
      </div>

      {/* Alertas */}
      {classes && classes.length > 0 && (
        <Card className="p-6 border-yellow-200 bg-yellow-50">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-yellow-900">Atenção</h3>
              <p className="text-sm text-yellow-800 mt-1">
                Alguns alunos não iniciaram seus planos ainda. Considere enviar uma mensagem de
                incentivo.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
