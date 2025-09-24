import { useState, useEffect } from 'react';
import { Plus, Newspaper, Edit, Trash2, Calendar, User, Upload, Image as ImageIcon, X } from 'lucide-react';
import { apiGet, apiPost, apiDelete, apiPut, apiPostForm, resolveApiUrl } from '../../lib/api';

const NewsManagement = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    priority: 'normal'
  });
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const list = await apiGet('/api/news');
      setNews(list || []);
    } catch (_) {
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      console.log('Submitting news with data:', formData);
      
      let newsArticle;
      if (editing) {
        console.log('Updating existing news:', editing._id || editing.id);
        newsArticle = await apiPut(`/api/news/${editing._id || editing.id}`, formData);
      } else {
        console.log('Creating new news');
        newsArticle = await apiPost('/api/news', formData);
      }
      
      console.log('News created/updated:', newsArticle);

      // Upload image if provided
      if (imageFile && newsArticle) {
        console.log('Uploading image for news:', newsArticle._id || newsArticle.id);
        setUploadingImage(true);
        try {
          const formData = new FormData();
          formData.append('image', imageFile);
          const updatedNews = await apiPostForm(`/api/news/${newsArticle._id || newsArticle.id}/upload-image`, formData);
          console.log('Image uploaded successfully:', updatedNews);
        } catch (error) {
          console.error('Error uploading image:', error);
          alert('News saved but image upload failed: ' + error.message);
        } finally {
          setUploadingImage(false);
        }
      }

      setFormData({ title: '', content: '', category: 'general', priority: 'normal' });
      setImageFile(null);
      setImagePreview(null);
      setShowModal(false);
      setEditing(null);
      await fetchNews();
      
      console.log('News submission completed successfully');
    } catch (error) {
      console.error('Error saving news:', error);
      alert('Failed to save news: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateOrString) => {
    const date = dateOrString ? new Date(dateOrString) : null;
    if (!date || Number.isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'announcement': return 'bg-blue-100 text-blue-800';
      case 'update': return 'bg-purple-100 text-purple-800';
      case 'event': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
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
          <h1 className="text-2xl font-bold text-gray-900">News Management</h1>
          <p className="text-gray-600">Manage news articles and announcements</p>
        </div>
          <button onClick={() => { setEditing(null); setFormData({ title: '', content: '', category: 'general', priority: 'normal' }); setShowModal(true); }} className="btn-primary flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Add News</span>
        </button>
      </div>

      <div className="space-y-4">
        {news.length === 0 ? (
          <div className="text-center py-12">
            <Newspaper className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No news articles yet</h3>
            <p className="text-gray-600">Get started by creating your first news article.</p>
          </div>
        ) : (
          news.map((article) => (
            <div key={article._id || article.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{article.title}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(article.priority)}`}>
                      {article.priority}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(article.category)}`}>
                      {article.category}
                    </span>
                  </div>
                  {article.imageUrl && (
                    <div className="mb-3">
                      <img 
                        src={resolveApiUrl(article.imageUrl)} 
                        alt={article.title}
                        className="w-32 h-20 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <p className="text-gray-600 mb-3 line-clamp-2">{article.content}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(article.createdAt)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>Admin</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button className="p-2 text-gray-400 hover:text-gray-600" onClick={() => { 
                    setEditing(article); 
                    setFormData({ title: article.title || '', content: article.content || '', category: article.category || 'general', priority: article.priority || 'normal' }); 
                    setImagePreview(article.imageUrl ? resolveApiUrl(article.imageUrl) : null);
                    setShowModal(true); 
                  }}>
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600" onClick={async () => { try { await apiDelete(`/api/news/${article._id || article.id}`); await fetchNews(); } catch (_) {} }}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{editing ? 'Edit News Article' : 'Add News Article'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input type="text" name="title" required className="input-field" value={formData.title} onChange={handleInputChange} placeholder="Enter news title" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                    <select name="category" required className="input-field" value={formData.category} onChange={handleInputChange}>
                      <option value="general">General</option>
                      <option value="announcement">Announcement</option>
                      <option value="update">Update</option>
                      <option value="event">Event</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority *</label>
                    <select name="priority" required className="input-field" value={formData.priority} onChange={handleInputChange}>
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
                  <textarea name="content" rows={6} required className="input-field" value={formData.content} onChange={handleInputChange} placeholder="Enter news content" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Featured Image</label>
                  <div className="space-y-4">
                    {imagePreview && (
                      <div className="relative">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="w-full h-48 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <ImageIcon className="w-8 h-8 mb-4 text-gray-500" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF (MAX. 10MB)</p>
                        </div>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary" disabled={submitting || uploadingImage}>Cancel</button>
                  <button type="submit" className="flex-1 btn-primary" disabled={submitting || uploadingImage}>
                    {uploadingImage ? 'Uploading Image...' : submitting ? (editing ? 'Saving...' : 'Publishing...') : (editing ? 'Save Changes' : 'Publish News')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsManagement;
