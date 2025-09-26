import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiGet, resolveApiUrl } from '../../lib/api';
import { Trophy, Newspaper, Calendar, Image, ArrowRight, Users, Clock } from 'lucide-react';
import ThahbeebLogo from '../../assets/Thahbeeb Logo.png';
import HeroBg from '../../assets/Hero Section bg.jpg';
import Bg2 from '../../assets/Bg 2.jpg';
import Bg1 from '../../assets/Bg 1.jpg';
import AllImg from '../../assets/all.jpg';

// Add Karlos DEMO font
import '../../assets/Karlos DEMO.otf';

// Counter animation hook
function useCounter(end, duration = 2000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 16);
    let frame;
    const step = () => {
      start += increment;
      if (start < end) {
        setCount(Math.floor(start));
        frame = requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [end, duration]);
  return count;
}

// StatBox component for each stat
function StatBox({ label, value, suffix, color, bg }) {
  const count = useCounter(value);
  return (
    <div
      className={`rounded-3xl shadow-md flex flex-col justify-center px-10 py-10`}
      style={{
        width: '304px',
        height: '320px',
        fontFamily: 'Karlos DEMO, sans-serif',
        alignItems: 'flex-start',
        background: 'rgba(152, 176, 142, 0.5)', // 15% opacity
      }}
    >
      <span
        className={`${color} text-left`}
        style={{
          textAlign: 'left',
          width: '100%',
          fontSize: '75px',
          fontWeight: 'bold',
        }}
      >
        {count}{suffix || ''}
      </span>
      <span
        className="mt-2 text-4xl font-medium text-gray-700 text-left"
        style={{ textAlign: 'left', width: '100%' }}
      >
        {label}
      </span>
    </div>
  );
}

