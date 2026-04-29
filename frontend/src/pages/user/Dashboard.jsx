// import React, { useEffect, useState } from 'react';
// import { MapPin, Wallet, Calendar, Globe, TrendingUp, AlertCircle } from 'lucide-react';
// import { dashboardService } from '../../services/dashboard.service';

// const UserDashboard = () => {
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     // Consistent async/await pattern as used in ItineraryResult
//     const fetchDashboardData = async () => {
//       try {
//         setLoading(true);
//         const res = await dashboardService.getUserDashboard();
//         console.log(res)
//         setData(res);
//       } catch (err) {
//         console.error("Error fetching dashboard:", err);
//         setError("Failed to fetch dashboard data.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDashboardData();
//   }, []);

//   if (loading) return <div className="p-8 text-text animate-pulse">Loading your travel stats...</div>;
  
//   if (error) return (
//     <div className="p-8 text-red-500 flex items-center gap-2">
//       <AlertCircle size={20} /> {error}
//     </div>
//   );

//   return (
//     <div className="p-6 space-y-8 animate-in fade-in duration-500">
//       <header>
//         <h1 className="text-3xl font-bold text-text">Welcome back, Explorer</h1>
//         <p className="text-text-muted">Here’s a summary of your wanderlust journey.</p>
//       </header>

