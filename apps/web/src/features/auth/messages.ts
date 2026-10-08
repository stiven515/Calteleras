/** Traduce los errores de Supabase Auth a mensajes claros para la persona. */
export function authErrorMessage(raw: string): string {
  const m = raw.toLowerCase();
  if (m.includes('invalid login credentials')) return 'Correo o contraseña incorrectos.';
  if (m.includes('already registered') || m.includes('already been registered')) return 'Ya existe una cuenta con ese correo. Prueba entrar.';
  if (m.includes('email not confirmed')) return 'Confirma tu correo antes de entrar: te enviamos un enlace.';
  if (m.includes('password should be at least') || m.includes('weak password')) return 'La contraseña es muy corta o débil. Usa al menos 8 caracteres.';
  if (m.includes('invalid email') || m.includes('unable to validate email')) return 'Ese correo no parece válido.';
  if (m.includes('rate limit') || m.includes('too many')) return 'Demasiados intentos. Espera un momento y vuelve a probar.';
  if (m.includes('failed to fetch') || m.includes('network')) return 'No hay conexión. Revisa tu internet e inténtalo otra vez.';
  return 'No pudimos completar la acción. Inténtalo de nuevo.';
}

export const MIN_PASSWORD = 8;

export function validateCredentials(email: string, password: string, mode: 'signin' | 'signup'): string | null {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Escribe un correo válido.';
  if (mode === 'signup' && password.length < MIN_PASSWORD) return `La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.`;
  if (!password) return 'Escribe tu contraseña.';
  return null;
}
