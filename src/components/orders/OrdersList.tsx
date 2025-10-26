import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  ClipboardList,
  User,
  Calendar,
  Edit2,
  Clock,
  CheckCircle,
  XCircle,
  Loader,
  AlertTriangle
} from "lucide-react";
import { motion } from "framer-motion";

export default function OrdersList({
  orders,
  events,
  orderTypes,
  users,
  onEdit
}) {
  const getEvent = (eventId) => events.find(e => e.id === eventId);
  const getOrderType = (typeId) => orderTypes.find(t => t.id === typeId);
  const getUser = (userId) => users.find(u => u.id === userId);

  const statusConfig = {
    pendiente: {
      label: "Pendiente",
      color: "bg-amber-100 text-amber-800",
      icon: Clock
    },
    en_proceso: {
      label: "En Proceso",
      color: "bg-blue-100 text-blue-800",
      icon: Loader
    },
    completado: {
      label: "Completado",
      color: "bg-emerald-100 text-emerald-800",
      icon: CheckCircle
    },
    cancelado: {
      label: "Cancelado",
      color: "bg-red-100 text-red-800",
      icon: XCircle
    }
  };

  const priorityConfig = {
    alta: { label: "Alta", color: "bg-red-100 text-red-700" },
    media: { label: "Media", color: "bg-yellow-100 text-yellow-700" },
    baja: { label: "Baja", color: "bg-green-100 text-green-700" }
  };

  if (orders.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <ClipboardList className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No hay Pedidos
          </h3>
          <p className="text-slate-500">
            Crea tu primer pedido para comenzar a gestionar tareas.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {orders.map((order, index) => {
        const event = getEvent(order.event_id);
        const orderType = getOrderType(order.order_type_id);
        const responsibleUser = getUser(order.responsible_user_id);
        const status = statusConfig[order.status];
        const priority = priorityConfig[orderType?.priority || 'media'];
        const StatusIcon = status?.icon || AlertTriangle;

        const isOverdue = order.due_date && new Date(order.due_date) < new Date() && order.status !== 'completado' && order.status !== 'cancelado';

        return (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white/95 backdrop-blur-sm h-full flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={`${status.color} flex items-center gap-1`}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </Badge>
                      {orderType && (
                        <Badge className={`${priority.color}`}>
                          {priority.label}
                        </Badge>
                      )}
                      {isOverdue && (
                        <Badge className="bg-red-600 text-white">
                          Vencido
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-bold text-lg text-slate-900 line-clamp-2">
                      {orderType?.name || "Tipo desconocido"}
                    </h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(order)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 flex-1 flex flex-col">
                <div className="space-y-2 flex-1">
                  {event && (
                    <div className="flex items-start gap-2 text-sm">
                      <ClipboardList className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-600 line-clamp-2">
                        {event.title || `Evento ${format(new Date(event.date), "dd MMM yyyy", { locale: es })}`}
                      </span>
                    </div>
                  )}

                  {responsibleUser && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className="text-slate-600 truncate">
                        {responsibleUser.first_name} {responsibleUser.last_name}
                      </span>
                    </div>
                  )}

                  {order.due_date && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className={`${isOverdue ? 'text-red-600 font-medium' : 'text-slate-600'}`}>
                        Límite: {format(new Date(order.due_date), "dd MMM yyyy", { locale: es })}
                      </span>
                    </div>
                  )}

                  {order.notes && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-slate-500 line-clamp-3">
                        {order.notes}
                      </p>
                    </div>
                  )}
                </div>

                {orderType?.description && (
                  <div className="pt-3 border-t">
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {orderType.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
