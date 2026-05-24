import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Save, AlertCircle, CheckCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface ClassFormProps {
  classId?: number;
  initialData?: {
    name: string;
    enrollmentType: string;
    startDate?: string;
    endDate?: string;
    status?: string;
  };
  onSuccess?: () => void;
}

export default function ClassForm({ classId, initialData, onSuccess }: ClassFormProps) {
  const [formData, setFormData] = useState(
    initialData || {
      name: '',
      enrollmentType: 'InstituicaoEnsino',
      startDate: '',
      endDate: '',
      status: 'Ativa',
    }
  );
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = trpc.classes.create.useMutation();
  const updateMutation = trpc.classes.update.useMutation();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end <= start) {
        newErrors.endDate = 'Data final deve ser posterior à data inicial';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Corrija os erros no formulário');
      return;
    }

    setIsSaving(true);
    try {
      if (classId) {
        // Update
        await updateMutation.mutateAsync({
          id: classId,
          name: formData.name,
          enrollmentType: formData.enrollmentType,
          startDate: formData.startDate,
          endDate: formData.endDate,
          status: formData.status,
        });
        toast.success('Turma atualizada com sucesso!');
      } else {
        // Create
        await createMutation.mutateAsync({
          name: formData.name,
          enrollmentType: formData.enrollmentType,
          startDate: formData.startDate,
          endDate: formData.endDate,
        });
        toast.success('Turma criada com sucesso!');
        setFormData({
          name: '',
          enrollmentType: 'InstituicaoEnsino',
          startDate: '',
          endDate: '',
          status: 'Ativa',
        });
      }
      onSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao salvar turma';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    // Limpar erro ao editar
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{classId ? 'Editar Turma' : 'Criar Nova Turma'}</CardTitle>
        <CardDescription>
          {classId ? 'Atualize as informações da turma' : 'Preencha os dados da nova turma'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Turma *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Ex: 3º Ano A"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Tipo de Matrícula */}
          <div className="space-y-2">
            <Label htmlFor="enrollmentType">Tipo de Matrícula</Label>
            <Select
              value={formData.enrollmentType}
              onValueChange={(value) => handleChange('enrollmentType', value)}
            >
              <SelectTrigger id="enrollmentType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="InstituicaoEnsino">Instituição de Ensino</SelectItem>
                <SelectItem value="Projeto">Projeto</SelectItem>
                <SelectItem value="Workshop">Workshop</SelectItem>
                <SelectItem value="Mentoria">Mentoria</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Data Início</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Data Fim</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
                className={errors.endDate ? 'border-red-500' : ''}
              />
              {errors.endDate && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.endDate}
                </p>
              )}
            </div>
          </div>

          {/* Status */}
          {classId && (
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status || 'Ativa'}
                onValueChange={(value) => handleChange('status', value)}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ativa">Ativa</SelectItem>
                  <SelectItem value="Inativa">Inativa</SelectItem>
                  <SelectItem value="Concluida">Concluída</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={isSaving}
              className="flex-1"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Salvando...' : classId ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
