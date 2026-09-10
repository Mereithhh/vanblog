export type BackupCategory = {
  name: string;
  id?: number;
  type?: string;
  private?: boolean;
  password?: string;
  hidden?: boolean;
  order?: number;
};

export type BackupCategorySource = {
  categories?: any[];
  articles?: Array<{ category?: string }>;
  drafts?: Array<{ category?: string }>;
  meta?: { categories?: any[] };
};

function addCategory(byName: Map<string, BackupCategory>, raw: any) {
  if (raw == null || raw === '') {
    return;
  }
  if (typeof raw === 'string') {
    const name = raw.trim();
    if (!name) {
      return;
    }
    if (!byName.has(name)) {
      byName.set(name, { name });
    }
    return;
  }
  const name = typeof raw.name === 'string' ? raw.name.trim() : '';
  if (!name) {
    return;
  }
  const prev: BackupCategory = byName.get(name) || { name };
  const next: BackupCategory = {
    name,
    id: raw.id ?? prev.id,
    type: raw.type ?? prev.type,
    private: raw.private ?? prev.private,
    password: raw.password ?? prev.password,
    hidden: raw.hidden ?? prev.hidden,
  };
  const order = typeof raw.order === 'number' ? raw.order : prev.order;
  if (typeof order === 'number') {
    next.order = order;
  }
  byName.set(name, next);
}

/**
 * Collect category documents to restore from a backup JSON.
 * Supports current exports (name strings), full category documents,
 * and older backups that only keep category names on articles/drafts/meta.
 */
export function collectCategoriesFromBackup(data: BackupCategorySource = {}): BackupCategory[] {
  const byName = new Map<string, BackupCategory>();
  (data.categories || []).forEach((item) => addCategory(byName, item));
  (data.meta?.categories || []).forEach((item) => addCategory(byName, item));
  (data.articles || []).forEach((article) => addCategory(byName, article?.category));
  (data.drafts || []).forEach((draft) => addCategory(byName, draft?.category));
  return Array.from(byName.values());
}

export function toExportCategory(doc: any): BackupCategory {
  const exported: BackupCategory = {
    id: doc?.id,
    name: doc?.name,
    type: doc?.type || 'category',
    private: Boolean(doc?.private),
    password: doc?.password || '',
    hidden: Boolean(doc?.hidden),
  };
  if (typeof doc?.order === 'number') {
    exported.order = doc.order;
  }
  return exported;
}
