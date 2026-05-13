import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus, Save, Loader2, GripVertical } from "lucide-react";
import { trpc } from "@/lib/trpc";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SWOTData {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

interface SWOTEditorProps {
  planId: number;
  initialData?: SWOTData;
}

interface SortableItemProps {
  id: string;
  value: string;
  category: keyof SWOTData;
  index: number;
  onRemove: (category: keyof SWOTData, index: number) => void;
  onChange: (category: keyof SWOTData, index: number, value: string) => void;
}

function SortableItem({ id, value, category, index, onRemove, onChange }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: String(id) });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex gap-2 items-center p-2 bg-white rounded border ${
        isDragging ? "shadow-lg border-gray-400" : "border-gray-200"
      }`}
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="w-4 h-4 text-gray-400" />
      </div>
      <Input
        value={value}
        onChange={(e) => onChange(category, index, e.target.value)}
        placeholder={`Digite um item`}
        className="flex-1"
      />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(category, index)}
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}

export default function SWOTEditor({ planId, initialData }: SWOTEditorProps) {
  const [swotData, setSWOTData] = useState<SWOTData>(
    initialData || {
      strengths: [],
      weaknesses: [],
      opportunities: [],
      threats: [],
    }
  );

  const [isSaving, setIsSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const categories = [
    { key: "strengths" as const, label: "Forças", color: "bg-green-50", borderColor: "border-green-200", textColor: "text-green-700" },
    { key: "weaknesses" as const, label: "Fraquezas", color: "bg-red-50", borderColor: "border-red-200", textColor: "text-red-700" },
    { key: "opportunities" as const, label: "Oportunidades", color: "bg-blue-50", borderColor: "border-blue-200", textColor: "text-blue-700" },
    { key: "threats" as const, label: "Ameaças", color: "bg-yellow-50", borderColor: "border-yellow-200", textColor: "text-yellow-700" },
  ];

  const handleAddItem = (category: keyof SWOTData) => {
    setSWOTData((prev) => ({
      ...prev,
      [category]: [...prev[category], ""],
    }));
  };

  const handleRemoveItem = (category: keyof SWOTData, index: number) => {
    setSWOTData((prev) => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index),
    }));
  };

  const handleChangeItem = (category: keyof SWOTData, index: number, value: string) => {
    setSWOTData((prev) => {
      const updated = [...prev[category]];
      updated[index] = value;
      return { ...prev, [category]: updated };
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const activeCategory = active.id.toString().split("-")[0] as keyof SWOTData;
    const overCategory = over.id.toString().split("-")[0] as keyof SWOTData;
    const activeIndex = parseInt(active.id.toString().split("-")[1]);
    const overIndex = parseInt(over.id.toString().split("-")[1]);

    if (activeCategory === overCategory) {
      setSWOTData((prev) => ({
        ...prev,
        [activeCategory]: arrayMove(prev[activeCategory], activeIndex, overIndex),
      }));
    } else {
      // Mover item entre categorias
      setSWOTData((prev) => {
        const newData = { ...prev };
        const [movedItem] = newData[activeCategory].splice(activeIndex, 1);
        newData[overCategory].splice(overIndex, 0, movedItem);
        return newData;
      });
    }
  };

  const saveSWOTMutation = trpc.strategic.swot.save.useMutation();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveSWOTMutation.mutateAsync({
        planId,
        forcas: swotData.strengths.map((desc) => ({ id: Math.random().toString(), descricao: desc })),
        fraquezas: swotData.weaknesses.map((desc) => ({ id: Math.random().toString(), descricao: desc })),
        oportunidades: swotData.opportunities.map((desc) => ({ id: Math.random().toString(), descricao: desc })),
        ameacas: swotData.threats.map((desc) => ({ id: Math.random().toString(), descricao: desc })),
      });
    } catch (error) {
      console.error("Erro ao salvar SWOT:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Análise SWOT</h2>
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

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map(({ key, label, color, borderColor, textColor }) => (
            <Card key={key} className={`p-6 ${color} border-2 ${borderColor}`}>
              <h3 className={`text-lg font-bold mb-4 ${textColor}`}>{label}</h3>

              <SortableContext
                items={swotData[key].map((_, i) => String(`${key}-${i}`))}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3 min-h-[200px]">
                  {swotData[key].map((item, index) => (
                    <SortableItem
                      key={`${key}-${index}`}
                      id={`${key}-${index}`}
                      value={item}
                      category={key}
                      index={index}
                      onRemove={handleRemoveItem}
                      onChange={handleChangeItem}
                    />
                  ))}
                </div>
              </SortableContext>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddItem(key)}
                className="w-full mt-4"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </Card>
          ))}
        </div>
      </DndContext>

      {/* Resumo */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50">
        <h3 className="text-lg font-bold mb-4">Resumo da Análise</h3>
        <div className="grid grid-cols-4 gap-4 text-center">
          {categories.map(({ key, label }) => (
            <div key={key}>
              <p className="text-2xl font-bold text-purple-600">{swotData[key].length}</p>
              <p className="text-sm text-gray-600">{label}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
