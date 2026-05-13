import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Save, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface Section {
  id: string;
  title: string;
  fields: Record<string, string>;
}

interface EditorPlanoProps {
  planId: number;
  sections: Section[];
  currentSectionId: string;
  onSectionChange?: (sectionId: string) => void;
}

export default function EditorPlano({
  planId,
  sections,
  currentSectionId,
  onSectionChange,
}: EditorPlanoProps) {
  const currentSectionIndex = sections.findIndex((s) => s.id === currentSectionId);
  const currentSection = sections[currentSectionIndex];

  const [formData, setFormData] = useState<Record<string, string>>(
    currentSection?.fields || {}
  );

  // Sincronizar formData quando a seção mudar
  useEffect(() => {
    setFormData(currentSection?.fields || {});
  }, [currentSectionId, currentSection?.fields]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  const updateSectionMutation = trpc.businessPlans.updateSection.useMutation();

  // Auto-save a cada 30 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      if (Object.keys(formData).length > 0) {
        handleSave();
      }
    }, 30000);

    return () => clearInterval(timer);
  }, [formData]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus("saving");

    try {
      await updateSectionMutation.mutateAsync({
        id: planId,
        section: currentSectionId as any,
        data: formData,
      });

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      setSaveStatus("idle");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handlePreviousSection = () => {
    if (currentSectionIndex > 0) {
      onSectionChange?.(sections[currentSectionIndex - 1].id);
    }
  };

  const handleNextSection = () => {
    if (currentSectionIndex < sections.length - 1) {
      onSectionChange?.(sections[currentSectionIndex + 1].id);
    }
  };

  if (!currentSection) {
    return <div>Seção não encontrada</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{currentSection.title}</h1>
          <p className="text-gray-600 mt-2">
            Seção {currentSectionIndex + 1} de {sections.length}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {saveStatus === "saving" && (
            <div className="flex items-center gap-2 text-blue-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Salvando...</span>
            </div>
          )}
          {saveStatus === "saved" && (
            <div className="flex items-center gap-2 text-green-600">
              <span className="text-sm">✓ Salvo</span>
            </div>
          )}
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            Salvar
          </Button>
        </div>
      </div>

      {/* Formulário */}
      <Card className="p-8">
        <div className="space-y-6">
          {Object.entries(currentSection.fields).map(([fieldName, fieldValue]) => (
            <div key={fieldName} className="space-y-2">
              <label className="block text-sm font-medium capitalize">
                {fieldName.replace(/_/g, " ")}
              </label>

              {fieldName.includes("description") || fieldName.includes("details") ? (
                <Textarea
                  value={formData[fieldName] || ""}
                  onChange={(e) => handleFieldChange(fieldName, e.target.value)}
                  placeholder={`Digite ${fieldName.replace(/_/g, " ")}`}
                  rows={5}
                  className="w-full"
                />
              ) : (
                <Input
                  value={formData[fieldName] || ""}
                  onChange={(e) => handleFieldChange(fieldName, e.target.value)}
                  placeholder={`Digite ${fieldName.replace(/_/g, " ")}`}
                  className="w-full"
                />
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Navegação */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={handlePreviousSection}
          disabled={currentSectionIndex === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Seção Anterior
        </Button>

        <div className="flex gap-2">
          {sections.map((section, index) => (
            <button
              key={section.id}
              onClick={() => onSectionChange?.(section.id)}
              className={`w-10 h-10 rounded-full font-bold transition-all ${
                currentSectionId === section.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        <Button
          variant="outline"
          onClick={handleNextSection}
          disabled={currentSectionIndex === sections.length - 1}
        >
          Próxima Seção
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Dica */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <p className="text-sm text-blue-800">
          💡 <strong>Dica:</strong> Suas alterações são salvas automaticamente a cada 30 segundos.
        </p>
      </Card>
    </div>
  );
}
