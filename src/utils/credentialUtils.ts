export const ACCESS_PORTAL_URL = 'https://urcheck.vercel.app/';

/**
 * Generates an enterprise-strength secure password.
 * Contains uppercase, lowercase, numbers, and allowed symbols.
 */
export function generateSecurePassword(length: number = 10): string {
  const uppers = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lowers = 'abcdefghijkmnpqrstuvwxyz';
  const numbers = '23456789';
  const symbols = '!@#$%&*';

  // Ensure at least one from each category
  const guaranteed = [
    uppers[Math.floor(Math.random() * uppers.length)],
    lowers[Math.floor(Math.random() * lowers.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
  ];

  const allChars = uppers + lowers + numbers + symbols;
  const remainingCount = Math.max(4, length) - guaranteed.length;
  
  for (let i = 0; i < remainingCount; i++) {
    guaranteed.push(allChars[Math.floor(Math.random() * allChars.length)]);
  }

  // Shuffle
  return guaranteed.sort(() => Math.random() - 0.5).join('');
}

/**
 * Generates a clean username derived from the user's name and optional code.
 * Example: "Carlos Mendoza Ortiz" -> "carlos.mendoza"
 */
export function generateUsername(fullName: string, code?: string): string {
  if (!fullName.trim()) return code ? code.toLowerCase() : 'colaborador';
  
  // Normalize accents and remove special characters
  const normalized = fullName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

  const parts = normalized.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0];
  }

  // First name + "." + first surname
  const firstName = parts[0];
  const firstSurname = parts[1];
  return `${firstName}.${firstSurname}`;
}

export interface ShareCredentialsData {
  name: string;
  username: string;
  password: string;
  roleName: string;
  branchName?: string;
  phone?: string;
  portalUrl?: string;
}

/**
 * Formats standard text for WhatsApp credential delivery.
 */
export function formatWhatsAppMessage(data: ShareCredentialsData): string {
  const portal = data.portalUrl || ACCESS_PORTAL_URL;
  const branchLine = data.branchName ? `\n🏢 *Sede Asignada:* ${data.branchName}` : '';

  return `¡Hola *${data.name}*! Te damos la bienvenida a *Urcheck - Control de Asistencia Biométrico*.

Tus credenciales institucionales de acceso son:

🔗 *Link de Acceso:* ${portal}
👤 *Usuario:* ${data.username}
🔑 *Contraseña:* ${data.password}
🛡️ *Rol:* ${data.roleName}${branchLine}

_Por motivos de seguridad, te sugerimos cambiar tu contraseña al ingresar por primera vez._`;
}

/**
 * Generates WhatsApp Web / App direct share URL.
 */
export function getWhatsAppShareUrl(phone: string | undefined, message: string): string {
  const cleanPhone = (phone || '').replace(/[^\d+]/g, '');
  const encodedText = encodeURIComponent(message);
  
  if (cleanPhone) {
    return `https://wa.me/${cleanPhone.replace('+', '')}?text=${encodedText}`;
  }
  return `https://api.whatsapp.com/send?text=${encodedText}`;
}
