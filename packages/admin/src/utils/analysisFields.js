/**
 * Admin copy for built-in analytics IDs (#350).
 *
 * VanBlog already injects gtag for `gaAnalysisId` (GA4 `G-` and legacy `UA-`)
 * and hm.js for `baiduAnalysisId`. The gap is discoverability: users asked
 * whether `G-XXXXXXXXX` is valid, and why Google may show no data from CN.
 */

const ANALYSIS_ADMIN_PATH = '站点管理 / 系统设置 / 站点配置 / 高级设置';

const GA_ANALYSIS_FIELD = Object.freeze({
  name: 'gaAnalysisId',
  label: 'Google Analytics 测量 ID',
  placeholder: 'G-XXXXXXXXX，留空表示不启用',
  tooltip:
    'GA4 测量 ID，格式为 G-XXXXXXXXX（旧版 Universal Analytics 的 UA-XXXXXXXXX-X 也可）。只填这一串，不要整段粘贴 gtag 代码。保存后无需重启。大陆访客访问 googletagmanager.com 常会超时，谷歌后台「尚未收到数据」多半是网络/地区问题，不一定是 ID 写错；可先看 Analytics「实时」。替代方案见定制化里插入 Umami。',
});

const BAIDU_ANALYSIS_FIELD = Object.freeze({
  name: 'baiduAnalysisId',
  label: '百度统计 ID',
  placeholder: '请输入百度统计站点 ID，留空表示不启用',
  tooltip: '百度统计后台站点的 hm.js 参数（脚本地址问号后的那一串）。留空不启用。',
});

module.exports = {
  ANALYSIS_ADMIN_PATH,
  GA_ANALYSIS_FIELD,
  BAIDU_ANALYSIS_FIELD,
};
