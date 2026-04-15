// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { itineraryService } from '../../services/itinerary.service';

// const MyItineraries = () => {
//   const [itineraries, setItineraries] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchItineraries = async () => {
//       try {
//         const data = await itineraryService.getMyItineraries();
//         setItineraries(data);
//       } catch (error) {
//         console.error('Failed to fetch itineraries', error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchItineraries();
//   }, []);

//   const handleView = (itinerary) => {
//     navigate(`/itinerary/${itinerary._id}`);
//   };

//   if (loading) return <div className="text-center mt-20 text-text-muted font-medium">Loading your journeys...</div>;

//   return (
//     <div className="max-w-4xl mx-auto py-8">
//       <h2 className="text-3xl font-extrabold text-text mb-8 border-b border-border pb-4">My Travel Plans</h2>
      
//       {itineraries.length === 0 ? (
//         <div className="text-center bg-surface p-12 rounded-xl shadow-md border border-border">
//           <p className="text-text-muted mb-4 text-lg">You haven't generated any itineraries yet.</p>
//           <button onClick={() => navigate('/generate-itinerary')} className="text-white px-8 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all" style={{ background: 'var(--gradient-primary)' }}>
//             Plan a Trip Now
//           </button>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {itineraries.map((it) => (
//             <div key={it._id} className="bg-surface rounded-xl shadow-md border border-border hover:shadow-lg transition-all p-6 flex flex-col justify-between">
//               <div>
//                 <h3 className="text-xl font-bold text-text mb-2 tracking-tight">{it.destination}</h3>
//                 <div className="text-sm text-text-muted mb-4 space-y-1 bg-input-bg p-3 rounded-lg border border-border">
//                   <p><strong className="text-text">Days:</strong> {it.days}</p>
//                   <p><strong className="text-text">Budget:</strong> ₹{it.budget}</p>
//                   <p><strong className="text-text">Travelers:</strong> {it.groupSize}</p>
//                   <p><strong className="text-text">Created:</strong> {new Date(it.createdAt).toLocaleDateString()}</p>
//                 </div>
//               </div>
//               <button 
//                 onClick={() => handleView(it)}
//                 className="mt-4 w-full text-primary border border-primary py-2.5 rounded-lg hover:bg-primary hover:text-white transition-colors font-medium">
//                 View Details
//               </button>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };
// export default MyItineraries;


import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { itineraryService } from '../../services/itinerary.service';

const MyItineraries = () => {
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItineraries = async () => {
      try {
        const data = await itineraryService.getMyItineraries();
        setItineraries(data);
      } catch (error) {
        console.error('Failed to fetch itineraries', error);
      } finally {
        setLoading(false);
      }
    };
    fetchItineraries();
  }, []);

  const handleView = (itinerary) => {
    navigate(`/itinerary/${itinerary._id}`);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center mt-32">
        <div className="px-6 py-3 rounded-lg bg-input-bg border border-border text-text-muted font-medium animate-pulse">
          Loading your journeys...
        </div>
      </div>
    );

  return (
    <div className="px-6 mx-auto py-3">
      {/* HEADER */}
      <div className="mb-10">
        <h2 className="text-2xl font-extrabold text-text tracking-tight">
          My Travel Plans 
        </h2>
        <p className="text-text-muted mt-2">
          All your saved adventures in one place
        </p>
        <div className="mt-4 h-1 w-24 rounded-full" style={{ background: 'var(--gradient-primary)' }} />
      </div>

      {/* EMPTY STATE */}
      {itineraries.length === 0 ? (
        <div className="text-center bg-surface p-14 rounded-2xl shadow-md border border-border">
          <p className="text-text-muted mb-6 text-lg">
            You haven't generated any itineraries yet.
          </p>

          <button
            onClick={() => navigate('/generate-itinerary')}
            className="text-white px-8 py-3 rounded-xl font-semibold shadow-md hover:scale-105 hover:shadow-lg transition-all"
            style={{ background: 'var(--gradient-primary)' }}
          >
            ✨ Plan a Trip Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {itineraries.map((it) => (
            <div
              key={it._id}
              className="group bg-surface rounded-2xl border border-border shadow-md hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between relative overflow-hidden"
            >
              {/* subtle hover glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-primary/5"></div>

              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-text mb-3 tracking-tight">
                  {it.destination}
                </h3>

                <div className="text-sm text-text-muted mb-4 space-y-2 bg-input-bg p-4 rounded-xl border border-border">
                  <p>
                    <span className="font-semibold text-text">🗓 Days:</span> {it.days}
                  </p>
                  <p>
                    <span className="font-semibold text-text">💰 Budget:</span> ₹{it.budget}
                  </p>
                  <p>
                    <span className="font-semibold text-text">👥 Travelers:</span> {it.groupSize}
                  </p>
                  <p>
                    <span className="font-semibold text-text">📅 Created:</span>{' '}
                    {new Date(it.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* BUTTON */}
              <button
                onClick={() => handleView(it)}
                className="relative z-10 mt-4 w-full py-2.5 rounded-xl font-semibold border border-primary text-primary hover:text-white transition-all duration-300"
                style={{
                  background: 'transparent',
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = 'var(--gradient-primary)')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = 'transparent')
                }
              >
                View Details →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyItineraries;