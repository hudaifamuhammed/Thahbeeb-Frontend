const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

function authHeaders() {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export async function apiPost(path, body) {
    const res = await fetch(`${API_BASE_URL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(body),
    });
	const data = await res.json().catch(() => ({}));
	if (!res.ok) throw new Error(data.error || 'Request failed');
	return data;
}

export async function apiGet(path) {
    const res = await fetch(`${API_BASE_URL}${path}`, { headers: { ...authHeaders() } });
	const data = await res.json().catch(() => ({}));
	if (!res.ok) throw new Error(data.error || 'Request failed');
	return data;
}

// Multipart/form-data POST helper for file uploads
export async function apiPostForm(path, formData) {
    const res = await fetch(`${API_BASE_URL}${path}`, {
        method: 'POST',
        headers: { ...authHeaders() },
        body: formData,
    });
	const data = await res.json().catch(() => ({}));
	if (!res.ok) throw new Error(data.error || 'Request failed');
	return data;
}

export async function apiDelete(path) {
    const res = await fetch(`${API_BASE_URL}${path}`, { method: 'DELETE', headers: { ...authHeaders() } });
	const data = await res.json().catch(() => ({}));
	if (!res.ok) throw new Error(data.error || 'Request failed');
	return data;
}

// Resolve relative URLs returned by API (e.g. /uploads/abc.jpg) to absolute
export function resolveApiUrl(possiblyRelativeUrl) {
	if (!possiblyRelativeUrl) return possiblyRelativeUrl;
	if (possiblyRelativeUrl.startsWith('http://') || possiblyRelativeUrl.startsWith('https://')) return possiblyRelativeUrl;
	return `${API_BASE_URL}${possiblyRelativeUrl}`;
}

export async function apiPut(path, body) {
    const res = await fetch(`${API_BASE_URL}${path}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(body),
    });
	const data = await res.json().catch(() => ({}));
	if (!res.ok) throw new Error(data.error || 'Request failed');
	return data;
}