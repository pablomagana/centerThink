
import React, { useState, useEffect } from "react";
import { Speaker } from "@/entities/Speaker";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import SpeakersList from "../components/speakers/SpeakersList";
import SpeakerForm from "../components/speakers/SpeakersForm";

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
      const data = await Speaker.list("-created_at");
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
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Gestión de Ponentes</h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1 sm:mt-2">
            Base de datos completa de todos tus ponentes y su información de contacto
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingSpeaker(null);
            setShowForm(true);
          }}
          className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Nuevo Ponente
        </Button>
      </div>

      <SpeakerForm
        speaker={editingSpeaker}
        isOpen={showForm}
        onClose={handleCancel}
        onSubmit={handleSubmit}
      />

      <SpeakersList
        speakers={speakers}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
