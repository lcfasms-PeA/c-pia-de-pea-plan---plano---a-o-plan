import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Bell, CheckCircle, AlertCircle, Info, Trash2 } from "lucide-react";

interface Notification {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: "sucesso" | "erro" | "aviso" | "info";
  lida: boolean;
  dataHora: Date;
  acao?: {
    titulo: string;
    url: string;
  };
}

interface NotificationCenterProps {
  onNotificationRead?: (id: string) => void;
}

const NOTIFICATION_ICONS = {
  sucesso: <CheckCircle className="w-5 h-5 text-green-600" />,
  erro: <AlertCircle className="w-5 h-5 text-red-600" />,
  aviso: <AlertCircle className="w-5 h-5 text-yellow-600" />,
  info: <Info className="w-5 h-5 text-blue-600" />,
};

const NOTIFICATION_COLORS = {
  sucesso: "bg-green-50 border-green-200",
  erro: "bg-red-50 border-red-200",
  aviso: "bg-yellow-50 border-yellow-200",
  info: "bg-blue-50 border-blue-200",
};

export default function NotificationCenter({ onNotificationRead }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [autoNotifications, setAutoNotifications] = useState<Notification[]>([]);

  // Simular notificações em tempo real
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: "1",
        titulo: "Seção Concluída",
        mensagem: "Você completou a seção 'Descrição da Empresa'",
        tipo: "sucesso",
        lida: false,
        dataHora: new Date(Date.now() - 5 * 60 * 1000),
        acao: {
          titulo: "Ver Plano",
          url: "/plano/1",
        },
      },
      {
        id: "2",
        titulo: "Nova Conquista",
        mensagem: "Você ganhou a conquista 'Primeira Seção'",
        tipo: "sucesso",
        lida: false,
        dataHora: new Date(Date.now() - 10 * 60 * 1000),
      },
      {
        id: "3",
        titulo: "Aviso de Tarefa",
        mensagem: "Uma tarefa do seu cronograma vence em 2 dias",
        tipo: "aviso",
        lida: false,
        dataHora: new Date(Date.now() - 30 * 60 * 1000),
        acao: {
          titulo: "Ver Cronograma",
          url: "/cronograma",
        },
      },
      {
        id: "4",
        titulo: "Feedback do Professor",
        mensagem: "Seu professor deixou um comentário no seu plano",
        tipo: "info",
        lida: true,
        dataHora: new Date(Date.now() - 2 * 60 * 60 * 1000),
        acao: {
          titulo: "Ver Feedback",
          url: "/plano/1/feedback",
        },
      },
    ];
    setNotifications(mockNotifications);
  }, []);

  // Auto-remover notificações após 5 segundos
  useEffect(() => {
    if (autoNotifications.length === 0) return;

    const timer = setTimeout(() => {
      setAutoNotifications((prev) => prev.slice(1));
    }, 5000);

    return () => clearTimeout(timer);
  }, [autoNotifications]);

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, lida: true } : n))
    );
    onNotificationRead?.(id);
  };

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleDeleteAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.lida).length;

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Agora";
    if (minutes < 60) return `${minutes}m atrás`;
    if (hours < 24) return `${hours}h atrás`;
    if (days < 7) return `${days}d atrás`;
    return date.toLocaleDateString("pt-BR");
  };

  return (
    <>
      {/* Notificações auto-dismiss */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {autoNotifications.map((notif) => (
          <Card
            key={notif.id}
            className={`p-4 border-2 ${NOTIFICATION_COLORS[notif.tipo]} animate-in fade-in slide-in-from-top-2 max-w-sm`}
          >
            <div className="flex items-start gap-3">
              {NOTIFICATION_ICONS[notif.tipo]}
              <div className="flex-1">
                <div className="font-semibold">{notif.titulo}</div>
                <div className="text-sm text-gray-600">{notif.mensagem}</div>
              </div>
              <button
                onClick={() => setAutoNotifications((prev) => prev.filter((n) => n.id !== notif.id))}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Ícone de sino com badge */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 text-gray-600 hover:text-gray-900 transition"
        >
          <Bell className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown de notificações */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-40">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-lg">Notificações</h3>
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeleteAll}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Limpar
                </Button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>Nenhuma notificação</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-4 hover:bg-gray-50 transition cursor-pointer ${
                        !notif.lida ? "bg-blue-50" : ""
                      }`}
                      onClick={() => handleMarkAsRead(notif.id)}
                    >
                      <div className="flex items-start gap-3">
                        {NOTIFICATION_ICONS[notif.tipo]}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="font-semibold text-sm">{notif.titulo}</div>
                            {!notif.lida && (
                              <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{notif.mensagem}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">{formatTime(notif.dataHora)}</span>
                            {notif.acao && (
                              <a
                                href={notif.acao.url}
                                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {notif.acao.titulo} →
                              </a>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(notif.id);
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 text-center">
                <a href="/notificacoes" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                  Ver todas as notificações →
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
