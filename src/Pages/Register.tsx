import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import RegisterForm from '@/components/auth/RegisterForm';
import { User } from '@/entities/User';

export default function RegisterPage() {
  const [cities, setCities] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // Cargar ciudades al montar el componente
  useEffect(() => {
    loadCities();
  }, []);

  const loadCities = async () => {
    try {
      // Usar el método público que no requiere autenticación
      const publicCities = await User.getPublicCities();
      setCities(publicCities);
    } catch (err) {
      console.error('Error loading cities:', err);
      setError('Error al cargar las ciudades. Por favor, recarga la página.');
    }
  };

  const handleRegister = async (formData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    city_id: string;
    phone: string;
  }) => {
    setError('');
    setLoading(true);

    try {
      const result = await User.register(formData);

      if (result.success) {
        setSuccess(true);
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Error al registrar el usuario. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Vista de éxito
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
              <img src="/favicon.svg" alt="CenterThink" className="w-16 h-16 rounded-2xl" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">CenterThink</h1>
            <p className="text-slate-600 mt-2">Gestión de Thinkglaos</p>
          </div>

          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle2 className="w-12 h-12 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-2xl text-center">¡Registro Exitoso!</CardTitle>
              <CardDescription className="text-center">
                Tu cuenta ha sido creada correctamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900 text-center">
                  <strong>Revisa tu correo electrónico</strong>
                </p>
                <p className="text-sm text-blue-800 text-center mt-2">
                  Hemos enviado un email de confirmación. Debes confirmar tu cuenta antes de poder iniciar sesión.
                </p>
              </div>

              <div className="text-center text-sm text-slate-600">
                <p>Serás redirigido al login en 3 segundos...</p>
                <Link
                  to="/login"
                  className="text-blue-600 hover:underline font-medium mt-2 inline-block"
                >
                  O haz clic aquí para ir ahora
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Vista del formulario de registro
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
            <img src="/favicon.svg" alt="CenterThink" className="w-16 h-16 rounded-2xl" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">CenterThink</h1>
          <p className="text-slate-600 mt-2">Gestión de Thinkglaos</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Crear Cuenta</CardTitle>
            <CardDescription>
              Completa el formulario para registrarte en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterForm
              cities={cities}
              onSubmit={handleRegister}
              loading={loading}
              error={error}
            />

            <div className="mt-6 space-y-4">
              <div className="text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
                >
                  <ArrowLeft className="w-4 h-4" />
                  ¿Ya tienes cuenta? Inicia sesión
                </Link>
              </div>

              <div className="text-center">
                <p className="text-sm text-slate-600">
                  ¿Necesitas ayuda?{' '}
                  <a href="mailto:info@pablomagana.es" className="text-blue-600 hover:underline">
                    Contacta soporte
                  </a>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-slate-600">
          <p>centerThink v1.0</p>
        </div>
      </div>
    </div>
  );
}
