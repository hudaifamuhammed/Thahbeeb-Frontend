import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Newspaper, 
  Calendar, 
  Image, 
  Trophy,
  LogOut
} from 'lucide-react';

const Sidebar = ({ onLogout }) => {
  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/teams', icon: Users, label: 'Teams' },
    { path: '/admin/news', icon: Newspaper, label: 'News' },
    { path: '/admin/items', icon: Calendar, label: 'Item Sheet' },
    { path: '/admin/gallery', icon: Image, label: 'Gallery' },
    { path: '/admin/scoreboard', icon: Trophy, label: 'Scoreboard' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-4 bg-primary-600">
        <h1 className="text-xl font-bold text-white">Arts Fest Admin</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                isActive
                  ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={onLogout}
          className="flex items-center space-x-3 w-full px-3 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
