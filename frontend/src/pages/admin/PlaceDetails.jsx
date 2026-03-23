// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { placeService } from '../../services/place.service';

// const PlaceDetails = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [place, setPlace] = useState(null);

//   useEffect(() => {
//     const fetchPlace = async () => {
//       const data = await placeService.getPlaceById(id);
//       setPlace(data);
//     };
//     fetchPlace();
//   }, [id]);

//   const handleDelete = async () => {
//     if (!window.confirm("Delete this place?")) return;
//     await placeService.deletePlace(id);
//     navigate('/admin/places');
//   };

//   if (!place) return <div>Loading...</div>;

//   return (
//     <div className="max-w-4xl mx-auto bg-surface p-6 rounded-xl shadow">
//       <img src={place.image} className="w-full h-64 object-cover rounded-lg mb-4" />

//       <h1 className="text-3xl font-bold">{place.name}</h1>
//       <p className="text-text-muted">{place.city}</p>

//       <p className="mt-4">{place.description}</p>

//       <div className="mt-6 flex gap-4">
//         <button
//           onClick={() => navigate(`/admin/places/edit/${id}`)}
//           className="px-4 py-2 bg-blue-500 text-white rounded"
//         >
//           Edit
//         </button>

//         <button
//           onClick={handleDelete}
//           className="px-4 py-2 bg-red-500 text-white rounded"
//         >
//           Delete
//         </button>
//       </div>
//     </div>
//   );
// };

// export default PlaceDetails;



import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { placeService } from '../../services/place.service';

const PlaceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [place, setPlace] = useState(null);

  useEffect(() => {
    const fetchPlace = async () => {
      const data = await placeService.getPlaceById(id);
      setPlace(data);
    };
    fetchPlace();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this place?")) return;
    await placeService.deletePlace(id);
    navigate('/admin/places');
  };

  if (!place) return <div className="p-6 text-text">Loading...</div>;

  return (
    <div className="min-h-screen bg-bg py-10 px-4">
      <div className="max-w-4xl mx-auto bg-surface p-6 rounded-2xl border border-border shadow-(--shadow-primary)">

        <div className="overflow-hidden rounded-xl mb-6">
          <img
            src={place.image}
            className="w-full h-72 object-cover transition-all duration-500 hover:scale-105"
          />
        </div>

        <h1 className="text-3xl font-bold text-text">{place.name}</h1>
        <p className="text-text-muted mt-1">{place.city}</p>

        <div className="h-px bg-border my-4"></div>

        <p className="text-text leading-relaxed">
          {place.description}
        </p>

        <div className="mt-8 flex gap-4">
          <button
            onClick={() => navigate(`/admin/places/edit/${id}`)}
            className="px-5 py-2 rounded-lg text-white font-medium bg-primary hover:bg-primary-hover transition-all shadow-(--shadow-primary)"
          >
            Edit
          </button>

          <button
            onClick={handleDelete}
            className="px-5 py-2 rounded-lg font-medium bg-primary-soft text-text hover:bg-primary hover:text-white transition-all"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlaceDetails;