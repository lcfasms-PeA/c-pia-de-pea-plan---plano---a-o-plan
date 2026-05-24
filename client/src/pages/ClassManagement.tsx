import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, BookOpen } from 'lucide-react';
import ClassForm from '@/components/ClassForm';
import ClassList from '@/components/ClassList';
import ClassStudents from '@/components/ClassStudents';
import BulkEnrollDialog from '@/components/BulkEnrollDialog';

interface EditingClass {
  id: number;
  name: string;
  enrollmentType: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

export default function ClassManagement() {
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [editingClass, setEditingClass] = useState<EditingClass | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedClassName, setSelectedClassName] = useState('');
  const [bulkEnrollClassId, setBulkEnrollClassId] = useState<number | null>(null);
  const [bulkEnrollClassName, setBulkEnrollClassName] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEditClass = (classId: number) => {
    // TODO: buscar dados completos da turma para edição
    setEditingClass({
      id: classId,
      name: '',
      enrollmentType: '',
    });
    setActiveTab('create');
  };

  const handleManageStudents = (classId: number, className: string) => {
    setSelectedClassId(classId);
    setSelectedClassName(className);
  };

  const handleBulkEnroll = (classId: number, className: string) => {
    setBulkEnrollClassId(classId);
    setBulkEnrollClassName(className);
  };

  const handleFormSuccess = () => {
    setEditingClass(null);
    setRefreshKey(prev => prev + 1);
    setActiveTab('list');
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-2">
              <BookOpen className="w-8 h-8" />
              Gestão de Turmas
            </h1>
            <p className="text-muted-foreground mt-2">
              Crie, edite e gerencie suas turmas e alunos
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'list' | 'create')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">Minhas Turmas</TabsTrigger>
            <TabsTrigger value="create">
              {editingClass ? 'Editar Turma' : 'Criar Nova Turma'}
            </TabsTrigger>
          </TabsList>

          {/* Tab: Minhas Turmas */}
          <TabsContent value="list" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Minhas Turmas</CardTitle>
                <CardDescription>
                  Visualize, edite e gerencie todas as suas turmas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ClassList
                  key={refreshKey}
                  onEdit={handleEditClass}
                  onManageStudents={(classId: number) => {
                    // Buscar nome da turma
                    handleManageStudents(classId, 'Turma');
                  }}
                  onBulkEnroll={(classId: number) => {
                    handleBulkEnroll(classId, 'Turma');
                  }}
                  onRefresh={() => setRefreshKey(prev => prev + 1)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Criar/Editar Turma */}
          <TabsContent value="create" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <ClassForm
                  classId={editingClass?.id}
                  initialData={
                    editingClass
                      ? {
                          name: editingClass.name,
                          enrollmentType: editingClass.enrollmentType,
                          startDate: editingClass.startDate,
                          endDate: editingClass.endDate,
                          status: editingClass.status,
                        }
                      : undefined
                  }
                  onSuccess={handleFormSuccess}
                />
              </div>

              {/* Info Box */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Dicas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <p className="font-semibold mb-1">📝 Nome da Turma</p>
                      <p className="text-muted-foreground">
                        Use um nome descritivo, ex: "3º Ano A" ou "Projeto X - 2024"
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold mb-1">📅 Datas</p>
                      <p className="text-muted-foreground">
                        A data de fim deve ser posterior à data de início
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold mb-1">👥 Alunos</p>
                      <p className="text-muted-foreground">
                        Adicione alunos após criar a turma usando a importação em lote
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-base">ℹ️ Próximos Passos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p>1. Crie uma nova turma</p>
                    <p>2. Clique em "Alunos" para gerenciar</p>
                    <p>3. Use "Importar" para adicionar em lote</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <ClassStudents
        classId={selectedClassId || 0}
        className={selectedClassName}
        open={selectedClassId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedClassId(null);
          }
        }}
        onBulkEnroll={() => {
          if (selectedClassId) {
            handleBulkEnroll(selectedClassId, selectedClassName);
          }
        }}
      />

      <BulkEnrollDialog
        classId={bulkEnrollClassId || 0}
        className={bulkEnrollClassName}
        open={bulkEnrollClassId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setBulkEnrollClassId(null);
          }
        }}
        onSuccess={() => {
          setRefreshKey(prev => prev + 1);
          setSelectedClassId(null);
        }}
      />
    </div>
  );
}