const Home = () => {
  // ...existing code...

  // Example stats
  const stats = [
    { label: 'Candidates', value: 30, suffix: '+', color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Teams', value: 2, suffix: '', color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { label: 'Programs', value: 115, color: 'text-blue-600', bg: 'bg-blue-50' },
    // { label: 'States', value: 20, suffix: '+', color: 'text-rose-600', bg: 'bg-rose-50' },
  ];
  const [news, setNews] = useState([]);
  const [items, setItems] = useState([]);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [newsList, itemsList, scoresList] = await Promise.all([
        apiGet('/api/news'),
        apiGet('/api/items'),
        apiGet('/api/scores')
      ]);
      setNews((newsList || []).slice(0, 3));
      setItems((itemsList || []).slice(0, 6));
      setScores(scoresList || []);
    } catch (e) {
      console.error('Home fetch error', e);
    } finally {
      setLoading(false);
    }
  };

  // Removed undefined calculateTopTeams() call

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Add Karlos DEMO font-face
  // This will inject the font-face into the page
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.innerHTML = `@font-face { font-family: 'Karlos DEMO'; src: url('/src/assets/Karlos DEMO.otf') format('opentype'); font-weight: normal; font-style: normal; }`;
    document.head.appendChild(style);
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section
        className="w-full min-h-[60vh] md:min-h-[80vh] bg-cover bg-center relative flex items-center justify-center"
        style={{ backgroundImage: `url(${HeroBg})` }}
      />

      {/* Stats Section with Counter Effect and Bg 2 */}
      <section
        className="w-full min-h-[60vh] md:min-h-[80vh] bg-cover bg-center relative flex items-center justify-center"
        style={{ backgroundImage: `url(${Bg2})` }}
      >
        <div className="flex flex-col md:flex-row gap-8 md:gap-6">
          {stats.map((stat) => (
            <StatBox key={stat.label} {...stat} />
          ))}
        </div>
      </section>

      {/* About Section - Consistent Responsive Bg Size */}
      <section
        className="w-full min-h-[60vh] md:min-h-[80vh] bg-cover bg-center relative flex items-center justify-center py-12 md:py-24"
        style={{ backgroundImage: `url(${Bg2})` }}
      >
        <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-6xl gap-8 px-4 bg-gradient-to-br from-white/90 via-white/80 to-white/90 rounded-[48px] shadow-2xl border border-gray-200" style={{ minHeight: '440px' }}>
          {/* Text Left with min padding */}
          <div className="flex-1 flex flex-col justify-center items-start text-left py-6 md:pl-8">
            <h2 className="text-4xl md:text-5xl font-bold text-[#487437] mb-3 leading-tight drop-shadow-lg" style={{fontFamily: 'Karlos DEMO, sans-serif'}}>
              Thahbeeb<br />
              Najath Arts Fest
            </h2>
            <p className="text-lg md:text-xl text-gray-700 max-w-xl mb-6">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset
            </p>
            {/* <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#e94b5a] text-white font-semibold shadow hover:bg-[#c43c4a] transition-all">
              View More
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white text-[#e94b5a]">
                <svg width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 8h8m0 0l-3-3m3 3l-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
            </button> */}
          </div>
          {/* Image Right with min padding */}
          <div className="flex-1 flex justify-center items-center py-6 md:pr-8">
            <img src={AllImg} alt="Event" className="w-full max-w-lg h-[360px] object-cover rounded-[48px] shadow-xl border-4 border-white" />
          </div>
        </div>
      </section>

      {/* Bg 2 Section */}
      {/* <section
        className="w-full min-h-[40vh] md:min-h-[60vh] bg-cover bg-center relative flex items-center justify-center"
        style={{ backgroundImage: `url(${Bg2})`, marginTop: '-32px' }}
      /> */}

      {/* News Section with Fully Consistent Responsive Bg Size */}
      <section
        className="w-full min-h-[60vh] md:min-h-[80vh] bg-cover bg-center relative flex items-center justify-center"
        style={{ backgroundImage: `url(${Bg2})` }}
      >
        <div className="flex flex-col items-center justify-center w-full max-w-7xl gap-8 px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2
              className="text-balance text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl"
              style={{
                textShadow: '0 2px 8px rgba(255,255,255,0.7)',
                fontFamily: 'Karlos DEMO, sans-serif',
              }}
            >
              Latest News
            </h2>
            <p className="mt-2 text-lg/8 text-gray-700" style={{textShadow: '0 2px 8px rgba(255,255,255,0.7)'}}>
              Stay updated with the latest announcements and updates
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl auto-rows-fr grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {news.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Newspaper className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No news yet</h3>
                <p className="text-gray-700">Check back later for updates.</p>
              </div>
            ) : (
              news.map((article, index) => (
                <article
                  key={article._id || article.id}
                  className="relative isolate flex flex-col justify-end overflow-hidden rounded-2xl bg-white/80 px-8 pb-8 pt-80 sm:pt-48 lg:pt-80 shadow-lg"
                >
                  <img 
                    alt="" 
                    src={article.imageUrl ? resolveApiUrl(article.imageUrl) : `https://images.unsplash.com/photo-1496128858413-b36217c2ce36?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3603&q=80&ix=${index}`} 
                    className="absolute inset-0 -z-10 size-full object-cover rounded-2xl" 
                  />
                  <div className="absolute inset-0 -z-10 bg-gradient-to-t from-gray-900 via-gray-900/40" />

                  <div className="flex flex-wrap items-center gap-y-1 overflow-hidden text-sm/6 text-gray-300">
                    <time className="mr-8">
                      {article.createdAt ? new Date(article.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Date unavailable'}
                    </time>
                    <div className="-ml-4 flex items-center gap-x-4">
                      <svg viewBox="0 0 2 2" className="-ml-0.5 size-0.5 flex-none fill-gray-400">
                        <circle r={1} cx={1} cy={1} />
                      </svg>
                      <div className="flex gap-x-2.5">
                        <div className="size-6 flex-none rounded-full bg-gray-100 flex items-center justify-center">
                          <Newspaper className="h-4 w-4 text-gray-700" />
                        </div>
                        Admin
                      </div>
                    </div>
                  </div>
                  <h3 className="mt-3 text-lg/6 font-semibold text-white">
                    <Link to="/news">
                      <span className="absolute inset-0" />
                      {article.title || 'Untitled'}
                    </Link>
                  </h3>
                </article>
              ))
            )}
          </div>
          {news.length > 0 && (
            <div className="mt-12 text-center">
              <Link to="/news" className="btn-primary inline-flex items-center space-x-2">
                <span>View All News</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
            {/* Minimal space between button and footer */}
            <div className="mb-4" />
        </div>
      </section>

      {/* News section remains unchanged */}
      
    </div>
  );
};

export default Home;
