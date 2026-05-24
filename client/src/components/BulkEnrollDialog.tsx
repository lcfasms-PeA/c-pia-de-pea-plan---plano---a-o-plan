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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Upload } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { parseBulkEnrollData } from '@/lib/parseBulkEnroll';

interface BulkEnrollDialogProps {
  classId: number;
  className: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function BulkEnrollDialog({
  classId,
  className,
  open = false,
  onOpenChange,
  onSuccess,
}: BulkEnrollDialogProps) {
  const [tab, setTab] = useState<'text' | 'csv'>('text');
  const [input, setInput] = useState('');
  const [parsedStudents, setParsedStudents] = useState<Array<{ id: number; email?: string; name?: string }>>([]);
  const [parseError, setParseError] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const bulkEnrollMutation = trpc.classes.bulkEnroll.useMutation();

  const handleParse = async () => {
    setParseError('');
    setParsedStudents([]);

    if (!input.trim()) {
      setParseError('Por favor, preencha os dados');
      return;
    }

    try {
      const source = tab === 'csv' ? 'csv' : 'text';
      const students = await parseBulkEnrollData(source, input);
      setParsedStudents(students);

      if (students.length > 0) {
        toast.success(`${students.length} aluno(s) lido(s) com sucesso!`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao processar dados';
      setParseError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleImport = async () => {
    if (parsedStudents.length === 0) {
      toast.error('Nenhum aluno para importar');
      return;
    }

    setIsImporting(true);
    try {
      const studentIds = parsedStudents.map(s => s.id);
      const result = await bulkEnrollMutation.mutateAsync({
        classId,
        studentIds,
      });

      toast.success(
        `${result.enrolled} aluno(s) matriculado(s)${result.skipped > 0 ? `, ${result.skipped} já matriculado(s)` : ''}`
      );

      setInput('');
      setParsedStudents([]);
      onSuccess?.();
      onOpenChange?.(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao importar alunos';
      toast.error(errorMessage);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Importar Alunos em Lote</DialogTitle>
          <DialogDescription>
            Turma: <strong>{className}</strong>
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as 'text' | 'csv')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text">Por Texto</TabsTrigger>
            <TabsTrigger value="csv">Por CSV</TabsTrigger>
          </TabsList>

          {/* Aba: Texto */}
          <TabsContent value="text" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">IDs de Alunos</CardTitle>
                <CardDescription>
                  Digite os IDs separados por vírgula ou quebra de linha
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Exemplo:&#10;123&#10;456&#10;789&#10;&#10;Ou: 123, 456, 789"
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    setParseError('');
                    setParsedStudents([]);
                  }}
                  rows={6}
                  className="font-mono text-sm"
                />
                <Button onClick={handleParse} variant="outline" className="w-full">
                  Processar IDs
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba: CSV */}
          <TabsContent value="csv" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Arquivo CSV</CardTitle>
                <CardDescription>
                  Cole o conteúdo do arquivo CSV com cabeçalho
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 p-3 rounded text-sm font-mono text-muted-foreground">
                  id,email,name<br />
                  123,joao@email.com,João Silva<br />
                  456,maria@email.com,Maria Santos
                </div>
                <Textarea
                  placeholder="Cole o conteúdo do CSV aqui..."
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    setParseError('');
                    setParsedStudents([]);
                  }}
                  rows={6}
                  className="font-mono text-sm"
                />
                <Button onClick={handleParse} variant="outline" className="w-full">
                  Processar CSV
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Erro */}
        {parseError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{parseError}</AlertDescription>
          </Alert>
        )}

        {/* Resultados */}
        {parsedStudents.length > 0 && (
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                {parsedStudents.length} aluno(s) processado(s)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {parsedStudents.slice(0, 10).map((student, idx) => (
                  <div key={idx} className="text-sm p-2 bg-white rounded border border-green-200">
                    <p>
                      <strong>ID:</strong> {student.id}
                      {student.email && (
                        <>
                          {' '}| <strong>Email:</strong> {student.email}
                        </>
                      )}
                      {student.name && (
                        <>
                          {' '}| <strong>Nome:</strong> {student.name}
                        </>
                      )}
                    </p>
                  </div>
                ))}
                {parsedStudents.length > 10 && (
                  <p className="text-xs text-muted-foreground italic">
                    ... e mais {parsedStudents.length - 10} aluno(s)
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setInput('');
              setParsedStudents([]);
              setParseError('');
              onOpenChange?.(false);
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleImport}
            disabled={parsedStudents.length === 0 || isImporting}
          >
            <Upload className="w-4 h-4 mr-2" />
            {isImporting ? 'Importando...' : 'Confirmar Importação'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
