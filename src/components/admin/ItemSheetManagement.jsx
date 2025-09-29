import { useState, useEffect } from 'react';
import { Plus, Calendar, Edit, Trash2, MapPin, Users, Clock, Upload, Download } from 'lucide-react';
import { apiGet, apiPost, apiDelete, apiPut, apiPostForm } from '../../lib/api';

const ItemSheetManagement = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    type: 'solo',
    stage: '',
    stageType: 'Stage',
    date: '',
    time: '',
    description: '',
    rules: '',
    prizes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const list = await apiGet('/api/items');
      setItems(list || []);
    } catch (_) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        await apiPut(`/api/items/${editing._id || editing.id}`, formData);
      } else {
        await apiPost('/api/items', formData);
      }
      setFormData({ name: '', category: '', type: 'solo', stage: '', stageType: 'Stage', date: '', time: '', description: '', rules: '', prizes: '' });
      setShowModal(false);
      setEditing(null);
      await fetchItems();
    } catch (err) {
      console.error('Error saving item:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
          file.type === 'application/vnd.ms-excel' ||
          file.name.endsWith('.xlsx') || 
          file.name.endsWith('.xls')) {
        setUploadFile(file);
        setUploadError('');
      } else {
        setUploadError('Please select a valid Excel file (.xlsx or .xls)');
        setUploadFile(null);
      }
    }
  };

  const handleExcelUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
      const response = await fetch(`${API_BASE_URL}/api/items/upload`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        alert(`Success! ${result.message}`);
        setShowUploadModal(false);
        setUploadFile(null);
        await fetchItems();
      } else {
        console.error('Upload failed:', result);
        setUploadError(result.error || 'Upload failed');
        if (result.details) {
          setUploadError(result.details.join('\n'));
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Upload failed. Please check your connection and try again.');
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
      const response = await fetch(`${API_BASE_URL}/api/items/template`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'competition_template.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to download template');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download template');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getTypeColor = (type) => (type === 'solo' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800');

  const getCategoryColor = (category) => {
    const colors = { 'super-senior': 'bg-red-100 text-red-800', 'senior': 'bg-orange-100 text-orange-800', 'junior': 'bg-pink-100 text-pink-800' };
    return colors[category] || colors['other'];
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
          <h1 className="text-2xl font-bold text-gray-900">Item Sheet Management</h1>
          <p className="text-gray-600">Manage competitions and events</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={downloadTemplate} className="btn-secondary flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Download Template</span>
          </button>
          <button onClick={() => setShowUploadModal(true)} className="btn-secondary flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Upload Excel</span>
          </button>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Add Competition</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No competitions yet</h3>
            <p className="text-gray-600">Get started by adding your first competition.</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item._id || item.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.name}</h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(item.category)}`}>{item.category}</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(item.type)}`}>{item.type}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600" onClick={() => { setEditing(item); setFormData({ name: item.name || '', category: item.category || '', type: item.type || 'solo', stage: item.stage || '', stageType: item.stageType || 'Stage', date: item.date ? item.date.substring(0,10) : '', time: item.time || '', description: item.description || '', rules: item.rules || '', prizes: item.prizes || '' }); setShowModal(true); }}><Edit className="h-4 w-4" /></button>
                  <button className="p-2 text-gray-400 hover:text-red-600" onClick={async () => { try { await apiDelete(`/api/items/${item._id || item.id}`); await fetchItems(); } catch (_) {} }}><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2"><MapPin className="h-4 w-4" /><span>{item.stageType || 'Stage'}</span></div>
                <div className="flex items-center space-x-2"><Calendar className="h-4 w-4" /><span>{formatDate(item.date)}</span></div>
                {item.time && (<div className="flex items-center space-x-2"><Clock className="h-4 w-4" /><span>{item.time}</span></div>)}
              </div>
              {item.description && (<p className="mt-3 text-sm text-gray-600 line-clamp-2">{item.description}</p>)}
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{editing ? 'Edit Competition' : 'Add Competition'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Competition Name *</label>
                  <input type="text" name="name" required className="input-field" value={formData.name} onChange={handleInputChange} placeholder="Enter competition name" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                    <select name="category" required className="input-field" value={formData.category} onChange={handleInputChange}>
                      <option value="">Select category</option>
                      <option value="super-senior">Super-Senior</option>
                      <option value="senior">Senior</option>
                      <option value="junior">Junior</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                    <select name="type" required className="input-field" value={formData.type} onChange={handleInputChange}>
                      <option value="solo">Solo</option>
                      <option value="group">Group</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stage Type *</label>
                    <select name="stageType" required className="input-field" value={formData.stageType} onChange={handleInputChange}>
                      <option value="Stage">Stage</option>
                      <option value="Off-stage">Off-stage</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                    <input type="date" name="date" required className="input-field" value={formData.date} onChange={handleInputChange} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                  <input type="time" name="time" className="input-field" value={formData.time} onChange={handleInputChange} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea name="description" rows={3} className="input-field" value={formData.description} onChange={handleInputChange} placeholder="Enter competition description" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rules</label>
                  <textarea name="rules" rows={3} className="input-field" value={formData.rules} onChange={handleInputChange} placeholder="Enter competition rules" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prizes</label>
                  <textarea name="prizes" rows={2} className="input-field" value={formData.prizes} onChange={handleInputChange} placeholder="Enter prize details" />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary" disabled={submitting}>Cancel</button>
                  <button type="submit" className="flex-1 btn-primary" disabled={submitting}>{submitting ? 'Adding...' : 'Add Competition'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Excel Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Excel File</h2>
              <p className="text-sm text-gray-600 mb-4">
                Upload an Excel file with competition data. The file should contain columns: 
                Competition Name, Category, Type, Stage Type, and Date.
              </p>
              
              <form onSubmit={handleExcelUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Excel File *</label>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    required
                  />
                  {uploadError && (
                    <div className="mt-2 text-sm text-red-600 whitespace-pre-line">
                      {uploadError}
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowUploadModal(false);
                      setUploadFile(null);
                      setUploadError('');
                    }} 
                    className="flex-1 btn-secondary" 
                    disabled={uploading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 btn-primary" 
                    disabled={uploading || !uploadFile}
                  >
                    {uploading ? 'Uploading...' : 'Upload File'}
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

export default ItemSheetManagement;
