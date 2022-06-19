// @ts-ignore

/* eslint-disable */
import { request } from 'umi';

export async function fetchAll(options) {
  return request('/api/admin/all', {
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
/** 登录接口 POST /api/login/account */

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
export async function updateArticle(id) {
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

export async function rule(params, options) {
  return request('/api/rule', {
    method: 'GET',
    params: { ...params },
    ...(options || {}),
  });
}
/** 新建规则 PUT /api/rule */

export async function updateRule(options) {
  return request('/api/rule', {
    method: 'PUT',
    ...(options || {}),
  });
}
/** 新建规则 POST /api/rule */

export async function addRule(options) {
  return request('/api/rule', {
    method: 'POST',
    ...(options || {}),
  });
}
/** 删除规则 DELETE /api/rule */

export async function removeRule(options) {
  return request('/api/rule', {
    method: 'DELETE',
    ...(options || {}),
  });
}
