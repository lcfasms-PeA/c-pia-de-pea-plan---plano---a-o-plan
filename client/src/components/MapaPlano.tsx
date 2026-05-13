import { Card } from "@/components/ui/card";
import { CheckCircle2, Circle, Lock } from "lucide-react";

interface Section {
  id: string;
  title: string;
  completed: boolean;
  progress: number;
}

interface MapaPlanoprops {
  sections: Section[];
  currentSection?: string;
  onSelectSection?: (sectionId: string) => void;
}

export default function MapaPlano({
  sections,
  currentSection,
  onSelectSection,
}: MapaPlanoprops) {
  const totalProgress = Math.round(
    sections.reduce((sum, s) => sum + s.progress, 0) / sections.length
  );

  const completedSections = sections.filter((s) => s.completed).length;

  return (
    <div className="space-y-6">
      {/* Progresso Geral */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Progresso do Plano</h2>
            <span className="text-3xl font-bold text-blue-600">{totalProgress}%</span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-500"
              style={{ width: `${totalProgress}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">{completedSections}</p>
              <p className="text-sm text-gray-600">Completas</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">
                {sections.length - completedSections}
              </p>
              <p className="text-sm text-gray-600">Pendentes</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{sections.length}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Mapa de Seções */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold">Seções do Plano</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sections.map((section, index) => (
            <Card
              key={section.id}
              className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                currentSection === section.id ? "ring-2 ring-blue-500" : ""
              } ${section.completed ? "bg-green-50" : ""}`}
              onClick={() => onSelectSection?.(section.id)}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {section.completed ? (
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  ) : section.progress > 0 ? (
                    <Circle className="w-6 h-6 text-yellow-600" />
                  ) : (
                    <Lock className="w-6 h-6 text-gray-400" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-sm">{section.title}</h4>
                    <span className="text-xs font-medium text-gray-600">
                      {section.progress}%
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        section.completed
                          ? "bg-green-500"
                          : section.progress > 50
                            ? "bg-blue-500"
                            : "bg-yellow-500"
                      }`}
                      style={{ width: `${section.progress}%` }}
                    />
                  </div>

                  <p className="text-xs text-gray-500 mt-2">
                    {section.completed ? "✓ Completa" : `${section.progress}% preenchida`}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Timeline Visual */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-6">Timeline de Progresso</h3>
        <div className="space-y-4">
          {sections.map((section, index) => (
            <div key={section.id} className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-100">
                <span className="text-sm font-bold">{index + 1}</span>
              </div>

              <div className="flex-1">
                <p className="font-medium text-sm">{section.title}</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${section.progress}%` }}
                  />
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm font-bold">{section.progress}%</p>
                {section.completed && (
                  <p className="text-xs text-green-600">✓ Concluída</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
