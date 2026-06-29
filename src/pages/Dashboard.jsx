import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Spinner from '../components/Spinner';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  Coffee,
  CheckCircle,
  BarChart2
} from 'lucide-react';

function IndianRupeeIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M6 3h12" />
      <path d="M6 8h12" />
      <path d="m6 13 8.5 8" />
      <path d="M6 13h3a5 5 0 0 0 0-10" />
    </svg>
  );
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const MOCK_STATS = {
  todaySales: 184.20,
  todayOrders: 18,
  pendingOrders: 3,
  completedOrders: 14,
  revenue: 2450.80,
};

const MOCK_POPULAR = [
  { id: 1, name: 'Cafe Latte', price: 3.80, quantitySold: 42, image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=100&auto=format&fit=crop' },
  { id: 2, name: '1312 Signature Burger', price: 8.90, quantitySold: 31, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100&auto=format&fit=crop' },
  { id: 3, name: 'Tiramisu Classic', price: 5.50, quantitySold: 28, image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=100&auto=format&fit=crop' },
  { id: 4, name: 'Cold Brew Classic', price: 4.00, quantitySold: 24, image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=100&auto=format&fit=crop' },
];

const MOCK_CHART = [
  { label: 'Mon', sales: 240 },
  { label: 'Tue', sales: 320 },
  { label: 'Wed', sales: 280 },
  { label: 'Thu', sales: 420 },
  { label: 'Fri', sales: 490 },
  { label: 'Sat', sales: 580 },
  { label: 'Sun', sales: 620 },
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [popularProducts, setPopularProducts] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('daily'); // daily, weekly, monthly

  useEffect(() => {
    async function loadDashboard() {
      try {
        const statsRes = await api.get('/reports/stats');
        const salesRes = await api.get(`/reports/sales?range=${range}`);
        
        if (statsRes.success) {
          setStats(statsRes.stats);
          setPopularProducts(statsRes.popularProducts || MOCK_POPULAR);
        } else {
          setStats(MOCK_STATS);
          setPopularProducts(MOCK_POPULAR);
        }

        if (salesRes.success && salesRes.chartData?.length) {
          setChartData(salesRes.chartData);
        } else {
          setChartData(MOCK_CHART);
        }
      } catch (err) {
        console.warn('API error fetching reports, using mocks:', err);
        setStats(MOCK_STATS);
        setPopularProducts(MOCK_POPULAR);
        setChartData(MOCK_CHART);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [range]);

  if (loading) return <Spinner />;

  // Chart setup
  const chartLabels = chartData.map(d => d.label);
  const chartValues = chartData.map(d => d.sales);

  const data = {
    labels: chartLabels,
    datasets: [
      {
        fill: true,
        label: 'Sales Revenue (₹)',
        data: chartValues,
        borderColor: '#9BB578',
        backgroundColor: 'rgba(155, 181, 120, 0.1)',
        tension: 0.4,
        borderWidth: 2,
        pointBackgroundColor: '#9BB578',
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        padding: 10,
        backgroundColor: '#0E110A',
        titleFont: { size: 12, family: 'Inter' },
        bodyFont: { size: 12, family: 'Inter' },
      }
    },
    scales: {
      y: {
        grid: {
          color: 'rgba(155, 181, 120, 0.05)',
        },
        ticks: {
          color: '#0E110A',
          font: { size: 10, family: 'Inter' },
          callback: (value) => '₹' + value,
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#0E110A',
          font: { size: 10, family: 'Inter' },
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Sales */}
        <div className="bg-white border border-primary/10 rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-cafeDark/40 uppercase tracking-wider">Today's Sales</span>
            <p className="text-2xl font-bold text-cafeDark">₹{stats?.todaySales.toFixed(2)}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        {/* Orders */}
        <div className="bg-white border border-primary/10 rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-cafeDark/40 uppercase tracking-wider">Today's Orders</span>
            <p className="text-2xl font-bold text-cafeDark">{stats?.todayOrders}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <ShoppingBag className="h-5 w-5" />
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white border border-primary/10 rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-cafeDark/40 uppercase tracking-wider">Pending Orders</span>
            <p className="text-2xl font-bold text-yellow-600">{stats?.pendingOrders}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center animate-pulse">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white border border-primary/10 rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-cafeDark/40 uppercase tracking-wider">Total Revenue</span>
            <p className="text-2xl font-bold text-primary">₹{stats?.revenue.toFixed(2)}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-green-50 text-primary flex items-center justify-center">
            <IndianRupeeIcon className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Chart & Popular List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chart Card */}
        <div className="lg:col-span-8 bg-white border border-primary/10 rounded-2xl p-6 shadow-sm space-y-4 flex flex-col">
          <div className="flex items-center justify-between border-b border-primary/5 pb-4">
            <div className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-primary" />
              <h2 className="text-sm font-bold text-cafeDark">Sales Revenue Trends</h2>
            </div>
            
            {/* Filters */}
            <div className="flex bg-primary/10 p-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider">
              {['daily', 'weekly', 'monthly'].map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    range === r ? 'bg-primary text-cafeDark' : 'text-cafeDark/50 hover:text-cafeDark'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-72 w-full flex-grow">
            <Line data={data} options={options} />
          </div>
        </div>

        {/* Popular Items Card */}
        <div className="lg:col-span-4 bg-white border border-primary/10 rounded-2xl p-6 shadow-sm flex flex-col space-y-4">
          <div className="flex items-center gap-2 border-b border-primary/5 pb-4">
            <Coffee className="h-5 w-5 text-primary" />
            <h2 className="text-sm font-bold text-cafeDark">Popular Products</h2>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto max-h-72 pr-1">
            {popularProducts.map((item, index) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="h-11 w-11 shrink-0 rounded-xl overflow-hidden bg-primary/10">
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-cafeDark truncate">{item.name}</p>
                  <p className="text-[10px] text-cafeDark/40 font-semibold uppercase mt-0.5">{item.quantitySold} sales</p>
                </div>
                <span className="text-xs font-bold text-primary">₹{item.price.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
