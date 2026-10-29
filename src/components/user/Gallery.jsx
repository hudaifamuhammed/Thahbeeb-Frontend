import { useState, useEffect } from 'react';
import { apiGet, resolveApiUrl, triggerDownload, getFestivalYears } from '../../lib/api';
import { Image, Video, Download, Search, Eye, Play, X } from 'lucide-react';

const Gallery = () => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedItem, setSelectedItem] = useState(null);
  const [availableYears, setAvailableYears] = useState([2026, 2025]);
  const [selectedYear, setSelectedYear] = useState(2026);

  useEffect(() => {
    let isMounted = true;
    getFestivalYears().then((years) => {
      if (isMounted && Array.isArray(years) && years.length > 0) {
        setAvailableYears(years);
        if (!years.includes(selectedYear)) {
          setSelectedYear(years[0]);
        }
      }
    });
    return () => { isMounted = false; };
  }, []);

  useEffect(() => { 
    if (selectedYear) {
      fetchGalleryItems(); 
    }
  }, [selectedYear]);

  const fetchGalleryItems = async () => {
    setLoading(true);
    try {
      const list = await apiGet(`/api/gallery?year=${selectedYear}`);
      setGalleryItems(list || []);
    } catch (_) {
      setGalleryItems([]);
    } finally { setLoading(false); }
  };

  const formatDate = (dateString) => {
    const d = dateString ? new Date(dateString) : null;
    if (!d || Number.isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const k = 1024; const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCategoryColor = (category) => {
    const colors = { general: 'bg-gray-100 text-gray-800', events: 'bg-blue-100 text-blue-800', competitions: 'bg-green-100 text-green-800', awards: 'bg-yellow-100 text-yellow-800', behind_scenes: 'bg-purple-100 text-purple-800' };
    return colors[category] || colors.general;
  };

  const filteredItems = galleryItems.filter((item) => {
    const matchesSearch = (item.caption || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesType = selectedType === 'all' || item.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const categories = ['all', 'general', 'events', 'competitions', 'awards', 'behind_scenes'];
  const types = ['all', 'image', 'video'];

  const [downloading, setDownloading] = useState(false);

  const handleDownload = (url, caption) => {
    if (!url) return;
    try {
      setDownloading(true);
      triggerDownload(url, caption, 'Thahbeeb');
    } catch (err) {
      console.warn('Download error:', err);
    } finally {
      setTimeout(() => setDownloading(false), 800);
    }
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center py-24 min-h-[50vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
      <div className="text-center mb-8"><h1 className="text-4xl font-bold text-gray-900 mb-4">Gallery</h1><p className="text-gray-600">Photos and videos from Thahbeeb Arts Fest</p></div>

      <div className="card mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1"><div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" /><input type="text" placeholder="Search gallery..." className="input-field pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div></div>
          <div className="lg:w-48">
            <select className="input-field border-primary-400 font-semibold text-primary-900" value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
              {availableYears.map((y) => (
                <option key={y} value={y}>{y} Fest {y === availableYears[0] ? '(Current)' : '(Archive)'}</option>
              ))}
            </select>
          </div>
          <div className="lg:w-48"><select className="input-field" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>{categories.map((c) => (<option key={c} value={c}>{c === 'all' ? 'All Categories' : c.charAt(0).toUpperCase() + c.slice(1).replace('_', ' ')}</option>))}</select></div>
          <div className="lg:w-48"><select className="input-field" value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>{types.map((t) => (<option key={t} value={t}>{t === 'all' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1)}</option>))}</select></div>
          <div className="flex border border-gray-300 rounded-lg"><button onClick={() => setViewMode('grid')} className={`px-3 py-2 text-sm font-medium rounded-l-lg ${viewMode === 'grid' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:text-gray-900'}`}>Grid</button><button onClick={() => setViewMode('list')} className={`px-3 py-2 text-sm font-medium rounded-r-lg ${viewMode === 'list' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:text-gray-900'}`}>List</button></div>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-12"><Image className="h-12 w-12 text-gray-400 mx-auto mb-4" /><h3 className="text-lg font-medium text-gray-900 mb-2">{galleryItems.length === 0 ? 'No media yet' : 'No media matches your filters'}</h3><p className="text-gray-600">{galleryItems.length === 0 ? 'Photos and videos will be added soon.' : 'Try adjusting your search or filter criteria.'}</p></div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
          {filteredItems.map((item) => (
            <div key={item._id || item.id} className={`card hover:shadow-lg transition-shadow ${viewMode === 'list' ? 'flex flex-row' : ''}`}>
              {viewMode === 'grid' ? (
                <>
                  <div className="relative mb-4">
                    {item.type === 'image' ? (
                      <img src={resolveApiUrl(item.url)} alt={item.caption} className="w-full h-48 object-cover rounded-lg cursor-pointer" loading="lazy" decoding="async" onClick={() => setSelectedItem(item)} />
                    ) : (
                      <div className="relative cursor-pointer" onClick={() => setSelectedItem(item)}>
                        <video src={resolveApiUrl(item.url)} className="w-full h-48 object-cover object-top rounded-lg" preload="metadata" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg"><Play className="h-8 w-8 text-white" /></div>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex space-x-1">
                      {item.year && (
                        <span className="bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow">
                          {item.year}
                        </span>
                      )}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(item.category)}`}>{item.category}</span>
                    </div>
                  </div>
                  <div className="space-y-2"><h3 className="font-medium text-gray-900 line-clamp-2">{item.caption}</h3><div className="flex items-center space-x-2 text-sm text-gray-500">{item.type === 'image' ? (<Image className="h-4 w-4" />) : (<Video className="h-4 w-4" />)}<span>{item.type}</span><span>•</span><span>{formatFileSize(item.fileSize)}</span></div><p className="text-xs text-gray-500">{formatDate(item.createdAt)}</p></div>
                  <div className="flex space-x-2 mt-4"><button onClick={() => setSelectedItem(item)} className="flex-1 btn-secondary flex items-center justify-center space-x-2"><Eye className="h-4 w-4" /><span>View</span></button><button onClick={() => handleDownload(item.url, item.caption || item.fileName)} disabled={downloading} className="flex-1 btn-primary flex items-center justify-center space-x-2"><Download className="h-4 w-4" /><span>Download</span></button></div>
                </>
              ) : (
                <>
                  <div className="relative w-32 h-24 flex-shrink-0">{item.type === 'image' ? (<img src={resolveApiUrl(item.url)} alt={item.caption} className="w-full h-full object-cover rounded-lg cursor-pointer" loading="lazy" decoding="async" onClick={() => setSelectedItem(item)} />) : (<video src={resolveApiUrl(item.url)} className="w-full h-full object-cover rounded-lg" preload="metadata" />)}<div className="absolute top-1 right-1"><span className={`px-1 py-0.5 text-xs font-medium rounded ${getCategoryColor(item.category)}`}>{item.category}</span></div></div>
                  <div className="flex-1 ml-4"><h3 className="font-medium text-gray-900 mb-2">{item.caption}</h3><div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">{item.type === 'image' ? (<Image className="h-4 w-4" />) : (<Video className="h-4 w-4" />)}<span>{item.type}</span><span>{formatFileSize(item.fileSize)}</span><span>{formatDate(item.createdAt)}</span></div><div className="flex space-x-2"><button onClick={() => setSelectedItem(item)} className="btn-secondary flex items-center space-x-2"><Eye className="h-4 w-4" /><span>View</span></button><button onClick={() => handleDownload(item.url, item.caption || item.fileName)} disabled={downloading} className="btn-primary flex items-center space-x-2"><Download className="h-4 w-4" /><span>Download</span></button></div></div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {filteredItems.length > 0 && (<div className="mt-8 text-center text-gray-600">Showing {filteredItems.length} of {galleryItems.length} media items</div>)}

      {/* Modal with backdrop click to close and uncropped full media */}
      {selectedItem && (
        <div 
          className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 z-50 transition-opacity"
          onClick={() => setSelectedItem(null)}
        >
          <div 
            className="relative bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col w-full max-w-4xl max-h-[90vh] my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-gray-200 flex justify-between items-center bg-gray-50 flex-shrink-0 z-10">
              <h3 className="text-lg font-bold text-gray-900 truncate pr-4">{selectedItem.caption}</h3>
              <button 
                onClick={() => setSelectedItem(null)} 
                className="text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-200 transition-colors"
                title="Close modal"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {/* Media Content - Full natural uncropped display with zero cut off */}
            <div className="flex-1 min-h-0 flex items-center justify-center bg-neutral-950 p-2 sm:p-4 overflow-hidden">
              {selectedItem.type === 'image' ? (
                <img 
                  src={resolveApiUrl(selectedItem.url)} 
                  alt={selectedItem.caption} 
                  className="max-w-full max-h-[60vh] md:max-h-[65vh] w-auto h-auto object-contain mx-auto rounded shadow-sm select-none" 
                  loading="lazy" 
                  decoding="async" 
                />
              ) : (
                <video 
                  src={resolveApiUrl(selectedItem.url)} 
                  className="max-w-full max-h-[60vh] md:max-h-[65vh] w-auto h-auto object-contain mx-auto rounded shadow-sm" 
                  controls 
                  autoPlay 
                  playsInline
                  preload="metadata" 
                />
              )}
            </div>

            {/* Modal Footer - Always pinned & visible */}
            <div className="px-5 py-3.5 border-t border-gray-200 flex flex-wrap gap-2 justify-between items-center bg-gray-50 flex-shrink-0 z-10">
              <div className="text-sm text-gray-600 flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(selectedItem.category)}`}>
                  {selectedItem.category}
                </span>
                {selectedItem.year && (
                  <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full font-bold">
                    {selectedItem.year} Fest
                  </span>
                )}
                <span className="text-xs text-gray-500">{formatFileSize(selectedItem.fileSize)}</span>
              </div>
              <button 
                onClick={() => handleDownload(selectedItem.url, selectedItem.caption || selectedItem.fileName)} 
                disabled={downloading}
                className="btn-primary flex items-center space-x-2 shadow-sm"
              >
                <Download className="h-4 w-4" />
                <span>{downloading ? 'Downloading...' : 'Download'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
