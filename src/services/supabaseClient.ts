import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL_KEY = 'bavaria_supabase_url';
const SUPABASE_KEY_KEY = 'bavaria_supabase_anon_key';

const DEFAULT_SUPABASE_URL = 'https://tdcsahwfjccltelbthps.supabase.co';
const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkY3NhaHdmamNjbHRlbGJ0aHBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE4MjY1MjEsImV4cCI6MjEwNzQwMjUyMX0.f7NeUTOyguAhbHg2spAAHgjFs84ZTEnzSkIYmppr2X8';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function getSupabaseConfig(): SupabaseConfig {
  try {
    const url = localStorage.getItem(SUPABASE_URL_KEY) || DEFAULT_SUPABASE_URL;
    const anonKey = localStorage.getItem(SUPABASE_KEY_KEY) || DEFAULT_SUPABASE_KEY;
    return { url, anonKey };
  } catch (e) {
    return { url: DEFAULT_SUPABASE_URL, anonKey: DEFAULT_SUPABASE_KEY };
  }
}

export function saveSupabaseConfig(url: string, anonKey: string): void {
  try {
    if (url.trim() && anonKey.trim()) {
      localStorage.setItem(SUPABASE_URL_KEY, url.trim());
      localStorage.setItem(SUPABASE_KEY_KEY, anonKey.trim());
    } else {
      localStorage.removeItem(SUPABASE_URL_KEY);
      localStorage.removeItem(SUPABASE_KEY_KEY);
    }
  } catch (e) {
    console.error('Error saving Supabase config to localStorage', e);
  }
}

export function clearSupabaseConfig(): void {
  try {
    localStorage.removeItem(SUPABASE_URL_KEY);
    localStorage.removeItem(SUPABASE_KEY_KEY);
  } catch (e) {
    console.error('Error clearing Supabase config', e);
  }
}

let cachedClient: SupabaseClient | null = null;
let lastConfig: SupabaseConfig = { url: '', anonKey: '' };

export function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config.url || !config.anonKey) {
    cachedClient = null;
    return null;
  }

  if (cachedClient && lastConfig.url === config.url && lastConfig.anonKey === config.anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    lastConfig = config;
    return cachedClient;
  } catch (e) {
    console.error('Failed to initialize Supabase client', e);
    return null;
  }
}

export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'No hay credenciales de Supabase configuradas.' };
  }

  try {
    const { error } = await client.from('_bavaria_ping_test').select('*').limit(1);
    if (error && error.code !== 'PGRST116' && error.code !== '42P01') {
      return { success: false, message: `Error de conexión Supabase: ${error.message}` };
    }
    return { success: true, message: '¡Conexión exitosa con Supabase establecida correctamente!' };
  } catch (e: any) {
    return { success: false, message: `No se pudo conectar a Supabase: ${e.message || e}` };
  }
}
