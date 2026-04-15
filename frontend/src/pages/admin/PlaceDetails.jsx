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

//   if (!place) return <div className="p-6 text-text">Loading...</div>;

//   return (
//     <div className="min-h-screen bg-bg py-10 px-4">
//       <div className="max-w-4xl mx-auto bg-surface p-6 rounded-2xl border border-border shadow-(--shadow-primary)">

//         <div className="overflow-hidden rounded-xl mb-6">
//           <img
//             src={place.image}
//             className="w-full h-72 object-cover transition-all duration-500 hover:scale-105"
//           />
//         </div>

//         <h1 className="text-3xl font-bold text-text">{place.name}</h1>
//         <p className="text-text-muted mt-1">{place.city}</p>

//         <div className="h-px bg-border my-4"></div>

//         <p className="text-text leading-relaxed">
//           {place.description}
//         </p>

//         <div className="mt-8 flex gap-4">
//           <button
//             onClick={() => navigate(`/admin/places/edit/${id}`)}
//             className="px-5 py-2 rounded-lg text-white font-medium bg-primary hover:bg-primary-hover transition-all shadow-(--shadow-primary)"
//           >
//             Edit
//           </button>

//           <button
//             onClick={handleDelete}
//             className="px-5 py-2 rounded-lg font-medium bg-primary-soft text-text hover:bg-primary hover:text-white transition-all"
//           >
//             Delete
//           </button>
//         </div>
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

  // ✅ Button states
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPlace = async () => {
      try {
        const data = await placeService.getPlaceById(id);
        setPlace(data);
      } catch (err) {
        setError("Failed to load place.");
      }
    };
    fetchPlace();
  }, [id]);

  // ✅ Edit Handler
  const handleEdit = () => {
    setEditLoading(true);
    navigate(`/admin/places/edit/${id}`);
  };

  // ✅ Delete Handler
  const handleDelete = async () => {
    if (!window.confirm("Delete this place?")) return;

    try {
      setDeleteLoading(true);
      setError("");

      await placeService.deletePlace(id);

      navigate('/admin/places');
    } catch (err) {
      setError("Failed to delete place. Try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!place) {
    return <div className="p-6 text-text">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-bg py-10 px-4">
      <div className="max-w-4xl mx-auto bg-surface p-6 rounded-2xl border border-border shadow-(--shadow-primary)">

        {/* Image */}
        <div className="overflow-hidden rounded-xl mb-6">
          <img
            src={place.image}
            className="w-full h-72 object-cover transition-all duration-500 hover:scale-105"
          />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-text">{place.name}</h1>
        <p className="text-text-muted mt-1">{place.city}</p>

        <div className="h-px bg-border my-4"></div>

        {/* Description */}
        <p className="text-text leading-relaxed">
          {place.description}
        </p>

        {/* Error Message */}
        {error && (
          <p className="mt-4 text-red-500 text-sm">{error}</p>
        )}

        {/* Buttons */}
        <div className="mt-8 flex gap-4">
          
          {/* Edit Button */}
          <button
            onClick={handleEdit}
            disabled={editLoading || deleteLoading}
            className={`px-5 py-2 rounded-lg text-white font-medium transition-all shadow-(--shadow-primary)
              ${editLoading 
                ? "bg-primary opacity-70 cursor-not-allowed" 
                : "bg-primary hover:bg-primary-hover"
              }`}
          >
            {editLoading ? "Opening..." : "Edit"}
          </button>

          {/* Delete Button */}
          <button
            onClick={handleDelete}
            disabled={deleteLoading || editLoading}
            className={`px-5 py-2 rounded-lg font-medium transition-all
              ${deleteLoading 
                ? "bg-primary opacity-70 text-white cursor-not-allowed" 
                : "bg-primary-soft text-text hover:bg-primary hover:text-white"
              }`}
          >
            {deleteLoading ? "Deleting..." : "Delete"}
          </button>

        </div>
      </div>
    </div>
  );
};

export default PlaceDetails;