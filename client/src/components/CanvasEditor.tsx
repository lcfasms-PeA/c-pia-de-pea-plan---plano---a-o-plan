import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Save, Loader2 } from "lucide-react";

interface CanvasData {
  keyPartners: string;
  keyActivities: string;
  keyResources: string;
  valueProposition: string;
  customerRelationships: string;
  channels: string;
  customerSegments: string;
  costStructure: string;
  revenueStreams: string;
}

interface CanvasEditorProps {
  planId: number;
  initialData?: CanvasData;
}

export default function CanvasEditor({ planId, initialData }: CanvasEditorProps) {
  const [canvasData, setCanvasData] = useState<CanvasData>(
    initialData || {
      keyPartners: "",
      keyActivities: "",
      keyResources: "",
      valueProposition: "",
      customerRelationships: "",
      channels: "",
      customerSegments: "",
      costStructure: "",
      revenueStreams: "",
    }
  );

  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (key: keyof CanvasData, value: string) => {
    setCanvasData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Implementar endpoint canvas.save no backend
      console.log("Canvas salvo:", canvasData);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Business Model Canvas</h2>
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

      <div className="grid grid-cols-3 gap-4 auto-rows-max">
        <Card className="p-4 bg-blue-50 border-2 border-blue-200">
          <h3 className="font-bold text-sm mb-2">Parceiros-chave</h3>
          <Textarea
            value={canvasData.keyPartners}
            onChange={(e) => handleChange("keyPartners", e.target.value)}
            placeholder="Parceiros estratégicos..."
            rows={4}
            className="text-xs"
          />
        </Card>

        <Card className="p-4 bg-green-50 border-2 border-green-200">
          <h3 className="font-bold text-sm mb-2">Atividades-chave</h3>
          <Textarea
            value={canvasData.keyActivities}
            onChange={(e) => handleChange("keyActivities", e.target.value)}
            placeholder="Atividades principais..."
            rows={4}
            className="text-xs"
          />
        </Card>

        <Card className="p-4 bg-purple-50 border-2 border-purple-200">
          <h3 className="font-bold text-sm mb-2">Recursos-chave</h3>
          <Textarea
            value={canvasData.keyResources}
            onChange={(e) => handleChange("keyResources", e.target.value)}
            placeholder="Recursos necessários..."
            rows={4}
            className="text-xs"
          />
        </Card>

        <Card className="p-4 bg-orange-50 border-2 border-orange-200 col-start-3 row-start-2">
          <h3 className="font-bold text-sm mb-2">Relacionamento</h3>
          <Textarea
            value={canvasData.customerRelationships}
            onChange={(e) => handleChange("customerRelationships", e.target.value)}
            placeholder="Como se relaciona com clientes..."
            rows={3}
            className="text-xs"
          />
        </Card>

        <Card className="p-4 bg-red-50 border-4 border-red-400 col-start-2 row-start-2">
          <h3 className="font-bold text-sm mb-2 text-center">Proposta de Valor</h3>
          <Textarea
            value={canvasData.valueProposition}
            onChange={(e) => handleChange("valueProposition", e.target.value)}
            placeholder="Por que os clientes nos escolhem?"
            rows={4}
            className="text-xs font-semibold"
          />
        </Card>

        <Card className="p-4 bg-yellow-50 border-2 border-yellow-200 col-start-3 row-start-3">
          <h3 className="font-bold text-sm mb-2">Canais</h3>
          <Textarea
            value={canvasData.channels}
            onChange={(e) => handleChange("channels", e.target.value)}
            placeholder="Canais de distribuição..."
            rows={3}
            className="text-xs"
          />
        </Card>

        <Card className="p-4 bg-gray-50 border-2 border-gray-300">
          <h3 className="font-bold text-sm mb-2">Estrutura de Custos</h3>
          <Textarea
            value={canvasData.costStructure}
            onChange={(e) => handleChange("costStructure", e.target.value)}
            placeholder="Principais custos..."
            rows={3}
            className="text-xs"
          />
        </Card>

        <Card className="p-4 bg-green-100 border-2 border-green-400">
          <h3 className="font-bold text-sm mb-2">Fluxos de Receita</h3>
          <Textarea
            value={canvasData.revenueStreams}
            onChange={(e) => handleChange("revenueStreams", e.target.value)}
            placeholder="Como você ganha dinheiro?"
            rows={3}
            className="text-xs font-semibold"
          />
        </Card>

        <Card className="p-4 bg-indigo-50 border-2 border-indigo-200">
          <h3 className="font-bold text-sm mb-2">Segmentos de Clientes</h3>
          <Textarea
            value={canvasData.customerSegments}
            onChange={(e) => handleChange("customerSegments", e.target.value)}
            placeholder="Quem são seus clientes?"
            rows={3}
            className="text-xs"
          />
        </Card>
      </div>

      <Card className="p-4 bg-blue-50 border-blue-200">
        <p className="text-sm text-blue-800">
          💡 <strong>Dica:</strong> O Business Model Canvas é uma ferramenta estratégica que ajuda a visualizar seu modelo de negócios em 9 blocos.
        </p>
      </Card>
    </div>
  );
}
