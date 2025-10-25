import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Check, X, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface RegisterFormProps {
  cities: Array<{ id: string; name: string }>;
  onSubmit: (formData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    city_id: string;
    phone: string;
  }) => Promise<void>;
  loading: boolean;
  error: string;
}

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

export default function RegisterForm({ cities, onSubmit, loading, error }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    city_id: '',
    phone: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  // Validar que las contraseñas coincidan
  useEffect(() => {
    if (formData.confirmPassword) {
      setPasswordsMatch(formData.password === formData.confirmPassword);
    }
  }, [formData.password, formData.confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar que las contraseñas coincidan
    if (formData.password !== formData.confirmPassword) {
      setPasswordsMatch(false);
      return;
    }

    // Validar requisitos de contraseña
    const allRequirementsMet = passwordRequirements.every(req => req.test(formData.password));
    if (!allRequirementsMet) {
      return;
    }

    await onSubmit({
      email: formData.email,
      password: formData.password,
      first_name: formData.first_name,
      last_name: formData.last_name,
      city_id: formData.city_id,
      phone: formData.phone
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    const requiredFields = formData.email &&
                          formData.password &&
                          formData.confirmPassword &&
                          formData.first_name &&
                          formData.last_name &&
                          formData.city_id;

    const allRequirementsMet = passwordRequirements.every(req => req.test(formData.password));
    const passwordsMatchValid = formData.password === formData.confirmPassword;

    return requiredFields && allRequirementsMet && passwordsMatchValid;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">
          Correo Electrónico <span className="text-red-500">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="tu@email.com"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          required
          disabled={loading}
          className="h-12"
        />
      </div>

      {/* Nombre */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">
            Nombre <span className="text-red-500">*</span>
          </Label>
          <Input
            id="first_name"
            type="text"
            placeholder="Juan"
            value={formData.first_name}
            onChange={(e) => handleChange('first_name', e.target.value)}
            required
            disabled={loading}
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="last_name">
            Apellidos <span className="text-red-500">*</span>
          </Label>
          <Input
            id="last_name"
            type="text"
            placeholder="Pérez"
            value={formData.last_name}
            onChange={(e) => handleChange('last_name', e.target.value)}
            required
            disabled={loading}
            className="h-12"
          />
        </div>
      </div>

      {/* Ciudad */}
      <div className="space-y-2">
        <Label htmlFor="city_id">
          Ciudad <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.city_id}
          onValueChange={(value) => handleChange('city_id', value)}
          disabled={loading}
        >
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Selecciona una ciudad" />
          </SelectTrigger>
          <SelectContent>
            {cities.map((city) => (
              <SelectItem key={city.id} value={city.id}>
                {city.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Teléfono */}
      <div className="space-y-2">
        <Label htmlFor="phone">Teléfono</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+34 612 345 678"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          disabled={loading}
          className="h-12"
        />
      </div>

      {/* Contraseña */}
      <div className="space-y-2">
        <Label htmlFor="password">
          Contraseña <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
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
        {(passwordFocused || formData.password) && (
          <div className="mt-2 p-3 bg-slate-50 rounded-lg space-y-1.5">
            <p className="text-xs font-medium text-slate-700 mb-2">
              Requisitos de contraseña:
            </p>
            {passwordRequirements.map((requirement, index) => {
              const isMet = requirement.test(formData.password);
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
            value={formData.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            required
            disabled={loading}
            className={`h-12 pr-10 ${
              formData.confirmPassword && !passwordsMatch
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
        {formData.confirmPassword && !passwordsMatch && (
          <p className="text-xs text-red-600">Las contraseñas no coinciden</p>
        )}
      </div>

      {/* Botón Submit */}
      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 h-12 text-base"
        disabled={loading || !isFormValid()}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            Registrando...
          </div>
        ) : (
          'Crear Cuenta'
        )}
      </Button>
    </form>
  );
}
