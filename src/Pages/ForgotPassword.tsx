import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        throw resetError;
      }

      setSuccess(true);
    } catch (err: any) {
      console.error('Error sending reset email:', err);
      setError(err.message || 'Error al enviar el email de recuperación. Por favor, intenta de nuevo.');
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
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">CenterThink</h1>
            <p className="text-sm sm:text-base text-slate-600 mt-1 sm:mt-2">Gestión de Thinkglaos</p>
          </div>

          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-blue-100 p-3">
                  <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600" />
                </div>
              </div>
              <CardTitle className="text-xl sm:text-2xl text-center">Email Enviado</CardTitle>
              <CardDescription className="text-sm sm:text-base text-center">
                Revisa tu bandeja de entrada
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-blue-900 text-center">
                  <strong>Hemos enviado un email a:</strong>
                </p>
                <p className="text-xs sm:text-sm text-blue-800 text-center mt-2 font-semibold">
                  {email}
                </p>
                <p className="text-xs sm:text-sm text-blue-800 text-center mt-3">
                  Haz clic en el enlace del email para restablecer tu contraseña.
                </p>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs sm:text-sm">
                  <strong>Importante:</strong> El enlace expira en 1 hora. Si no ves el email, revisa tu carpeta de spam.
                </AlertDescription>
              </Alert>

              <div className="text-center pt-4">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-xs sm:text-sm text-blue-600 hover:underline font-medium"
                >
                  <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                  Volver al inicio de sesión
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Vista del formulario
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
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl">¿Olvidaste tu contraseña?</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Ingresa tu email y te enviaremos un enlace para restablecerla
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs sm:text-sm">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm sm:text-base">
                  Correo Electrónico <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="h-11 sm:h-12 pl-9 sm:pl-10 text-sm sm:text-base"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 h-11 sm:h-12 text-sm sm:text-base"
                disabled={loading || !email}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Enviando...
                  </div>
                ) : (
                  'Enviar Enlace de Recuperación'
                )}
              </Button>
            </form>

            <div className="mt-6 space-y-4">
              <div className="text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-xs sm:text-sm text-blue-600 hover:underline"
                >
                  <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                  Volver al inicio de sesión
                </Link>
              </div>

              <div className="text-center">
                <p className="text-xs sm:text-sm text-slate-600">
                  ¿No tienes cuenta?{' '}
                  <Link to="/register" className="text-blue-600 hover:underline font-medium">
                    Regístrate aquí
                  </Link>
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
