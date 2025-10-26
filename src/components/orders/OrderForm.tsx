
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardList, Save, X } from "lucide-react";
import { motion } from "framer-motion";

export default function OrderForm({
  order,
  events,
  orderTypes,
  users,
  onSubmit,
  onCancel
}) {
  const [formData, setFormData] = useState({
    event_id: order?.event_id || "",
    order_type_id: order?.order_type_id || "",
    responsible_user_id: order?.responsible_user_id || "",
    status: order?.status || "pendiente",
    due_date: order?.due_date ? new Date(order.due_date).toISOString().slice(0, 10) : "",
    notes: order?.notes || "",
    completion_notes: order?.completion_notes || ""
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null
    });
  };

  const statusOptions = [
    { value: "pendiente", label: "Pendiente", color: "text-amber-600 bg-amber-50" },
    { value: "en_proceso", label: "En Proceso", color: "text-blue-600 bg-blue-50" },
    { value: "completado", label: "Completado", color: "text-emerald-600 bg-emerald-50" },
    { value: "cancelado", label: "Cancelado", color: "text-red-600 bg-red-50" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-8"
    >
      <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-emerald-50 border-b">
          <CardTitle className="flex items-center gap-2 text-xl">
            <ClipboardList className="w-6 h-6 text-blue-600" />
            {order ? "Editar Pedido" : "Nuevo Pedido"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="event_id">Evento *</Label>
                <Select
                  value={formData.event_id}
                  onValueChange={(value) => handleInputChange("event_id", value)}
                  required
                >
                  <SelectTrigger className="h-12 px-4">
                    <SelectValue placeholder="Seleccionar evento" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((event) => (
                      <SelectItem key={event.id} value={event.id} className="py-2.5 px-4">
                        {event.title || `Evento ${new Date(event.date).toLocaleDateString('es-ES')}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="order_type_id">Tipo de Pedido *</Label>
                <Select
                  value={formData.order_type_id}
                  onValueChange={(value) => handleInputChange("order_type_id", value)}
                  required
                >
                  <SelectTrigger className="h-12 px-4">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {orderTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id} className="py-2.5 px-4">
                        <div className="flex items-center justify-between w-full">
                          <span>{type.name}</span>
                          <span className={`ml-2 text-xs px-2 py-0.5 rounded ${
                            type.priority === 'alta' ? 'bg-red-100 text-red-700' :
                            type.priority === 'media' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {type.priority}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsible_user_id">Usuario Responsable *</Label>
                <Select
                  value={formData.responsible_user_id}
                  onValueChange={(value) => handleInputChange("responsible_user_id", value)}
                  required
                >
                  <SelectTrigger className="h-12 px-4">
                    <SelectValue placeholder="Seleccionar usuario" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id} className="py-2.5 px-4">
                        {user.first_name} {user.last_name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="due_date">Fecha Límite</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => handleInputChange("due_date", e.target.value)}
                  className="h-12 px-4"
                />
              </div>

              <div className="space-y-2 lg:col-span-2">
                <Label htmlFor="status">Estado</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange("status", value)}
                >
                  <SelectTrigger className="h-12 px-4">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="py-2.5 px-4">
                        <div className={`px-2 py-1 rounded text-sm ${option.color}`}>
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas del Pedido</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Detalles y especificaciones del pedido..."
                rows={4}
              />
            </div>

            {(formData.status === 'completado' || formData.status === 'cancelado') && (
              <div className="space-y-2">
                <Label htmlFor="completion_notes">Notas de Finalización</Label>
                <Textarea
                  id="completion_notes"
                  value={formData.completion_notes}
                  onChange={(e) => handleInputChange("completion_notes", e.target.value)}
                  placeholder="Resultados, comentarios finales..."
                  rows={3}
                />
              </div>
            )}

            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onCancel} className="h-12 px-8 text-base">
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 h-12 px-8 text-base"
              >
                <Save className="w-4 h-4 mr-2" />
                {order ? "Actualizar" : "Crear"} Pedido
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
