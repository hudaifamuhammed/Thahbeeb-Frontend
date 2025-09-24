import { useState, useEffect } from 'react';
import { apiGet, resolveApiUrl } from '../../lib/api';
import { Newspaper, Clock, User, Search, X } from 'lucide-react';

const News = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { fetchNews(); }, []);

  const fetchNews = async () => {
    try {
      const list = await apiGet('/api/news');
      setNews(list || []);
    } catch (_) {
      setNews([]);
    } finally { setLoading(false); }
  };

  const formatDate = (dateString) => {
    const date = dateString ? new Date(dateString) : null;
    if (!date || Number.isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getPriorityColor = (priority) => {
    switch (priority) { case 'high': return 'bg-red-100 text-red-800 border-red-200'; case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'; case 'low': return 'bg-green-100 text-green-800 border-green-200'; default: return 'bg-gray-100 text-gray-800 border-gray-200'; }
  };

  const getCategoryColor = (category) => {
    switch (category) { case 'announcement': return 'bg-blue-100 text-blue-800'; case 'update': return 'bg-purple-100 text-purple-800'; case 'event': return 'bg-orange-100 text-orange-800'; default: return 'bg-gray-100 text-gray-800'; }
  };

  const handleArticleClick = (article) => {
    setSelectedArticle(article);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedArticle(null);
  };

  const filteredNews = news.filter((article) => {
    const matchesSearch = (article.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || (article.content || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesPriority = selectedPriority === 'all' || article.priority === selectedPriority;
    return matchesSearch && matchesCategory && matchesPriority;
  });

  const categories = ['all', 'general', 'announcement', 'update', 'event'];
  const priorities = ['all', 'low', 'normal', 'medium', 'high'];

  if (loading) return (<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>);

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
            Latest News & Updates
          </h1>
          <p className="mt-2 text-lg/8 text-gray-600">
            Stay informed with the latest announcements and updates
          </p>
        </div>

        {/* Filters */}
        <div className="mt-16 mb-12">
          <div className="flex flex-col lg:flex-row gap-4 max-w-4xl mx-auto">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search news articles..." 
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                />
              </div>
            </div>
            <div className="lg:w-48">
              <select 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === 'all' ? 'All Categories' : c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="lg:w-48">
              <select 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
                value={selectedPriority} 
                onChange={(e) => setSelectedPriority(e.target.value)}
              >
                {priorities.map((p) => (
                  <option key={p} value={p}>
                    {p === 'all' ? 'All Priorities' : p.charAt(0).toUpperCase() + p.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* News Grid */}
        <div className="mx-auto grid max-w-2xl auto-rows-fr grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {filteredNews.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Newspaper className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {news.length === 0 ? 'No news articles yet' : 'No articles match your filters'}
              </h3>
              <p className="text-gray-600">
                {news.length === 0 ? 'Check back later for updates.' : 'Try adjusting your search or filter criteria.'}
              </p>
            </div>
          ) : (
            filteredNews.map((article, index) => (
              <article
                key={article._id || article.id}
                className="relative isolate flex flex-col justify-end overflow-hidden rounded-2xl bg-gray-900 px-8 pb-8 pt-80 sm:pt-48 lg:pt-80 cursor-pointer hover:scale-105 transition-transform duration-200"
                onClick={() => handleArticleClick(article)}
              >
                <img 
                  alt="" 
                  src={article.imageUrl ? resolveApiUrl(article.imageUrl) : `https://images.unsplash.com/photo-1496128858413-b36217c2ce36?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3603&q=80&ix=${index}`} 
                  className="absolute inset-0 -z-10 size-full object-cover" 
                />
                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-gray-900 via-gray-900/40" />
                <div className="absolute inset-0 -z-10 rounded-2xl ring-1 ring-inset ring-gray-900/10" />

                <div className="flex flex-wrap items-center gap-y-1 overflow-hidden text-sm/6 text-gray-300">
                  <time dateTime={new Date(article.createdAt).toISOString()} className="mr-8">
                    {formatDate(article.createdAt)}
                  </time>
                  <div className="-ml-4 flex items-center gap-x-4">
                    <svg viewBox="0 0 2 2" className="-ml-0.5 size-0.5 flex-none fill-white/50">
                      <circle r={1} cx={1} cy={1} />
                    </svg>
                    <div className="flex gap-x-2.5">
                      <div className="size-6 flex-none rounded-full bg-white/10 flex items-center justify-center">
                        <Newspaper className="h-4 w-4" />
                      </div>
                      Admin
                    </div>
                  </div>
                </div>
                <h3 className="mt-3 text-lg/6 font-semibold text-white">
                  <span className="absolute inset-0" />
                  {article.title}
                </h3>
                <div className="mt-2 text-sm text-gray-300 line-clamp-2">
                  {article.content}
                </div>
              </article>
            ))
          )}
        </div>

        {filteredNews.length > 0 && (
          <div className="mt-12 text-center text-gray-600">
            Showing {filteredNews.length} of {news.length} articles
          </div>
        )}
      </div>

      {/* News Modal */}
      {showModal && selectedArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
              >
                <X className="h-6 w-6 text-gray-600" />
              </button>

              {/* Article Image */}
              <div className="relative h-64 sm:h-80 lg:h-96">
                <img
                  src={selectedArticle.imageUrl ? resolveApiUrl(selectedArticle.imageUrl) : `https://images.unsplash.com/photo-1496128858413-b36217c2ce36?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3603&q=80`}
                  alt={selectedArticle.title}
                  className="w-full h-full object-cover rounded-t-lg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-t-lg" />
              </div>

              {/* Article Content */}
              <div className="p-6 lg:p-8">
                {/* Article Meta */}
                <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{formatDate(selectedArticle.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Admin</span>
                  </div>
                  {selectedArticle.category && (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(selectedArticle.category)}`}>
                      {selectedArticle.category.charAt(0).toUpperCase() + selectedArticle.category.slice(1)}
                    </span>
                  )}
                  {selectedArticle.priority && (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(selectedArticle.priority)}`}>
                      {selectedArticle.priority.charAt(0).toUpperCase() + selectedArticle.priority.slice(1)} Priority
                    </span>
                  )}
                </div>

                {/* Article Title */}
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                  {selectedArticle.title}
                </h1>

                {/* Article Content */}
                <div className="prose prose-lg max-w-none">
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selectedArticle.content}
                  </div>
                </div>

                {/* Article Footer */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Newspaper className="h-4 w-4" />
                      <span>Published by Admin</span>
                    </div>
                    <button
                      onClick={closeModal}
                      className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default News;
