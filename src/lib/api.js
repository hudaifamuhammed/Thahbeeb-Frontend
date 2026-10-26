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

// Generate formatted direct download URL with custom filename (Heading then Thahbeeb)
export function getMediaDownloadUrl(url, captionOrTitle, defaultSuffix = 'Thahbeeb') {
  if (!url) return '';
  const fullUrl = resolveApiUrl(url);

  // Clean heading/caption: remove illegal filesystem chars
  let cleanName = (captionOrTitle || 'Media')
    .replace(/\.[^/.]+$/, "") // strip extension if present
    .replace(/[^\w\s-]/g, '')
    .trim();

  if (defaultSuffix && !new RegExp(`${defaultSuffix}$`, 'i').test(cleanName)) {
    cleanName = `${cleanName} - ${defaultSuffix}`;
  }

  // Cloudinary attachment transformation with custom filename
  if (fullUrl.includes('cloudinary.com') && fullUrl.includes('/upload/')) {
    return fullUrl.replace('/upload/', `/upload/fl_attachment:${encodeURIComponent(cleanName)}/`);
  }

  // Backend download proxy endpoint
  return resolveApiUrl(`/api/gallery/download?url=${encodeURIComponent(fullUrl)}&filename=${encodeURIComponent(cleanName)}`);
}

// Directly trigger download to device local storage
export function triggerDownload(url, captionOrTitle, defaultSuffix = 'Thahbeeb') {
  if (!url) return;
  const downloadUrl = getMediaDownloadUrl(url, captionOrTitle, defaultSuffix);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.setAttribute('download', '');
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}