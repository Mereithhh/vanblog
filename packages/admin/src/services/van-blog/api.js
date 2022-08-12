// @ts-ignore

/* eslint-disable */
import { request } from 'umi';

export async function fetchAllMeta(options) {
  return request('/api/admin/meta', {
    method: 'GET',
    ...(options || {}),
  });
}

export async function fetchInit(body) {
  return request('/api/admin/init', {
    method: 'POST',
    data: body,
  });
}
export async function searchArtclesByLink(link) {
  return request('/api/admin/article/searchByLink', {
    method: 'POST',
    data: {
      link,
    },
  });
}
export async function scanImgsOfArticles() {
  return request('/api/admin/img/scan', {
    method: 'POST',
  });
}

export async function login(body, options) {
  return request('/api/admin/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

export async function createArticle(body) {
  return request('/api/admin/article', {
    method: 'POST',
    data: body,
  });
}

export async function deleteArticle(id) {
  return request(`/api/admin/article/${id}`, {
    method: 'DELETE',
  });
}

export async function getAllCategories() {
  return request(`/api/admin/category/all`, {
    method: 'GET',
  });
}
export async function updateSiteInfo(body) {
  return request(`/api/admin/meta/site`, {
    method: 'PUT',
    data: body,
  });
}
export async function updateUser(body) {
  return request(`/api/admin/auth`, {
    method: 'PUT',
    data: body,
  });
}
export async function createCategory(body) {
  return request(`/api/admin/category/`, {
    method: 'POST',
    data: body,
  });
}
export async function updateCategory(name, value) {
  return request(`/api/admin/category/${name}?value=${value}`, {
    method: 'PUT',
  });
}
export async function deleteCategory(name) {
  return request(`/api/admin/category/${name}`, {
    method: 'DELETE',
  });
}
export async function deleteDraft(id) {
  return request(`/api/admin/draft/${id}`, {
    method: 'DELETE',
  });
}
export async function createDraft(body) {
  return request(`/api/admin/draft`, {
    method: 'POST',
    data: body,
  });
}
export async function publishDraft(id, body) {
  return request(`/api/admin/draft/publish?id=${id}`, {
    method: 'POST',
    data: body,
  });
}
export async function createDonate(body) {
  return request(`/api/admin/meta/reward`, {
    method: 'POST',
    data: body,
  });
}
export async function updateLink(body) {
  return request(`/api/admin/meta/link`, {
    method: 'PUT',
    data: body,
  });
}
export async function getLink() {
  return request(`/api/admin/meta/link`, {
    method: 'GET',
  });
}
export async function updateMenu(body) {
  return request(`/api/admin/meta/menu`, {
    method: 'PUT',
    data: body,
  });
}
export async function getMenu() {
  return request(`/api/admin/meta/menu`, {
    method: 'GET',
  });
}
export async function deleteLink(name) {
  return request(`/api/admin/meta/link/${name}`, {
    method: 'DELETE',
  });
}
export async function deleteMenu(name) {
  return request(`/api/admin/meta/menu/${name}`, {
    method: 'DELETE',
  });
}
export async function createLink(body) {
  return request(`/api/admin/meta/link`, {
    method: 'POST',
    data: body,
  });
}
export async function updateDonate(body) {
  return request(`/api/admin/meta/reward`, {
    method: 'PUT',
    data: body,
  });
}
export async function deleteDonate(name) {
  return request(`/api/admin/meta/reward/${name}`, {
    method: 'DELETE',
  });
}
export async function getDonate() {
  return request(`/api/admin/meta/reward`, {
    method: 'GET',
  });
}
export async function updateSocial(body) {
  return request(`/api/admin/meta/social`, {
    method: 'PUT',
    data: body,
  });
}
export async function getSocial() {
  return request(`/api/admin/meta/social`, {
    method: 'GET',
  });
}
export async function getSocialTypes() {
  return request(`/api/admin/meta/social/types`, {
    method: 'GET',
  });
}
export async function getTags() {
  return request(`/api/admin/tag/all`, {
    method: 'GET',
  });
}
export async function importAll() {
  return request(`/api/admin/backup/import`, {
    method: 'POST',
  });
}
export async function exportAll() {
  return request(`/api/admin/backup/export`, {
    method: 'GET',
    skipErrorHandler: true,
    responseType: 'blob',
  });
}
export async function deleteSocial(name) {
  return request(`/api/admin/meta/social/${name}`, {
    method: 'DELETE',
  });
}
export async function updateArticle(id, body) {
  return request(`/api/admin/article/${id}`, {
    method: 'PUT',
    data: body,
  });
}
export async function updateDraft(id, body) {
  return request(`/api/admin/draft/${id}`, {
    method: 'PUT',
    data: body,
  });
}
export async function updateAbout(body) {
  return request(`/api/admin/meta/about`, {
    method: 'PUT',
    data: body,
  });
}
export async function getAbout() {
  return request(`/api/admin/meta/about`, {
    method: 'GET',
  });
}
export async function getArticleById(id) {
  return request(`/api/admin/article/${id}`, {
    method: 'GET',
  });
}
export async function getDraftById(id) {
  return request(`/api/admin/draft/${id}`, {
    method: 'GET',
  });
}
export async function getSiteInfo() {
  return request(`/api/admin/meta/site`, {
    method: 'GET',
  });
}
export async function getArticlesByOption(option) {
  const newQuery = {};
  for (const [k, v] of Object.entries(option)) {
    newQuery[k] = v;
  }
  let queryString = '';
  for (const [k, v] of Object.entries(newQuery)) {
    queryString += `${k}=${v}&`;
  }
  queryString = queryString.substring(0, queryString.length - 1);
  return request(`/api/admin/article?${queryString}&toListView=true`, {
    method: 'GET',
  });
}
export async function getImgs(page, pageSize = 10) {
  return request(`/api/admin/img?page=${page}&pageSize=${pageSize}`, {
    method: 'GET',
  });
}
export async function deleteImgBySign(sign) {
  return request(`/api/admin/img/${sign}`, {
    method: 'DELETE',
  });
}
export async function deleteAllIMG() {
  return request(`/api/admin/img/all/delete`, {
    method: 'DELETE',
  });
}
export async function getStaticSetting() {
  return request(`/api/admin/setting/static`, {
    method: 'GET',
  });
}
export async function updateStaticSetting(data) {
  return request(`/api/admin/setting/static`, {
    method: 'PUT',
    data: data,
  });
}
export async function getDraftsByOption(option) {
  const newQuery = {};
  for (const [k, v] of Object.entries(option)) {
    newQuery[k] = v;
  }
  let queryString = '';
  for (const [k, v] of Object.entries(newQuery)) {
    queryString += `${k}=${v}&`;
  }
  queryString = queryString.substring(0, queryString.length - 1);
  return request(`/api/admin/draft?${queryString}&toListView=true`, {
    method: 'GET',
  });
}
export async function getWelcomeData(tab, overviewNum = 5, viewNum = 5, articleTabNum = 5) {
  return request(
    `/api/admin/analysis?tab=${tab}&viewerDataNum=${viewNum}&overviewDataNum=${overviewNum}&articleTabDataNum=${articleTabNum}`,
    {
      method: 'GET',
    },
  );
}
