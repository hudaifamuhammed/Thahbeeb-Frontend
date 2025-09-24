import { useState, useEffect } from 'react';
import { Users, Newspaper, Calendar, Image, Trophy, TrendingUp } from 'lucide-react';
import { apiGet } from '../../lib/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    teams: 0,
    news: 0,
    items: 0,
    gallery: 0,
    scores: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [teams, news, items, gallery, scores] = await Promise.all([
          apiGet('/api/teams'),
          apiGet('/api/news'),
          apiGet('/api/items'),
          apiGet('/api/gallery'),
          apiGet('/api/scores')
        ]);

        setStats({
          teams: (teams || []).length,
          news: (news || []).length,
          items: (items || []).length,
          gallery: (gallery || []).length,
          scores: (scores || []).length
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { title: 'Total Teams', value: stats.teams, icon: Users, color: 'bg-blue-500', change: '+12%' },
    { title: 'News Articles', value: stats.news, icon: Newspaper, color: 'bg-green-500', change: '+8%' },
    { title: 'Competitions', value: stats.items, icon: Calendar, color: 'bg-purple-500', change: '+15%' },
    { title: 'Gallery Items', value: stats.gallery, icon: Image, color: 'bg-orange-500', change: '+23%' },
    { title: 'Score Entries', value: stats.scores, icon: Trophy, color: 'bg-red-500', change: '+5%' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome to the Arts Fest Admin Dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600 ml-1">{stat.change}</span>
                </div>
              </div>
              <div className={`p-3 rounded-full ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors">
            <Users className="h-8 w-8 text-blue-500 mb-2" />
            <h3 className="font-medium text-gray-900">Add New Team</h3>
            <p className="text-sm text-gray-600">Create a new team and upload member details</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors">
            <Newspaper className="h-8 w-8 text-green-500 mb-2" />
            <h3 className="font-medium text-gray-900">Publish News</h3>
            <p className="text-sm text-gray-600">Share updates and announcements</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors">
            <Calendar className="h-8 w-8 text-purple-500 mb-2" />
            <h3 className="font-medium text-gray-900">Add Competition</h3>
            <p className="text-sm text-gray-600">Create new competition entries</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors">
            <Image className="h-8 w-8 text-orange-500 mb-2" />
            <h3 className="font-medium text-gray-900">Upload Media</h3>
            <p className="text-sm text-gray-600">Add photos and videos to gallery</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors">
            <Trophy className="h-8 w-8 text-red-500 mb-2" />
            <h3 className="font-medium text-gray-900">Update Scores</h3>
            <p className="text-sm text-gray-600">Manage team and individual scores</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
