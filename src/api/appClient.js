import { createClient } from '@supabase/supabase-js';
import { DNN_LOCAL_SEED_RECORDS } from '@/data/dnnSeedRecords';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);
const storageKey = 'dnn_sandbox_records_v2';

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;

const sortRecords = (records, sort) => {
  if (!sort) return records;
  const descending = sort.startsWith('-');
  const field = descending ? sort.slice(1) : sort;
  return [...records].sort((a, b) => {
    const left = a[field] ?? '';
    const right = b[field] ?? '';
    if (left === right) return 0;
    return (left > right ? 1 : -1) * (descending ? -1 : 1);
  });
};

const readLocal = () => {
  try {
    const stored = localStorage.getItem(storageKey);
    return stored === null ? DNN_LOCAL_SEED_RECORDS : JSON.parse(stored);
  } catch {
    return DNN_LOCAL_SEED_RECORDS;
  }
};

const writeLocal = (records) => {
  localStorage.setItem(storageKey, JSON.stringify(records));
  window.dispatchEvent(new CustomEvent('dnn-records-changed'));
};

const fromRow = (row) => ({
  ...(row.data || {}),
  id: row.id,
  created_date: row.created_at,
  updated_date: row.updated_at,
});

const localEntity = (entity) => ({
  async list(sort, limit = 5000) {
    return sortRecords(readLocal().filter((row) => row.entity === entity).map(fromRow), sort).slice(0, limit);
  },
  async filter(criteria = {}, sort, limit = 5000) {
    const records = await this.list(sort, 5000);
    return records.filter((record) =>
      Object.entries(criteria).every(([key, value]) => record[key] === value)
    ).slice(0, limit);
  },
  async get(id) {
    const row = readLocal().find((record) => record.entity === entity && record.id === id);
    if (!row) throw new Error(`${entity} record not found`);
    return fromRow(row);
  },
  async create(data) {
    const now = new Date().toISOString();
    const row = { id: crypto.randomUUID(), entity, data, created_at: now, updated_at: now };
    writeLocal([...readLocal(), row]);
    return fromRow(row);
  },
  async bulkCreate(items) {
    return Promise.all(items.map((item) => this.create(item)));
  },
  async update(id, data) {
    let updated;
    const rows = readLocal().map((row) => {
      if (row.entity !== entity || row.id !== id) return row;
      updated = { ...row, data: { ...row.data, ...data }, updated_at: new Date().toISOString() };
      return updated;
    });
    if (!updated) throw new Error(`${entity} record not found`);
    writeLocal(rows);
    return fromRow(updated);
  },
  async delete(id) {
    writeLocal(readLocal().filter((row) => !(row.entity === entity && row.id === id)));
    return { id };
  },
  subscribe(callback) {
    const handler = () => callback({ type: 'change', entity });
    window.addEventListener('dnn-records-changed', handler);
    return () => window.removeEventListener('dnn-records-changed', handler);
  },
});

