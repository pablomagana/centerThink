
import React, { useState, useEffect } from "react";
import { Speaker } from "@/entities/Speaker";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import SpeakersList from "../components/speakers/SpeakersList";
import SpeakerForm from "../components/speakers/SpeakerForm";

export default function SpeakersPage() {
  const [speakers, setSpeakers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSpeaker, setEditingSpeaker] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSpeakers();
  }, []);

  const loadSpeakers = async () => {
    setIsLoading(true);
    try {
      const data = await Speaker.list("-created_date");
      setSpeakers(data);
    } catch (error) {
      console.error("Error loading speakers:", error);
    }
    setIsLoading(false);
  };

  const handleSubmit = async (speakerData) => {
    try {
      if (editingSpeaker) {
        await Speaker.update(editingSpeaker.id, speakerData);
      } else {
        await Speaker.create(speakerData);
      }
      setShowForm(false);
      setEditingSpeaker(null);
      loadSpeakers();
    } catch (error) {
      console.error("Error saving speaker:", error);
    }
  };
  
  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este ponente? Esta acción no se puede deshacer.")) {
      try {
        await Speaker.delete(id);
        loadSpeakers();
      } catch (error) {
        console.error("Error deleting speaker:", error);
        alert("Hubo un error al eliminar el ponente.");
      }
    }
  };

  const handleEdit = (speaker) => {
    setEditingSpeaker(speaker);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSpeaker(null);
  };

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
          <h1 className="text-3xl font-bold text-slate-900">Gestión de Ponentes</h1>
          <p className="text-slate-600 mt-2">
            Base de datos completa de todos tus ponentes y su información de contacto
          </p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg h-12 px-8 text-base"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Ponente
        </Button>
      </div>

      {showForm && (
        <SpeakerForm
          speaker={editingSpeaker}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}

      <SpeakersList
        speakers={speakers}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
