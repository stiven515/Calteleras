import { migrateDesign, type Design } from '@cartelera/core';
import { useAuth } from '../auth/authStore';
import { supabase } from './client';
import { runSync } from './session';

export const shareUrl = (id: string): string => `${window.location.origin}/d/${id}`;

function requireUser() {
  const user = useAuth.getState().user;
  if (!supabase || !user) throw new Error('Inicia sesión para compartir');
  return { client: supabase, user };
}

/** Marca un diseño como público (o privado). Primero sincroniza para que exista en la nube con sus imágenes. */
export async function setDesignPublic(id: string, isPublic: boolean): Promise<void> {
  const { client, user } = requireUser();
  await runSync();
  const { data, error } = await client.from('designs').update({ is_public: isPublic }).eq('id', id).eq('user_id', user.id).select('id');
  if (error) throw error;
  if (!data?.length) throw new Error('El diseño aún no está en la nube');
}

export async function listPublicIds(): Promise<Set<string>> {
  const { client, user } = requireUser();
  const { data, error } = await client.from('designs').select('id').eq('user_id', user.id).eq('is_public', true);
  if (error) throw error;
  return new Set((data ?? []).map((r) => r.id as string));
}

export interface PublicDesign {
  design: Design;
  ownerId: string;
}

/** Lee un diseño público (sin sesión). Devuelve null si no existe o no es público. */
export async function fetchPublicDesign(id: string): Promise<PublicDesign | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('designs').select('data, user_id').eq('id', id).eq('is_public', true).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const design = migrateDesign(data.data);
  return design ? { design, ownerId: data.user_id as string } : null;
}

export function publicAssetUrl(ownerId: string, assetId: string): string {
  if (!supabase) return '';
  return supabase.storage.from('assets').getPublicUrl(`${ownerId}/${assetId}`).data.publicUrl;
}