const remoteEntity = (entity) => ({
  async list(sort, limit = 5000) {
    const { data, error } = await supabase.from('app_records').select('*').eq('entity', entity).limit(5000);
    if (error) throw error;
    return sortRecords(data.map(fromRow), sort).slice(0, limit);
  },
  async filter(criteria = {}, sort, limit = 5000) {
    const records = await this.list(sort, 5000);
    return records.filter((record) =>
      Object.entries(criteria).every(([key, value]) => record[key] === value)
    ).slice(0, limit);
  },
  async get(id) {
    const { data, error } = await supabase.from('app_records').select('*').eq('entity', entity).eq('id', id).single();
    if (error) throw error;
    return fromRow(data);
  },
  async create(data) {
    const { data: row, error } = await supabase.from('app_records').insert({ entity, data }).select().single();
    if (error) throw error;
    return fromRow(row);
  },
  async bulkCreate(items) {
    const { data, error } = await supabase.from('app_records').insert(items.map((item) => ({ entity, data: item }))).select();
    if (error) throw error;
    return data.map(fromRow);
  },
  async update(id, updates) {
    const current = await this.get(id);
    const { id: _id, created_date: _created, updated_date: _updated, ...existing } = current;
    const { data, error } = await supabase.from('app_records').update({ data: { ...existing, ...updates } }).eq('entity', entity).eq('id', id).select().single();
    if (error) throw error;
    return fromRow(data);
  },
  async delete(id) {
    const { error } = await supabase.from('app_records').delete().eq('entity', entity).eq('id', id);
    if (error) throw error;
    return { id };
  },
  subscribe(callback) {
    const channel = supabase.channel(`records:${entity}:${crypto.randomUUID()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_records', filter: `entity=eq.${entity}` }, callback)
      .subscribe();
    return () => supabase.removeChannel(channel);
  },
});

const entities = new Proxy({}, {
  get: (_target, entity) => isConfigured ? remoteEntity(String(entity)) : localEntity(String(entity)),
});

const getCurrentUser = async () => {
  if (!supabase) {
    return { id: 'sandbox-admin', email: 'sandbox@1dnn.local', full_name: 'Sandbox Admin', role: 'admin' };
  }
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw error || new Error('Not signed in');
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
  return { ...user.user_metadata, ...profile, id: user.id, email: user.email };
};

const invokeFunction = async (name, body) => {
  if (!supabase) {
    if (name === 'dnnSubscribe') {
      const email = String(body?.email || '').trim().toLowerCase();
      if (!email) throw new Error('Email is required');
      const subscribers = await localEntity('DnnSubscriber').list('-created_date', 5000);
      const existing = subscribers.find((subscriber) => subscriber.email?.toLowerCase() === email);
      if (!existing) {
        await localEntity('DnnSubscriber').create({
          ...body,
          email,
          tier: body?.tier || 'tier1',
          subscribed_at: new Date().toISOString(),
          last_engaged: new Date().toISOString(),
          is_hot_lead: Boolean(body?.is_hot_lead),
          unsubscribed: false,
        });
      }
      return { data: { success: true, action: existing ? 'already_subscribed' : 'subscribed' } };
    }
    throw new Error(`${name} is unavailable until Supabase is configured.`);
  }
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) throw error;
  return { data };
};

export const appClient = {
  mode: isConfigured ? 'supabase' : 'local-sandbox',
  entities,
  auth: {
    me: getCurrentUser,
    async isAuthenticated() {
      if (!supabase) return true;
      const { data: { session } } = await supabase.auth.getSession();
      return Boolean(session);
    },
    async updateMe(updates) {
      const user = await getCurrentUser();
      if (!supabase) return { ...user, ...updates };
      const { data, error } = await supabase.from('profiles').upsert({ id: user.id, ...updates }).select().single();
      if (error) throw error;
      return { ...user, ...data };
    },
    async logout(redirectTo) {
      if (supabase) await supabase.auth.signOut();
      if (redirectTo) window.location.assign('/');
    },
    redirectToLogin(returnTo = window.location.href) {
      sessionStorage.setItem('dnn_return_to', returnTo);
      window.location.assign('/login');
    },
  },
  functions: { invoke: invokeFunction },
  integrations: {
    Core: {
      async InvokeLLM(body) {
        const result = await invokeFunction('invoke-llm', body);
        return result?.data ?? result;
      },
      SendEmail: (body) => invokeFunction('send-email', body),
      async UploadFile({ file }) {
        if (!supabase) return { file_url: URL.createObjectURL(file) };
        const path = `${crypto.randomUUID()}-${file.name}`;
        const { error } = await supabase.storage.from('public-assets').upload(path, file);
        if (error) throw error;
        const { data } = supabase.storage.from('public-assets').getPublicUrl(path);
        return { file_url: data.publicUrl };
      },
    },
  },
};