//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <StatCard 
//           icon={<Calendar className="text-primary" />} 
//           label="Total Itineraries" 
//           value={data?.summary?.totalItineraries ?? 0} 
//         />
//         <StatCard 
//           icon={<Wallet className="text-primary" />} 
//           label="Budget Tracked" 
//           value={`₹${data?.summary?.totalBudgetTracked ?? 0}`} 
//         />
//         <StatCard 
//           icon={<MapPin className="text-primary" />} 
//           label="Places Explored" 
//           value={data?.summary?.placesExplored ?? 0} 
//         />
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//         <div className="lg:col-span-2 space-y-4">
//           <h2 className="text-xl font-semibold text-text flex items-center gap-2">
//             <TrendingUp size={20} /> Recent Trips
//           </h2>
//           <div className="grid gap-4">
//             {(data?.recentItineraries || []).map((trip) => (
//               <div key={trip._id} className="bg-surface border border-border p-5 rounded-2xl hover:shadow-lg transition-all">
//                 <div className="flex justify-between items-center">
//                   <div>
//                     <h3 className="font-bold text-lg text-text">{trip.destination}</h3>
//                     <p className="text-sm text-text-muted">
//                       {trip.createdAt ? new Date(trip.createdAt).toLocaleDateString() : 'Recent'}
//                     </p>
//                   </div>
//                   <span className="bg-primary-soft text-primary px-3 py-1 rounded-full text-xs font-bold">
//                     {/* Accessing the nested plan structure correctly */}
//                     {trip.plan?.length || 0} Days
//                   </span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className="space-y-6">
//           <div className="bg-linear-to-r from-primary to-blue-600 p-6 rounded-3xl text-white shadow-xl">
//             <h3 className="font-bold flex items-center gap-2 mb-4"><Globe size={18}/> Global Inventory</h3>
//             <div className="space-y-2">
//               <p className="flex justify-between text-sm opacity-90">
//                 Available Cities <span>{data?.systemInventory?.availableCities ?? 0}</span>
//               </p>
//               <div className="h-px bg-white/20 w-full" />
//               <p className="flex justify-between text-sm opacity-90">
//                 Total Places <span>{data?.systemInventory?.availablePlaces ?? 0}</span>
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const StatCard = ({ icon, label, value }) => (
//   <div className="bg-surface border border-border p-6 rounded-3xl flex items-center gap-4">
//     <div className="p-3 bg-primary-soft rounded-2xl">{icon}</div>
//     <div>
//       <p className="text-text-light text-xs uppercase tracking-wider font-bold">{label}</p>
//       <p className="text-2xl font-black text-text">{value}</p>
//     </div>
//   </div>
// );

// export default UserDashboard;



import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Wallet,
  Calendar,
  Globe,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { dashboardService } from '../../services/dashboard.service';
import SkeletonCard from '../../components/common/SkeletonCard';

const UserDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await dashboardService.getUserDashboard();
        setData(res);
      } catch (err) {
        console.error("Error fetching dashboard:", err);
        setError("Failed to fetch dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Skeletons set layout expectations — they show the exact shapes that
  // content will fill, reducing perceived load time vs a plain spinner
  if (loading)
    return (
      <div className="p-6 space-y-8">
        <div className="space-y-2">
          <div className="h-8 bg-input-bg rounded w-64 animate-pulse" />
          <div className="h-4 bg-input-bg rounded w-96 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} variant="stat" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-6 bg-input-bg rounded w-32 animate-pulse" />
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-surface border border-border rounded-2xl p-5 animate-pulse flex gap-4">
                <div className="w-32 h-28 bg-input-bg rounded" />
                <div className="flex-1 space-y-3 py-2">
                  <div className="h-5 bg-input-bg rounded w-3/4" />
                  <div className="h-4 bg-input-bg rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <SkeletonCard key={i} variant="stat" />
            ))}
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="p-8 text-red-500 flex items-center gap-2">
        <AlertCircle size={20} /> {error}
      </div>
    );

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-bold text-text">
          Welcome back, Explorer
        </h1>
        <p className="text-text-muted">
          Here’s a summary of your wanderlust journey.
        </p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={<Calendar className="text-primary" />}
          label="Total Itineraries"
          value={data?.summary?.totalItineraries ?? 0}
        />
        <StatCard
          icon={<Wallet className="text-primary" />}
          label="Budget Tracked"
          value={`₹${data?.summary?.totalBudgetTracked ?? 0}`}
        />
        <StatCard
          icon={<MapPin className="text-primary" />}
          label="Places Explored"
          value={data?.summary?.placesExplored ?? 0}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Trips */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold text-text flex items-center gap-2">
            <TrendingUp size={20} /> Recent Trips
          </h2>

          <div className="grid gap-4">
            {(data?.recentItineraries || []).length === 0 ? (
              <div className="bg-surface border border-border rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-3">
                
                <MapPin size={32} className="text-primary opacity-70" />

                <h3 className="text-lg font-semibold text-text">
                  No trips yet
                </h3>

                <p className="text-sm text-text-muted max-w-xs">
                  Start planning your first adventure and it will show up here.
                </p>

                <button
                  onClick={() => navigate('/generate-itinerary')}
                  className="mt-2 px-5 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition"
                >
                  Create Your First Trip
                </button>
              </div>
            ) 
            : 
            (data?.recentItineraries || []).map((trip) => (
              <div
                key={trip._id}
                className="bg-surface border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all flex gap-4"
              >
                {/* Image */}
                <img
                  src={
                    trip.plan?.[0]?.places?.[0]?.image ||
                    `https://source.unsplash.com/300x200/?${trip.destination}`
                  }
                  alt={trip.destination}
                  className="w-32 h-28 object-cover"
                />

                {/* Content */}
                <div className="flex-1 p-4 flex flex-col justify-between">
                  <div className="flex justify-between items-center flex-wrap gap-y-2">
                    <div>
                      <h3 className="font-bold text-lg text-text">
                        {trip.destination}
                      </h3>
                      <p className="text-sm text-text-muted">
                        {trip.createdAt
                          ? new Date(trip.createdAt).toLocaleDateString()
                          : "Recent"}
                      </p>
                    </div>

                    <span className="bg-primary-soft text-primary px-3 py-1 rounded-full text-xs font-bold">
                      {trip.plan?.length || 0} Days
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Travel Insights */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-text flex items-center gap-2">
            <Globe size={20} /> Travel Insights
          </h2>

          <div className="grid grid-cols-1 gap-4">
            <StatCard
              icon={<Globe className="text-primary" />}
              label="Available Cities"
              value={data?.systemInventory?.availableCities ?? 0}
            />

            <StatCard
              icon={<MapPin className="text-primary" />}
              label="Total Places"
              value={data?.systemInventory?.availablePlaces ?? 0}
            />
          </div>
        </div>

      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value }) => (
  <div className="bg-surface border border-border p-6 rounded-3xl flex items-center gap-4">
    <div className="p-3 bg-primary-soft rounded-2xl">{icon}</div>
    <div>
      <p className="text-text-light text-xs uppercase tracking-wider font-bold">
        {label}
      </p>
      <p className="text-2xl font-black text-text">{value}</p>
    </div>
  </div>
);

export default UserDashboard;