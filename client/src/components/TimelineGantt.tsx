import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus, Save, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface Task {
  id: string;
  titulo: string;
  descricao: string;
  dataInicio: string; // YYYY-MM-DD
  dataFim: string; // YYYY-MM-DD
  responsavel: string;
  status: "nao_iniciada" | "em_progresso" | "concluida" | "atrasada";
  progresso: number; // 0-100
  dependencias: string[]; // IDs de outras tarefas
}

interface TimelineGanttProps {
  planId: number;
  initialTasks?: Task[];
}

const STATUS_LABELS = {
  nao_iniciada: "Não Iniciada",
  em_progresso: "Em Progresso",
  concluida: "Concluída",
  atrasada: "Atrasada",
};

const STATUS_COLORS = {
  nao_iniciada: "bg-gray-100 border-gray-300",
  em_progresso: "bg-blue-100 border-blue-300",
  concluida: "bg-green-100 border-green-300",
  atrasada: "bg-red-100 border-red-300",
};

const getMonthDays = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

const getDayOfMonth = (dateStr: string) => {
  return new Date(dateStr).getDate();
};

const getMonthName = (date: Date) => {
  return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
};

export default function TimelineGantt({ planId, initialTasks = [] }: TimelineGanttProps) {
  const timelineMutation = trpc.strategic.timeline.save.useMutation();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [startDate, setStartDate] = useState(
    initialTasks.length > 0
      ? initialTasks[0].dataInicio
      : new Date().toISOString().split("T")[0]
  );

  const handleAddTask = () => {
    const newTask: Task = {
      id: Math.random().toString(),
      titulo: "",
      descricao: "",
      dataInicio: startDate,
      dataFim: startDate,
      responsavel: "",
      status: "nao_iniciada",
      progresso: 0,
      dependencias: [],
    };
    setTasks([...tasks, newTask]);
    setSelectedTask(newTask.id);
  };

  const handleRemoveTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
    if (selectedTask === id) setSelectedTask(null);
  };

  const handleUpdateTask = (id: string, updates: Partial<Task>) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const handleToggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedTasks(newExpanded);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await timelineMutation.mutateAsync({
        planId,
        tarefas: tasks,
      });
      toast.success("Cronograma salvo com sucesso!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao salvar cronograma";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const getGanttPosition = (date: string, minDate: Date, maxDate: Date) => {
    const taskDate = new Date(date);
    const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysPassed = Math.ceil((taskDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
    return (daysPassed / totalDays) * 100;
  };

  const getGanttWidth = (dataInicio: string, dataFim: string, minDate: Date, maxDate: Date) => {
    const startDate = new Date(dataInicio);
    const endDate = new Date(dataFim);
    const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
    const taskDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max((taskDays / totalDays) * 100, 2);
  };

  // Calcular datas mín e máx
  const allDates = tasks.flatMap((t) => [t.dataInicio, t.dataFim]);
  const minDate = allDates.length > 0 ? new Date(Math.min(...allDates.map((d) => new Date(d).getTime()))) : new Date();
  const maxDate = allDates.length > 0 ? new Date(Math.max(...allDates.map((d) => new Date(d).getTime()))) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Cronograma do Projeto</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleAddTask}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Tarefa
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Controle de Data Inicial */}
      <Card className="p-4 bg-blue-50 border-2 border-blue-200">
        <label className="block text-sm font-semibold mb-2">Data Inicial do Cronograma:</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border rounded px-3 py-2"
        />
      </Card>

      {/* Gráfico de Gantt */}
      {tasks.length > 0 && (
        <Card className="p-6 overflow-x-auto">
          <h3 className="text-lg font-bold mb-4">Visualização de Gantt</h3>

          <div className="min-w-full">
            {/* Cabeçalho com datas */}
            <div className="flex mb-4">
              <div className="w-64 flex-shrink-0 pr-4">
                <div className="font-bold text-sm">Tarefa</div>
              </div>
              <div className="flex-1 flex">
                {/* Gerar colunas de meses */}
                {Array.from({ length: 4 }).map((_, i) => {
                  const monthDate = new Date(minDate);
                  monthDate.setMonth(monthDate.getMonth() + i);
                  const daysInMonth = getMonthDays(monthDate);
                  return (
                    <div
                      key={i}
                      className="border-l border-gray-300 text-xs font-semibold text-center py-2"
                      style={{ width: `${(daysInMonth / 120) * 100}%` }}
                    >
                      {getMonthName(monthDate)}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tarefas */}
            {tasks.map((task) => (
              <div key={task.id} className="mb-2">
                <div className="flex items-center">
                  <div className="w-64 flex-shrink-0 pr-4">
                    <div
                      className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded"
                      onClick={() => handleToggleExpanded(task.id)}
                    >
                      {expandedTasks.has(task.id) ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                      <div className="flex-1 truncate">
                        <div className="font-semibold text-sm truncate">{task.titulo || "Sem título"}</div>
                        <div className="text-xs text-gray-500">{task.responsavel}</div>
                      </div>
                    </div>
                  </div>

                  {/* Barra de Gantt */}
                  <div className="flex-1 h-10 bg-gray-100 rounded relative">
                    <div
                      className={`h-full rounded flex items-center justify-center text-xs font-bold text-white transition ${
                        task.status === "concluida"
                          ? "bg-green-500"
                          : task.status === "atrasada"
                            ? "bg-red-500"
                            : task.status === "em_progresso"
                              ? "bg-blue-500"
                              : "bg-gray-400"
                      }`}
                      style={{
                        left: `${getGanttPosition(task.dataInicio, minDate, maxDate)}%`,
                        width: `${getGanttWidth(task.dataInicio, task.dataFim, minDate, maxDate)}%`,
                      }}
                    >
                      {task.progresso > 0 && `${task.progresso}%`}
                    </div>
                  </div>
                </div>

                {/* Detalhes expandidos */}
                {expandedTasks.has(task.id) && (
                  <div className={`p-4 bg-gray-50 rounded border-2 ${STATUS_COLORS[task.status]} mt-2`}>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-semibold mb-1">Título:</label>
                        <Input
                          value={task.titulo}
                          onChange={(e) => handleUpdateTask(task.id, { titulo: e.target.value })}
                          placeholder="Título da tarefa"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-1">Responsável:</label>
                        <Input
                          value={task.responsavel}
                          onChange={(e) => handleUpdateTask(task.id, { responsavel: e.target.value })}
                          placeholder="Nome do responsável"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-1">Data Início:</label>
                        <input
                          type="date"
                          value={task.dataInicio}
                          onChange={(e) => handleUpdateTask(task.id, { dataInicio: e.target.value })}
                          className="w-full border rounded px-2 py-1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-1">Data Fim:</label>
                        <input
                          type="date"
                          value={task.dataFim}
                          onChange={(e) => handleUpdateTask(task.id, { dataFim: e.target.value })}
                          className="w-full border rounded px-2 py-1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-1">Status:</label>
                        <select
                          value={task.status}
                          onChange={(e) =>
                            handleUpdateTask(task.id, { status: e.target.value as Task["status"] })
                          }
                          className="w-full border rounded px-2 py-1"
                        >
                          {Object.entries(STATUS_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-1">Progresso (%):</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={task.progresso}
                          onChange={(e) =>
                            handleUpdateTask(task.id, { progresso: parseInt(e.target.value) })
                          }
                          className="w-full border rounded px-2 py-1"
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-semibold mb-1">Descrição:</label>
                      <textarea
                        value={task.descricao}
                        onChange={(e) => handleUpdateTask(task.id, { descricao: e.target.value })}
                        placeholder="Descrição da tarefa"
                        className="w-full border rounded px-2 py-1 min-h-20"
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveTask(task.id)}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Remover
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleToggleExpanded(task.id)}
                      >
                        Fechar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Lista de Tarefas */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">Tarefas</h3>

        {tasks.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhuma tarefa adicionada. Clique em "Adicionar Tarefa" para começar.</p>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`p-3 rounded border-2 cursor-pointer transition ${
                  selectedTask === task.id
                    ? "border-blue-500 bg-blue-50"
                    : STATUS_COLORS[task.status]
                }`}
                onClick={() => setSelectedTask(task.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-semibold">{task.titulo || "Sem título"}</div>
                    <div className="text-sm text-gray-600">
                      {task.dataInicio} a {task.dataFim} • {task.responsavel}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 bg-gray-300 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-full rounded-full"
                          style={{ width: `${task.progresso}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold">{task.progresso}%</span>
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <div className="text-xs font-semibold px-2 py-1 rounded bg-white">
                      {STATUS_LABELS[task.status]}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
