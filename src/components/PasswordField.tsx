import React, { useState } from 'react';
import { Eye, EyeOff, Sparkles, RefreshCw } from 'lucide-react';
import { generateSecurePassword } from '../utils/credentialUtils';

interface PasswordFieldProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  showGenerator?: boolean;
  helperText?: string;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({
  id = 'password-field',
  label = 'Contraseña',
  value,
  onChange,
  placeholder = '••••••••••••',
  required = false,
  className = '',
  showGenerator = false,
  helperText,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleGenerate = () => {
    const generated = generateSecurePassword(11);
    onChange(generated);
    setShowPassword(true); // show when generated so admin can see it
  };

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-center justify-between">
        {label && (
          <label htmlFor={id} className="block text-xs font-bold text-neutral-700">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
        )}
        {showGenerator && (
          <button
            type="button"
            onClick={handleGenerate}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0871A0] hover:text-[#0A3142] transition cursor-pointer"
            title="Generar una contraseña de alta seguridad aleatoria"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#138128]" />
            <span>Generar Contraseña Segura</span>
          </button>
        )}
      </div>

      <div className="relative">
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="w-full pr-10 pl-3 py-2 text-xs sm:text-sm rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#0871A0] focus:border-[#0871A0] font-mono transition-all bg-white"
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
          title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-[#0871A0] transition cursor-pointer rounded-lg hover:bg-neutral-100"
        >
          {showPassword ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
      </div>

      {helperText && (
        <p className="text-[11px] text-neutral-500">{helperText}</p>
      )}
    </div>
  );
};
