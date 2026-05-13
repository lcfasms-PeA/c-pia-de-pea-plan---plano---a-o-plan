import { useAuth } from "@/_core/hooks/useAuth";
import DashboardAdmin from "@/components/DashboardAdmin";
import DashboardProfessor from "@/components/DashboardProfessor";
import DashboardAluno from "@/components/DashboardAluno";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Faça login para acessar o dashboard</p>
      </div>
    );
  }

  // Roteamento condicional por papel
  switch (user.role) {
    case "admin_geral":
    case "admin":
      return <DashboardAdmin />;
    case "coordenador":
    case "professor":
      return <DashboardProfessor />;
    case "aluno_individual":
    case "aluno_lider":
    case "aluno_editor":
    case "aluno_visualizador":
    case "user":
    default:
      return <DashboardAluno />;
  }
}
