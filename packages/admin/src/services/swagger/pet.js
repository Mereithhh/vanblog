// @ts-ignore

/* eslint-disable */
import { request } from 'umi';
/** Update an existing pet PUT /pet */

export async function updatePet(body, options) {
  return request('/pet', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
/** Add a new pet to the store POST /pet */

export async function addPet(body, options) {
  return request('/pet', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
/** Finds Pets by status Multiple status values can be provided with comma separated strings GET /pet/findByStatus */

export async function findPetsByStatus(params, options) {
  return request('/pet/findByStatus', {
    method: 'GET',
    params: { ...params },
    ...(options || {}),
  });
}
/** Finds Pets by tags Muliple tags can be provided with comma separated strings. Use         tag1, tag2, tag3 for testing. GET /pet/findByTags */

export async function findPetsByTags(params, options) {
  return request('/pet/findByTags', {
    method: 'GET',
    params: { ...params },
    ...(options || {}),
  });
}
/** Find pet by ID Returns a single pet GET /pet/${param0} */

export async function getPetById(params, options) {
  const { petId: param0 } = params;
  return request(`/pet/${param0}`, {
    method: 'GET',
    params: { ...params },
    ...(options || {}),
  });
}
/** Updates a pet in the store with form data POST /pet/${param0} */

export async function updatePetWithForm(params, body, options) {
  const { petId: param0 } = params;
  const formData = new FormData();
  Object.keys(body).forEach((ele) => {
    const item = body[ele];

    if (item !== undefined && item !== null) {
      formData.append(ele, typeof item === 'object' ? JSON.stringify(item) : item);
    }
  });
  return request(`/pet/${param0}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    params: { ...params },
    data: formData,
    ...(options || {}),
  });
}
/** Deletes a pet DELETE /pet/${param0} */

export async function deletePet(params, options) {
  const { petId: param0 } = params;
  return request(`/pet/${param0}`, {
    method: 'DELETE',
    params: { ...params },
    ...(options || {}),
  });
}
/** uploads an image POST /pet/${param0}/uploadImage */

export async function uploadFile(params, body, options) {
  const { petId: param0 } = params;
  const formData = new FormData();
  Object.keys(body).forEach((ele) => {
    const item = body[ele];

    if (item !== undefined && item !== null) {
      formData.append(ele, typeof item === 'object' ? JSON.stringify(item) : item);
    }
  });
  return request(`/pet/${param0}/uploadImage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    params: { ...params },
    data: formData,
    ...(options || {}),
  });
}
