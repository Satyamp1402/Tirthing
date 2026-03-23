// import React from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';

// const ItineraryResult = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const itinerary = location.state?.itinerary;

//   if (!itinerary) {
//     return (
//       <div className="text-center mt-20">
//         <h2 className="text-2xl font-bold text-text">No Itinerary Found</h2>
//         <button onClick={() => navigate('/generate-itinerary')} className="mt-4 text-primary hover:text-primary-hover font-medium underline">Go back to generate</button>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-4xl mx-auto space-y-8 pb-12">
//       <div className="bg-surface p-6 rounded-xl shadow-sm border border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//         <div>
//           <h1 className="text-3xl font-extrabold text-text">{itinerary.destination} Trip</h1>
//           <p className="text-text-muted mt-2 font-medium bg-input-bg inline-block px-3 py-1 rounded-md border border-border text-sm">
//             {itinerary.days} Days • {itinerary.groupSize} Travelers • ₹{itinerary.budget}
//           </p>
//         </div>
//         <div>
//           <button onClick={() => window.print()} className="text-white px-5 py-2.5 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all print:hidden" style={{ background: 'var(--gradient-primary)' }}>
//             Print / Save PDF
//           </button>
//         </div>
//       </div>

//       <div className="space-y-6">
//         {itinerary.plan.map((dayPlan) => (
//           <div key={dayPlan._id || dayPlan.day} className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden break-inside-avoid">
//             <div className="bg-input-bg border-b border-border px-6 py-4">
//               <h3 className="text-xl font-extrabold text-primary">Day {dayPlan.day}</h3>
//             </div>
//             <div className="p-6">
//               <div className="relative border-l-2 border-primary/30 ml-3 md:ml-6 space-y-8">
//                 {dayPlan.places.map((place, idx) => (
//                   <div key={place._id || idx} className="relative pl-6 sm:pl-8">
//                     {/* Circle marker */}
//                     <div className="absolute -left-[9px] top-2 w-4 h-4 rounded-full bg-primary ring-4 ring-surface" style={{ boxShadow: 'var(--shadow-primary)' }}></div>
                    
//                     <div className="flex flex-col md:flex-row gap-5">
//                       {place.image && (
//                         <img src={place.image} alt={place.name} className="w-full md:w-36 h-28 object-cover rounded-lg shadow-sm border border-border" />
//                       )}
//                       <div>
//                         <h4 className="text-xl font-bold text-text mb-1">{place.name}</h4>
//                         <div className="flex flex-wrap gap-2 mt-1 mb-3">
//                           <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
//                             ~{place.visitDuration} hrs
//                           </span>
//                           <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-green-50 text-green-700 border border-green-100">
//                             {place.entryFee > 0 ? `₹${place.entryFee} Entry` : 'Free Entry'}
//                           </span>
//                           {place.priority === 1 && (
//                             <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-yellow-50 text-yellow-700 border border-yellow-100">
//                               Must Visit
//                             </span>
//                           )}
//                         </div>
//                         <p className="text-text-muted text-sm leading-relaxed whitespace-pre-line">{place.description}</p>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//                 {dayPlan.places.length === 0 && (
//                   <div className="pl-8 text-text-light italic font-medium">No places scheduled. Rest or explore locally.</div>
//                 )}
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };
// export default ItineraryResult;
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { itineraryService } from "../../services/itinerary.service";
import { exportToPDF } from '../../utils/exportToPdf'; // Ensure path is correct

const ItineraryResult = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        const res = await itineraryService.getItineraryById(id);
        console.log(res)
        setItinerary(res);
      } catch (err) {
        console.error("Error fetching itinerary:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchItinerary();
  }, [id]);

  // 🔥 UPDATED: Frontend PDF Generation
  const handleDownloadPDF = () => {
    if (itinerary) {
      exportToPDF(itinerary);
    }
  };

  if (loading) return <div className="text-center mt-20 text-text-muted font-medium">Loading itinerary...</div>;

  if (!itinerary) {
    return (
      <div className="text-center mt-20">
        <h2 className="text-2xl font-bold text-text">No Itinerary Found</h2>
        <button onClick={() => navigate('/generate-itinerary')} className="mt-4 text-primary underline">
          Go back to generate
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="bg-surface p-6 rounded-xl shadow-sm border border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-text">{itinerary.destination}</h1>
          <p className="text-text-muted mt-2 font-medium bg-input-bg inline-block px-3 py-1 rounded-md border border-border text-sm">
            {itinerary.days} Days • {itinerary.groupSize} Travelers • ₹{itinerary.budget}
          </p>
        </div>

        <button
          onClick={handleDownloadPDF}
          className="text-white px-5 py-2.5 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
          style={{ background: 'var(--gradient-primary)' }}
        >
          Download PDF (Frontend)
        </button>
      </div>

      {/* Days Mapping */}
      <div className="space-y-6">
        {itinerary.plan.map((dayPlan) => (
          <div
            key={dayPlan._id || dayPlan.day}
            className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden"
          >
            {/* Day Header */}
            <div className="bg-input-bg border-b border-border px-6 py-4">
              <h3 className="text-xl font-extrabold text-primary">
                Day {dayPlan.day}
              </h3>
            </div>

            {/* Day Content */}
            <div className="p-6">
              <div className="relative border-l-2 border-primary/30 ml-3 md:ml-6 space-y-8">
                {dayPlan.places.map((place, idx) => (
                  <div
                    key={place._id || idx}
                    className="relative pl-6 sm:pl-8"
                  >
                    {/* Timeline Dot */}
                    <div className="absolute -left-[9px] top-2 w-4 h-4 rounded-full bg-primary ring-4 ring-surface"></div>

                    <div className="flex flex-col md:flex-row gap-5 items-start">

                      {/* Image */}
                      {place.image && (
                        <img
                          src={place.image}
                          alt={place.name}
                          className="w-full md:w-40 h-28 object-cover rounded-lg"
                        />
                      )}

                      {/* Content */}
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-text mb-1">
                          {place.name}
                        </h4>

                        {/* 🔥 DETAILS */}
                        <div className="flex flex-wrap gap-2 mt-2 mb-3">

                          {/* Visit Duration */}
                          <span className="px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-700 rounded-md">
                            ⏱ {place.visitDuration} hrs
                          </span>

                          {/* Entry Fee */}
                          <span className="px-2.5 py-1 text-xs font-semibold bg-green-50 text-green-700 rounded-md">
                            {place.entryFee > 0
                              ? `₹${place.entryFee} Entry`
                              : "Free Entry"}
                          </span>

                          {/* Map Link */}
                          <a
                            href={`https://www.google.com/maps?q=${place.latitude},${place.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 text-xs font-semibold bg-purple-50 text-purple-700 rounded-md hover:underline"
                          >
                            📍 View on Map
                          </a>

                        </div>

                        {/* Description */}
                        <p className="text-text-muted text-sm leading-relaxed">
                          {place.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Empty State */}
                {dayPlan.places.length === 0 && (
                  <div className="pl-8 text-text-light italic font-medium">
                    No places scheduled. Rest or explore locally.
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    
  );
};

export default ItineraryResult;