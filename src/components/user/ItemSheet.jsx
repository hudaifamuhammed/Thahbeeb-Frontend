import { useState, useEffect } from 'react';
import { apiGet } from '../../lib/api';
import { Calendar, MapPin, Clock, Users, Search, Trophy } from 'lucide-react';

const ItemSheet = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      const list = await apiGet('/api/items');
      setItems(list || []);
    } catch (_) {
      setItems([]);
    } finally { setLoading(false); }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const getTypeColor = (type) => (type === 'solo' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800');

  const getCategoryColor = (category) => {
    const colors = { music: 'bg-purple-100 text-purple-800', dance: 'bg-pink-100 text-pink-800', drama: 'bg-orange-100 text-orange-800', art: 'bg-yellow-100 text-yellow-800', literature: 'bg-indigo-100 text-indigo-800', sports: 'bg-red-100 text-red-800', other: 'bg-gray-100 text-gray-800' };
    return colors[category] || colors.other;
  };

  const filteredItems = items.filter(item => {
    if (selectedCategory === 'All Categories') return true;
    return item.category === selectedCategory;
  });

  const filteredAndSortedItems = filteredItems
    .filter((item) => {
      const matchesSearch = (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || item.description?.toLowerCase().includes(searchTerm.toLowerCase()) || item.venue?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesType = selectedType === 'all' || item.type === selectedType;
      return matchesSearch && matchesCategory && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'category': return a.category.localeCompare(b.category);
        case 'date': return new Date(a.date || 0) - new Date(b.date || 0);
        default: return 0;
      }
    });

  const categories = ['all', 'Sub-Junior', 'Junior', 'Senior'];
  const types = ['all', 'solo', 'group'];
  const sortOptions = [{ value: 'date', label: 'Date' }, { value: 'name', label: 'Name' }, { value: 'category', label: 'Category' }];

  if (loading) return (<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8"><h1 className="text-4xl font-bold text-gray-900 mb-4">Competition Schedule</h1><p className="text-gray-600">Browse all competitions and events</p></div>

      <div className="card mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2"><div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" /><input type="text" placeholder="Search competitions..." className="input-field pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div></div>
          <div><select className="input-field" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>{categories.map((c) => (<option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>))}</select></div>
          <div><select className="input-field" value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>{types.map((t) => (<option key={t} value={t}>{t === 'all' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1)}</option>))}</select></div>
        </div>
        <div className="mt-4 flex items-center space-x-4"><span className="text-sm font-medium text-gray-700">Sort by:</span><div className="flex space-x-2">{sortOptions.map((o) => (<button key={o.value} onClick={() => setSortBy(o.value)} className={`px-3 py-1 text-sm rounded-md transition-colors ${sortBy === o.value ? 'bg-primary-100 text-primary-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}>{o.label}</button>))}</div></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedItems.length === 0 ? (
          <div className="col-span-full text-center py-12"><Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" /><h3 className="text-lg font-medium text-gray-900 mb-2">{items.length === 0 ? 'No competitions yet' : 'No competitions match your filters'}</h3><p className="text-gray-600">{items.length === 0 ? 'Competitions will be announced soon.' : 'Try adjusting your search or filter criteria.'}</p></div>
        ) : (
          filteredAndSortedItems.map((item) => (
            <div key={item._id || item.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4"><div className="flex-1"><div className="flex flex-wrap gap-2 mb-3"><span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(item.category)}`}>{item.category}</span><span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(item.type)}`}>{item.type}</span></div><h3 className="text-xl font-semibold text-gray-900 mb-3">{item.name}</h3></div></div>
              <div className="space-y-3 mb-4"><div className="flex items-center space-x-2 text-gray-600"><MapPin className="h-4 w-4" /><span className="text-sm">{item.venue || 'Venue TBD'}</span></div><div className="flex items-center space-x-2 text-gray-600"><Calendar className="h-4 w-4" /><span className="text-sm">{formatDate(item.date)}</span></div>{item.time && (<div className="flex items-center space-x-2 text-gray-600"><Clock className="h-4 w-4" /><span className="text-sm">{formatTime(item.time)}</span></div>)}</div>
              {item.description && (<p className="text-gray-600 text-sm mb-4 line-clamp-3">{item.description}</p>)}
              {item.rules && (<div className="mb-4"><h4 className="text-sm font-medium text-gray-900 mb-2">Rules:</h4><p className="text-gray-600 text-sm line-clamp-2">{item.rules}</p></div>)}
              {item.prizes && (<div className="mb-4"><h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center"><Trophy className="h-4 w-4 mr-1" />Prizes:</h4><p className="text-gray-600 text-sm line-clamp-2">{item.prizes}</p></div>)}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200"><div className="flex items-center space-x-1 text-sm text-gray-500"><Users className="h-4 w-4" /><span>{item.type === 'solo' ? 'Individual' : 'Team'}</span></div><button className="text-primary-600 hover:text-primary-700 text-sm font-medium">View Details</button></div>
            </div>
          ))
        )}
      </div>

      {filteredAndSortedItems.length > 0 && (<div className="mt-8 text-center text-gray-600">Showing {filteredAndSortedItems.length} of {items.length} competitions</div>)}
    </div>
  );
};

export default ItemSheet;
