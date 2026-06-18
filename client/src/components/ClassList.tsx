import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Edit, Trash2, Users, Upload, Calendar, BookOpen } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface ClassItemProps {
  class: {
    id: number;
    name: string;
    enrollmentType: string;
    startDate?: Date;
    endDate?: Date;
    status: string;
    studentCount?: number;
  };
  studentCount: number;
  onEdit?: (classItem: ClassItemProps["class"]) => void;
  onManageStudents?: (classItem: ClassItemProps["class"]) => void;
  onBulkEnroll?: (classItem: ClassItemProps["class"]) => void;
  onDelete?: (classId: number) => void;
  onRefresh?: () => void;
}

function ClassCard({
  class: classItem,
  studentCount,
  onEdit,
  onManageStudents,
  onBulkEnroll,
  onDelete,
  onRefresh,
}: ClassItemProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // Aqui seria necessário um endpoint delete
      // Por enquanto, apenas mostrar mensagem
      toast.info('Funcionalidade de deleção será implementada');
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const startDate = classItem.startDate ? new Date(classItem.startDate) : null;
  const endDate = classItem.endDate ? new Date(classItem.endDate) : null;

  const statusColor =
    classItem.status === 'Ativa'
      ? 'bg-green-100 text-green-800'
      : classItem.status === 'Concluida'
        ? 'bg-blue-100 text-blue-800'
        : 'bg-gray-100 text-gray-800';

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{classItem.name}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <BookOpen className="w-4 h-4" />
                {classItem.enrollmentType}
              </CardDescription>
            </div>
            <Badge className={statusColor}>{classItem.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Datas */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            {startDate && (
              <div>
                <p className="text-muted-foreground">Início</p>
                <p className="font-medium flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {startDate.toLocaleDateString('pt-BR')}
                </p>
              </div>
            )}
            {endDate && (
              <div>
                <p className="text-muted-foreground">Fim</p>
                <p className="font-medium flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {endDate.toLocaleDateString('pt-BR')}
                </p>
              </div>
            )}
          </div>

          {/* Alunos */}
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-muted-foreground">Alunos Matriculados</p>
            <p className="text-2xl font-bold text-blue-600 flex items-center gap-2">
              <Users className="w-5 h-5" />
              {studentCount}
            </p>
          </div>

          {/* Ações */}
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit?.(classItem)}
              className="flex-1"
            >
              <Edit className="w-4 h-4 mr-1" />
              Editar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onManageStudents?.(classItem)}
              className="flex-1"
            >
              <Users className="w-4 h-4 mr-1" />
              Alunos
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onBulkEnroll?.(classItem)}
              className="flex-1"
            >
              <Upload className="w-4 h-4 mr-1" />
              Importar
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar Turma?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar "{classItem.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deletando...' : 'Deletar'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

interface ClassListProps {
  onEdit?: (classItem: {
    id: number;
    name: string;
    enrollmentType: string;
    startDate?: Date;
    endDate?: Date;
    status: string;
    studentCount?: number;
  }) => void;
  onManageStudents?: (classItem: {
    id: number;
    name: string;
    enrollmentType: string;
    startDate?: Date;
    endDate?: Date;
    status: string;
    studentCount?: number;
  }) => void;
  onBulkEnroll?: (classItem: {
    id: number;
    name: string;
    enrollmentType: string;
    startDate?: Date;
    endDate?: Date;
    status: string;
    studentCount?: number;
  }) => void;
  onRefresh?: () => void;
}

export default function ClassList({
  onEdit,
  onManageStudents,
  onBulkEnroll,
  onRefresh,
}: ClassListProps) {
  const { data: classes, isLoading } = trpc.classes.list.useQuery();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Carregando turmas...</p>
        </CardContent>
      </Card>
    );
  }

  if (!classes || classes.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Nenhuma turma encontrada</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        {classes.length} turma{classes.length !== 1 ? 's' : ''} encontrada{classes.length !== 1 ? 's' : ''}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {classes.map((classItem: any) => (
          <ClassCard
            key={classItem.id}
            class={classItem}
            studentCount={classItem.studentCount || 0}
            onEdit={onEdit}
            onManageStudents={onManageStudents}
            onBulkEnroll={onBulkEnroll}
            onRefresh={onRefresh}
          />
        ))}
      </div>
    </div>
  );
}
