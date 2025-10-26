
import React, { useState, useEffect, useContext } from "react";
import { EventOrder } from "@/entities/EventOrder";
import { OrderType } from "@/entities/OrderType";
import { Event } from "@/entities/Event";
import { User } from "@/entities/User";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import OrdersList from "../components/orders/OrdersList";
import OrderForm from "../components/orders/OrderForm";
import { AppContext } from "@/components/AppContextProvider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [events, setEvents] = useState([]);
  const [orderTypes, setOrderTypes] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [filters, setFilters] = useState({
    status: "all",
    eventId: "all"
  });
  const [isLoading, setIsLoading] = useState(true);
  const { selectedCity } = useContext(AppContext);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [ordersData, eventsData, orderTypesData, usersData] = await Promise.all([
        EventOrder.list("-due_date"),
        Event.list("-date"),
        OrderType.list(),
        User.list()
      ]);

      setOrders(ordersData);
      setEvents(eventsData);
      setOrderTypes(orderTypesData.filter(t => t.active));
      setUsers(usersData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  const handleSubmit = async (orderData) => {
    try {
      if (editingOrder) {
        await EventOrder.update(editingOrder.id, orderData);
      } else {
        await EventOrder.create(orderData);
      }
      setShowForm(false);
      setEditingOrder(null);
      loadData();
    } catch (error) {
      console.error("Error saving order:", error);
    }
  };

  const handleEdit = (order) => {
    setEditingOrder(order);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingOrder(null);
  };

  const filteredOrders = orders.filter(order => {
    const statusMatch = filters.status === "all" || order.status === filters.status;

    // Filter by event's city
    const orderEvent = events.find(e => e.id === order.event_id);
    const cityMatch = selectedCity && orderEvent ? orderEvent.city_id === selectedCity.id : true;

    // Filter by specific event
    const eventMatch = filters.eventId === "all" || order.event_id === filters.eventId;

    return statusMatch && cityMatch && eventMatch;
  });

  // Filter events by selected city for the form and filters
  const cityEvents = events.filter(event =>
    selectedCity ? event.city_id === selectedCity.id : true
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestión de Pedidos</h1>
          <p className="text-slate-600 mt-2">
            Organiza y supervisa todas las tareas y pedidos de tus eventos
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 shadow-lg h-12 px-8 text-base"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Pedido
        </Button>
      </div>

      {showForm && (
        <OrderForm
          order={editingOrder}
          events={cityEvents}
          orderTypes={orderTypes}
          users={users}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}

      {/* Filters */}
      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Estado</Label>
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger className="h-12 px-4">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="en_proceso">En Proceso</SelectItem>
                <SelectItem value="completado">Completado</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Evento</Label>
            <Select
              value={filters.eventId}
              onValueChange={(value) => setFilters(prev => ({ ...prev, eventId: value }))}
            >
              <SelectTrigger className="h-12 px-4">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los eventos</SelectItem>
                {cityEvents.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.title || `Evento ${new Date(event.date).toLocaleDateString('es-ES')}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <OrdersList
        orders={filteredOrders}
        events={events}
        orderTypes={orderTypes}
        users={users}
        onEdit={handleEdit}
      />
    </div>
  );
}
