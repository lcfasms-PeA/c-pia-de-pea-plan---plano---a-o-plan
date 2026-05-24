import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Trash2, Upload, Mail, User, Calendar } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface ClassStudentsProps {
  classId: number;
  className: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onBulkEnroll?: (classId: number) => void;
}

interface StudentEnrollment {
  studentId: number;
  studentName: string;
  studentEmail: string;
  enrollmentDate: Date;
}

export default function ClassStudents({
  classId,
  className,
  open = false,
  onOpenChange,
  onBulkEnroll,
}: ClassStudentsProps) {
  const [studentToRemove, setStudentToRemove] = useState<number | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const { data: classData, refetch: refetchClass } = trpc.classes.getById.useQuery(
    { id: classId },
    { enabled: open }
  );

  const removeStudentMutation = trpc.classes.removeStudent.useMutation();

  const handleRemoveStudent = async (studentId: number) => {
    setIsRemoving(true);
    try {
      await removeStudentMutation.mutateAsync({
        classId,
        studentId,
      });
      toast.success('Aluno removido da turma!');
      setStudentToRemove(null);
      refetchClass();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao remover aluno';
      toast.error(errorMessage);
    } finally {
      setIsRemoving(false);
    }
  };

  const students = classData?.students || [];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-96">
          <DialogHeader>
            <DialogTitle>Alunos da Turma: {className}</DialogTitle>
            <DialogDescription>
              Gerenciamento de alunos matriculados nesta turma
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Ações */}
            <div className="flex gap-2">
              <Button
                onClick={() => onBulkEnroll?.(classId)}
                className="flex-1"
              >
                <Upload className="w-4 h-4 mr-2" />
                Importar Alunos
              </Button>
            </div>

            {/* Lista de Alunos */}
            {students.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    Nenhum aluno matriculado nesta turma
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {students.map((enrollment: any) => (
                  <Card key={enrollment.studentId} className="hover:shadow-sm transition-shadow">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <p className="font-semibold truncate">
                              {/* Nome do aluno - seria necessário buscar */}
                              Aluno #{enrollment.studentId}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="w-3 h-3" />
                            <span className="truncate">{enrollment.studentEmail || 'Email não disponível'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <Calendar className="w-3 h-3" />
                            <span>
                              Matriculado em{' '}
                              {new Date(enrollment.enrollmentDate).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setStudentToRemove(enrollment.studentId)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Resumo */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4 pb-4">
                <p className="text-sm">
                  <strong>{students.length}</strong> aluno{students.length !== 1 ? 's' : ''}{' '}
                  matriculado{students.length !== 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange?.(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmação de Remoção */}
      <AlertDialog open={studentToRemove !== null} onOpenChange={(open) => {
        if (!open) setStudentToRemove(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Aluno?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este aluno da turma "{className}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (studentToRemove !== null) {
                  handleRemoveStudent(studentToRemove);
                }
              }}
              disabled={isRemoving}
              className="bg-red-600 hover:bg-red-700"
            >
              {isRemoving ? 'Removendo...' : 'Remover'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
