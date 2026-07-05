import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import api from './utils/api';
import Sidebar from './components/Sidebar';
import Header from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Orders from './pages/Orders';
import Coupons from './pages/Coupons';
import Customers from './pages/Customers';
import Settings from './pages/Settings';

// Route Guard Component
function RequireAuth({ children }) {
  const token = api.getToken();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

const CAFE_TRACKS = [
  { title: "Cafe Lo-Fi Beats", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { title: "Warm Brew Jazz", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { title: "Rainy Day Espresso", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" }
];

// Audio Context and Ring Interval variables
let ringAudioCtx = null;
let ringInterval = null;

const startRinging = () => {
  if (ringAudioCtx) {
    if (ringAudioCtx.state === 'suspended') {
      ringAudioCtx.resume().catch(e => console.log('Resume blocked:', e));
    }
    return; // Already ringing
  }
  
  try {
    ringAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    const playTone = () => {
      if (!ringAudioCtx || ringAudioCtx.state === 'closed') return;
      const now = ringAudioCtx.currentTime;
      
      const createTone = (startTime, duration) => {
        const osc1 = ringAudioCtx.createOscillator();
        const osc2 = ringAudioCtx.createOscillator();
        const gainNode = ringAudioCtx.createGain();
        
        osc1.type = 'sine';
        osc1.frequency.value = 440; // Ringback tone frequency 1
        osc2.type = 'sine';
        osc2.frequency.value = 480; // Ringback tone frequency 2
        
        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(ringAudioCtx.destination);
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.80, startTime + 0.05);
        gainNode.gain.setValueAtTime(0.80, startTime + duration - 0.05);
        gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
        
        osc1.start(startTime);
        osc2.start(startTime);
        osc1.stop(startTime + duration);
        osc2.stop(startTime + duration);
      };
      
      // Ring-ring: 0.4s burst, 0.2s pause, 0.4s burst
      createTone(now, 0.4);
      createTone(now + 0.6, 0.4);
    };
    
    playTone();
    ringInterval = setInterval(playTone, 3000);
  } catch (err) {
    console.error('Error starting ringtone:', err);
  }
};

const stopRinging = () => {
  if (ringInterval) {
    clearInterval(ringInterval);
    ringInterval = null;
  }
  if (ringAudioCtx) {
    try {
      ringAudioCtx.close();
    } catch (e) {}
    ringAudioCtx = null;
  }
};

// Layout wrapper for authenticated pages
function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Audio Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [audio] = useState(() => {
    const aud = new Audio(CAFE_TRACKS[0].url);
    aud.loop = true;
    return aud;
  });
  
  // Real-time Order Alert State
  const [newOrderToast, setNewOrderToast] = useState(null);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    audio.src = CAFE_TRACKS[trackIndex].url;
    if (isPlaying) {
      audio.play().catch(err => console.log('Audio autoplay blocked:', err));
    }
  }, [trackIndex]);

  useEffect(() => {
    if (isPlaying) {
      audio.play().catch(err => {
        console.log('Audio play blocked:', err);
        setIsPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      audio.pause();
      stopRinging();
    };
  }, []);

  // Poll for new orders globally and check PENDING status
  useEffect(() => {
    let latestId = null;

    const checkPendingAndNewOrders = async () => {
      try {
        const res = await api.get('/orders');
        if (res.success && res.orders) {
          // 1. Looping alert if there are pending orders
          const pendingOrders = res.orders.filter(o => o.status === 'PENDING');
          if (pendingOrders.length > 0) {
            setIsPlaying(false); // Stop ambient lo-fi music
            startRinging();
          } else {
            stopRinging();
          }

          // 2. Toast alerts for new incoming orders
          if (res.orders.length > 0) {
            const newLatestId = res.orders[0].id;
            if (latestId !== null && newLatestId > latestId) {
              setNewOrderToast(`New Order Received! Order #${newLatestId} placed.`);
              setTimeout(() => setNewOrderToast(null), 5000);
            }
            latestId = newLatestId;
          }
        }
      } catch (err) {
        console.warn('Orders poll error:', err.message);
      }
    };

    checkPendingAndNewOrders();
    const interval = setInterval(checkPendingAndNewOrders, 5000); // 5 seconds polling
    
    return () => {
      clearInterval(interval);
      stopRinging();
    };
  }, [audio]);

  // Get active title based on path
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Analytics Dashboard';
      case '/products':
        return 'Product Management';
      case '/categories':
        return 'Category Management';
      case '/orders':
        return 'Live Order Monitor';
      case '/coupons':
        return 'Promos & Coupons';
      case '/customers':
        return 'Customer Database';
      case '/settings':
        return 'Cafe Settings';
      default:
        return 'Cafe Administration';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9F6] flex">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64 min-h-screen">
        <Header 
          toggleSidebar={toggleSidebar} 
          title={getPageTitle()} 
          audioState={{ isPlaying, setIsPlaying, trackIndex, setTrackIndex, tracks: CAFE_TRACKS }}
        />
        
        {newOrderToast && (
          <div className="fixed top-20 right-6 z-50 bg-[#0E110A] text-[#9BB578] text-xs font-bold px-6 py-3.5 rounded-2xl shadow-xl border border-primary/20 flex items-center gap-3 animate-bounce">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping"></span>
            <span>{newOrderToast}</span>
          </div>
        )}

        <main className="flex-grow p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/coupons" element={<Coupons />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        />
      </Routes>
    </Router>
  );
}
