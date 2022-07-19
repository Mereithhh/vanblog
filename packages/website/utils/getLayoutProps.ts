export function getLayoutProps(siteInfo: any) {
  return {
    walineServerUrl: siteInfo?.walineServerUrl || "",
    ipcHref: siteInfo.beianUrl,
    ipcNumber: siteInfo.beianNumber,
    since: siteInfo.since,
    logo: siteInfo.siteLogo,
    favicon: siteInfo.favicon,
    author: siteInfo.author,
    desc: siteInfo.authorDesc,
    authorLogo: siteInfo.authorLogo,
    authorLogoDark: siteInfo.authorLogoDark || "",
    siteName: siteInfo.siteName,
    siteDesc: siteInfo.siteDesc,
    baiduAnalysisID: siteInfo?.baiduAnalysisId || "",
    gaAnalysisID: siteInfo?.gaAnalysisId || "",
    logoDark: siteInfo?.siteLogoDark || "",
  };
}
