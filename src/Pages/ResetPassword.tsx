import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Check, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
  {
    label: 'Al menos 8 caracteres',
    test: (password) => password.length >= 8
  },
  {
    label: 'Una letra mayúscula',
    test: (password) => /[A-Z]/.test(password)
  },
  {
    label: 'Una letra minúscula',
    test: (password) => /[a-z]/.test(password)
  },
  {
    label: 'Un número',
    test: (password) => /[0-9]/.test(password)
  }
];

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [validSession, setValidSession] = useState(false);
  const navigate = useNavigate();

  // Verificar si hay una sesión de recuperación válida
  useEffect(() => {
    checkRecoverySession();
  }, []);

  const checkRecoverySession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        setValidSession(true);
      } else {
        setError('Enlace inválido o expirado. Solicita un nuevo enlace de recuperación.');
      }
    } catch (err) {
      console.error('Error checking session:', err);
      setError('Error al verificar la sesión. Por favor, intenta de nuevo.');
    }
  };

  // Validar que las contraseñas coincidan
  useEffect(() => {
    if (confirmPassword) {
      setPasswordsMatch(password === confirmPassword);
    }
  }, [password, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      setPasswordsMatch(false);
      return;
    }

    // Validar requisitos de contraseña
    const allRequirementsMet = passwordRequirements.every(req => req.test(password));
    if (!allRequirementsMet) {
      setError('La contraseña no cumple todos los requisitos');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        throw updateError;
      }

      setSuccess(true);

      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      console.error('Error updating password:', err);
      setError(err.message || 'Error al actualizar la contraseña. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    const allRequirementsMet = passwordRequirements.every(req => req.test(password));
    const passwordsMatchValid = password === confirmPassword;
    return password && confirmPassword && allRequirementsMet && passwordsMatchValid;
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
              <CardTitle className="text-2xl text-center">¡Contraseña Actualizada!</CardTitle>
              <CardDescription className="text-center">
                Tu contraseña ha sido cambiada correctamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-900 text-center">
                  Ahora puedes iniciar sesión con tu nueva contraseña
                </p>
              </div>

              <div className="text-center text-sm text-slate-600">
                <p>Serás redirigido al login en 3 segundos...</p>
                <Button
                  onClick={() => navigate('/login')}
                  className="mt-4 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700"
                >
                  Ir al Login Ahora
                </Button>
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
          <CardHeader>
            <CardTitle className="text-2xl">Crear Nueva Contraseña</CardTitle>
            <CardDescription>
              Ingresa tu nueva contraseña segura
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!validSession ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error || 'Enlace inválido o expirado. Por favor, solicita un nuevo enlace de recuperación.'}
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Nueva Contraseña */}
                <div className="space-y-2">
                  <Label htmlFor="password">
                    Nueva Contraseña <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      required
                      disabled={loading}
                      className="h-12 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Requisitos de contraseña */}
                  {(passwordFocused || password) && (
                    <div className="mt-2 p-3 bg-slate-50 rounded-lg space-y-1.5">
                      <p className="text-xs font-medium text-slate-700 mb-2">
                        Requisitos de contraseña:
                      </p>
                      {passwordRequirements.map((requirement, index) => {
                        const isMet = requirement.test(password);
                        return (
                          <div key={index} className="flex items-center gap-2 text-xs">
                            {isMet ? (
                              <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                            ) : (
                              <X className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            )}
                            <span className={isMet ? 'text-green-700' : 'text-slate-600'}>
                              {requirement.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Confirmar Contraseña */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    Confirmar Contraseña <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={loading}
                      className={`h-12 pr-10 ${
                        confirmPassword && !passwordsMatch
                          ? 'border-red-500 focus:ring-red-500'
                          : ''
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {confirmPassword && !passwordsMatch && (
                    <p className="text-xs text-red-600">Las contraseñas no coinciden</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 h-12 text-base"
                  disabled={loading || !isFormValid()}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Actualizando...
                    </div>
                  ) : (
                    'Actualizar Contraseña'
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-slate-600">
          <p>centerThink v1.0</p>
        </div>
      </div>
    </div>
  );
}
