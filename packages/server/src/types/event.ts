export interface VanblogEventItem {
  eventName: string;
  eventNameChinese: string;
  eventDescription: string;
  passive: boolean;
}

export type VanblogEventType = 'system' | 'custom' | 'corn';

export const VanblogSystemEvents: VanblogEventItem[] = [
  {
    eventName: 'login',
    eventNameChinese: '登录',
    eventDescription: '登录',
    passive: true,
  },
  {
    eventName: 'logout',
    eventDescription: '登出',
    eventNameChinese: '登出',
    passive: true,
  },
  {
    eventName: 'beforeUpdateArticle',
    eventNameChinese: '更新文章之前',
    eventDescription:
      '更新文章之前，具体涉及到：发布草稿、保存文章、创建文章、更新文章信息，在此修改文章数据并返回会改变实际保存到数据库的值',
    passive: false,
  },
  {
    eventName: 'afterUpdateArticle',
    eventNameChinese: '更新文章之后',
    eventDescription: '更新文章之后，具体涉及到：发布草稿、保存文章、创建文章、更新文章信息',
    passive: true,
  },
  {
    eventName: 'deleteArticle',
    eventNameChinese: '删除文章',
    eventDescription: '删除文章',
    passive: true,
  },
  {
    eventName: 'beforeUpdateDraft',
    eventNameChinese: '更新草稿之前',
    eventDescription:
      '更新草稿之前，具体涉及到：保存草稿、创建草稿、更新草稿信息，在此修改文章内容并返回会改变实际保存到数据库的文章内容',
    passive: false,
  },
  {
    eventName: 'afterUpdateDraft',
    eventNameChinese: '更新草稿之后',
    eventDescription: '更新草稿之后，具体涉及到：保存草稿、创建草稿、更新草稿信息',
    passive: true,
  },
  {
    eventName: 'deleteDraft',
    eventNameChinese: '删除草稿',
    eventDescription: '删除草稿',
    passive: true,
  },
  {
    eventName: 'updateSiteInfo',
    eventNameChinese: '更新站点信息',
    eventDescription: '更新站点信息',
    passive: true,
  },
  {
    eventName: 'manualTriggerEvent',
    eventNameChinese: '手动触发事件',
    eventDescription: '手动触发事件事件',
    passive: true,
  },
];

export const VanblogSystemEventNames = VanblogSystemEvents.map((item) => item.eventName);
export type VanblogSystemEvent =
  | 'login'
  | 'logout'
  | 'beforeUpdateArticle'
  | 'afterUpdateArticle'
  | 'deleteArticle'
  | 'beforeUpdateDraft'
  | 'afterUpdateDraft'
  | 'deleteDraft'
  | 'updateSiteInfo'
  | 'manualTriggerEvent';
