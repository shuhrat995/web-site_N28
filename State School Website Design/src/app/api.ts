import { API_BASE_URL } from '@/app/config';

export async function loginAdmin(credentials: any) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(credentials)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Login xatosi');
  }
  return res.json();
}

export async function getPageContent(page: string) {
  const res = await fetch(`${API_BASE_URL}/sections/${page}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch content');
  return res.json();
}

export async function updateSectionContent(page: string, section: string, key: string, value: string, token: string) {
  return fetch(`${API_BASE_URL}/sections/${page}/${section}/${key}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
    body: JSON.stringify({ value })
  });
}

export async function uploadContent(formData: FormData, token: string) {
  return fetch(`${API_BASE_URL}/content`, {
    method: 'POST',
    credentials: 'include',
    headers: token ? { 'Authorization': `Bearer ${token}` } : undefined,
    body: formData
  });
}

export async function getContents(category?: string) {
  const url = category ? `${API_BASE_URL}/content?category=${category}` : `${API_BASE_URL}/content`;
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error('Failed to fetch contents');
  return res.json();
}

export async function deleteContent(id: number, token: string) {
  return fetch(`${API_BASE_URL}/content/${id}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
  });
}

export async function getStudents(token: string) {
  const res = await fetch(`${API_BASE_URL}/students`, {
    credentials: 'include',
    headers: token ? { 'Authorization': `Bearer ${token}` } : undefined,
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('Failed to fetch students');
  return res.json();
}

export async function addStudent(studentData: any, token: string) {
  const res = await fetch(`${API_BASE_URL}/students`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
    body: JSON.stringify(studentData)
  });
  if (!res.ok) throw new Error('Failed to add student');
  return res.json();
}

export async function updateStudent(id: number, studentData: any, token: string) {
  const res = await fetch(`${API_BASE_URL}/students/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
    body: JSON.stringify(studentData)
  });
  if (!res.ok) throw new Error('Failed to update student');
  return res.json();
}

export async function deleteStudent(id: number, token: string) {
  const res = await fetch(`${API_BASE_URL}/students/${id}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
  });
  if (!res.ok) throw new Error('Failed to delete student');
  return res.json();
}
