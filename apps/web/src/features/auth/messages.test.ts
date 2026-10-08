import { describe, expect, it } from 'vitest';
import { authErrorMessage, validateCredentials } from './messages';

describe('authErrorMessage', () => {
  it('traduce los errores comunes', () => {
    expect(authErrorMessage('Invalid login credentials')).toMatch(/incorrectos/);
    expect(authErrorMessage('User already registered')).toMatch(/Ya existe/);
    expect(authErrorMessage('Email not confirmed')).toMatch(/Confirma/);
    expect(authErrorMessage('TypeError: Failed to fetch')).toMatch(/conexión/);
  });
  it('no filtra mensajes técnicos desconocidos', () => {
    expect(authErrorMessage('pg: relation "x" does not exist')).toBe('No pudimos completar la acción. Inténtalo de nuevo.');
  });
});

describe('validateCredentials', () => {
  it('exige correo válido', () => {
    expect(validateCredentials('x', '12345678', 'signin')).toMatch(/correo/);
  });
  it('exige 8 caracteres solo al crear la cuenta', () => {
    expect(validateCredentials('a@b.co', '1234', 'signup')).toMatch(/8/);
    expect(validateCredentials('a@b.co', '1234', 'signin')).toBeNull();
  });
  it('exige contraseña al entrar', () => {
    expect(validateCredentials('a@b.co', '', 'signin')).toMatch(/contraseña/);
  });
});
