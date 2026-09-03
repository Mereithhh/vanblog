export type BackupCategory = {
  name: string;
  id?: number;
  type?: string;
  private?: boolean;
  password?: string;
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
  const prev = byName.get(name) || { name };
  byName.set(name, {
    name,
    id: raw.id ?? prev.id,
    type: raw.type ?? prev.type,
    private: raw.private ?? prev.private,
    password: raw.password ?? prev.password,
  });
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
  return {
    id: doc?.id,
    name: doc?.name,
    type: doc?.type || 'category',
    private: Boolean(doc?.private),
    password: doc?.password || '',
  };
}
