import { useState, useEffect } from 'react';
import { Plus, Image, Video, Edit, Trash2, Download } from 'lucide-react';
import { apiGet, apiPostForm, apiDelete, resolveApiUrl, apiPut } from '../../lib/api';

const GalleryManagement = () => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    caption: '',
    type: 'image',
    category: 'general',
  });
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  const fetchGalleryItems = async () => {
    try {
      const list = await apiGet('/api/gallery');
      setGalleryItems(list || []);
    } catch (_) {
      setGalleryItems([]);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const k = 1024; const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    const d = dateString ? new Date(dateString) : null;
    if (!d || Number.isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getCategoryColor = (category) => {
    const colors = { 'general': 'bg-gray-100 text-gray-800', 'events': 'bg-blue-100 text-blue-800', 'competitions': 'bg-green-100 text-green-800', 'awards': 'bg-yellow-100 text-yellow-800', 'behind_scenes': 'bg-purple-100 text-purple-800' };
    return colors[category] || colors['general'];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        // Only update metadata
        await apiPut(`/api/gallery/${editing._id || editing.id}`, { caption: formData.caption, type: formData.type, category: formData.category });
      } else {
        if (!file) { setSubmitting(false); return; }
        const fd = new FormData();
        fd.append('file', file);
        fd.append('caption', formData.caption);
        fd.append('type', formData.type);
        fd.append('category', formData.category);
        await apiPostForm('/api/gallery', fd);
      }
      setShowModal(false);
      setFormData({ caption: '', type: 'image', category: 'general' });
      setFile(null);
      setEditing(null);
      await fetchGalleryItems();
    } catch (_err) {
      // noop for now
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gallery Management</h1>
          <p className="text-gray-600">Manage photos and videos in the gallery</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Add Media</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {galleryItems.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No media yet</h3>
            <p className="text-gray-600">Click Add Media to upload images or videos.</p>
          </div>
        ) : (
          galleryItems.map((item) => (
            <div key={item._id || item.id} className="card">
              <div className="relative mb-4">
                {item.type === 'image' ? (
                  <img src={resolveApiUrl(item.url)} alt={item.caption} className="w-full h-48 object-cover rounded-lg" loading="lazy" decoding="async" />
                ) : (
                  <video src={resolveApiUrl(item.url)} className="w-full h-48 object-cover rounded-lg" controls preload="metadata" />
                )}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(item.category)}`}>{item.category}</span>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900 line-clamp-2">{item.caption}</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  {item.type === 'image' ? (<Image className="h-4 w-4" />) : (<Video className="h-4 w-4" />)}
                  <span>{item.type}</span>
                  <span>•</span>
                  <span>{formatFileSize(item.fileSize)}</span>
                </div>
                <p className="text-xs text-gray-500">{formatDate(item.createdAt)}</p>
              </div>
              <div className="flex space-x-2 mt-4">
                <a href={resolveApiUrl(item.url)} download className="flex-1 btn-secondary flex items-center justify-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </a>
                <button className="p-2 text-gray-400 hover:text-gray-600" onClick={() => { setEditing(item); setFormData({ caption: item.caption || '', type: item.type || 'image', category: item.category || 'general' }); setShowModal(true); }}><Edit className="h-4 w-4" /></button>
                <button onClick={async () => { try { await apiDelete(`/api/gallery/${item._id || item.id}`); await fetchGalleryItems(); } catch(_){} }} className="p-2 text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))
        )}
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{editing ? 'Edit Media' : 'Add Media'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{editing ? 'Replace File (optional)' : 'File *'}</label>
                  <input type="file" accept="image/*,video/*" className="input-field" onChange={(e) => setFile(e.target.files?.[0] || null)} required={!editing} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                    <select className="input-field" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} required>
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                    <select className="input-field" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required>
                      <option value="general">General</option>
                      <option value="events">Events</option>
                      <option value="competitions">Competitions</option>
                      <option value="awards">Awards</option>
                      <option value="behind_scenes">Behind the Scenes</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Caption</label>
                  <input type="text" className="input-field" value={formData.caption} onChange={(e) => setFormData({ ...formData, caption: e.target.value })} placeholder="Say something about this media" />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary" disabled={submitting}>Cancel</button>
                  <button type="submit" className="flex-1 btn-primary" disabled={submitting || !file}>{submitting ? 'Uploading...' : 'Upload'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryManagement;
