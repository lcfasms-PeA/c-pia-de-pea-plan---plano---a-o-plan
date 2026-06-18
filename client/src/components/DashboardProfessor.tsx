import { useAuth } from "@/_core/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

export default function DashboardProfessor() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { data: classes, isLoading: classesLoading } = trpc.classes.list.useQuery();

  const totalStudents = (classes || []).reduce(
    (sum, classItem) => sum + (classItem.studentCount || 0),
    0
  );
  const activeClasses = (classes || []).filter((classItem) => classItem.status === "Ativa").length;

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
      label: "Turmas Ativas",
      value: classesLoading ? "..." : activeClasses.toString(),
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
        <Button onClick={() => navigate("/turmas")}>+ Criar Turma</Button>
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
                    {classItem.studentCount || 0} aluno(s) matriculado(s)
                  </p>
                </div>
                <Button variant="outline" onClick={() => navigate("/turmas")}>Gerenciar</Button>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{classItem.studentCount || 0}</p>
                  <p className="text-sm text-gray-600">Matriculados</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">{classItem.startDate ? "Sim" : "-"}</p>
                  <p className="text-sm text-gray-600">Com início</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{classItem.status || "-"}</p>
                  <p className="text-sm text-gray-600">Status</p>
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
