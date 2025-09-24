import { Trophy, Mail, Phone, MapPin } from 'lucide-react';
// import ThahbeebLogo from '../../assets/Thahbeeb Logo.png';
import FooterLogo from '../../assets/Footer Logo.png';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
  <footer className="text-white" style={{background: 'linear-gradient(90deg, #67b11a 0%, #1e7518 100%)'}}>
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img 
                src={FooterLogo} 
                alt="Thahbeeb Logo" 
                className="h-20 w-auto"
              />
            </div>
            <p className="text-white">
              Celebrating creativity, talent, and artistic expression in our annual college arts festival. 
              Join us for an unforgettable experience of music, dance, drama, and visual arts.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/scoreboard" className="text-white hover:text-white transition-colors">
                  Live Scoreboard
                </Link>
              </li>
              <li>
                <Link to="/news" className="text-white hover:text-white transition-colors">
                  Latest News
                </Link>
              </li>
              <li>
                <Link to="/items" className="text-white hover:text-white transition-colors">
                  Competitions
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="text-white hover:text-white transition-colors">
                  Photo Gallery
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-white" />
                <span className="text-white">najathstudentsunion@gmail.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-white" />
                <span className="text-white">+91 98765 43210</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-white" />
                <span className="text-white">College Campus, Mangad, Kasaragod</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white mt-8 pt-8 text-center">
          <p className="text-white">
            © 2025 Arts Fest. All rights reserved. | Developed by <a href="www.linkedin.com/in/hudaif121" className="text-white hover:text-white transition-colors">Muhammed Hudaifath</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
