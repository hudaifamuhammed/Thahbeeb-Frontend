
import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, Trophy, Newspaper, Calendar, Image, Home, Grid2X2 } from 'lucide-react';
import ThahbeebLogo from '../../assets/Thahbeeb Logo.png';


const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const location = useLocation();

  // Navigation items
  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/scoreboard', icon: Trophy, label: 'Scoreboard' },
    { path: '/news', icon: Newspaper, label: 'News' },
    { path: '/items', icon: Calendar, label: 'Competitions' },
    { path: '/gallery', icon: Image, label: 'Gallery' },
  ];

  // Active route checker
  const isActive = (path) => location.pathname === path;

  // Removed click-outside-to-close logic

  return (
    <nav className="relative z-50">
      {/* Desktop floating menu - now same as mobile */}
      <div className="hidden md:block fixed top-8 right-8 z-50">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="w-12 h-12 rounded-2xl bg-white shadow-xl border border-gray-100 flex items-center justify-center active:scale-95 transition"
            aria-label="Open menu"
          >
            <Grid2X2 className="h-6 w-6 text-primary-600" />
          </button>
        )}
        {isOpen && (
          <div
            ref={menuRef}
            className="mt-4 w-72 rounded-3xl bg-white/95 backdrop-blur shadow-2xl p-5 border border-gray-100 relative"
          >
            {/* Close button */}
            <button
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 hover:bg-primary-100 transition"
              aria-label="Close menu"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center mb-4">
              <img src={ThahbeebLogo} alt="Thahbeeb Logo" className="h-10 w-auto" />
              <span className="ml-3 text-sm font-semibold tracking-widest text-gray-600">MENU</span>
            </div>
            <div className="space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary-50 text-primary-700 border-primary-200'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <span className="text-gray-300">›</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile floating button and menu */}
      <div className="md:hidden fixed top-8 right-8 z-50">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 rounded-2xl bg-white shadow-xl border border-gray-100 flex items-center justify-center active:scale-95 transition"
            aria-label="Open menu"
          >
            <Grid2X2 className="h-7 w-7 text-primary-600" />
          </button>
        )}
        {isOpen && (
          <div ref={menuRef} className="mt-3 w-72 rounded-3xl bg-white/95 backdrop-blur shadow-2xl p-5 border border-gray-100 relative">
            <button
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 hover:bg-primary-100 transition"
              aria-label="Close menu"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center mb-4">
              <img src={ThahbeebLogo} alt="Thahbeeb Logo" className="h-10 w-auto" />
              <span className="ml-3 text-sm font-semibold tracking-widest text-gray-600">MENU</span>
            </div>
            <div className="space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary-50 text-primary-700 border-primary-200'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <span className="text-gray-300">›</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
