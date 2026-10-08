import type { SupabaseClient } from '@supabase/supabase-js';
import { migrateBrandKit, migrateDesign, type BrandKit, type Design } from '@cartelera/core';
import type { Repos } from '../storage/repos';

const BUCKET = 'assets';

/** Implementación de los repositorios sobre Supabase. La seguridad real la imponen las políticas RLS. */
export function createRemoteRepos(client: SupabaseClient, userId: string): Repos {
  const path = (id: string) => `${userId}/${id}`;

  return {
    designs: {
      async list() {
        const { data, error } = await client.from('designs').select('data').eq('user_id', userId);
        if (error) throw error;
        return (data ?? []).map((r) => migrateDesign(r.data)).filter((d): d is Design => d !== null);
      },
      async get(id) {
        const { data, error } = await client.from('designs').select('data').eq('id', id).eq('user_id', userId).maybeSingle();
        if (error) throw error;
        return data ? (migrateDesign(data.data) ?? undefined) : undefined;
      },
      async put(d) {
        // No se envía is_public: así un guardado normal nunca cambia si el diseño está compartido.
        const { error } = await client.from('designs').upsert({
          id: d.id,
          user_id: userId,
          template_id: d.templateId,
          format_id: d.formatId,
          title: d.title,
          data: d,
          updated_at: new Date(d.updatedAt).toISOString(),
        });
        if (error) throw error;
      },
      async remove(id) {
        const { error } = await client.from('designs').delete().eq('id', id).eq('user_id', userId);
        if (error) throw error;
      },
    },
    assets: {
      async get(id) {
        const { data, error } = await client.storage.from(BUCKET).download(path(id));
        return error ? undefined : data;
      },
      async put(id, blob) {
        const { error } = await client.storage.from(BUCKET).upload(path(id), blob, {
          upsert: true,
          contentType: blob.type || 'image/webp',
        });
        if (error) throw error;
      },
      async has(id) {
        const { data, error } = await client.storage.from(BUCKET).list(userId, { search: id, limit: 1 });
        if (error) throw error;
        return (data ?? []).some((f) => f.name === id);
      },
    },
    brand: {
      async get() {
        const { data, error } = await client.from('brand_kits').select('data').eq('user_id', userId).maybeSingle();
        if (error) throw error;
        return data ? migrateBrandKit(data.data) : null;
      },
      async put(kit: BrandKit) {
        const { error } = await client.from('brand_kits').upsert({
          user_id: userId,
          data: kit,
          updated_at: new Date(kit.updatedAt).toISOString(),
        });
        if (error) throw error;
      },
    },
  };
}
