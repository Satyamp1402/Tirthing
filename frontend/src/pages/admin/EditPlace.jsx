// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { placeService } from '../../services/place.service';

// const EditPlace = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [form, setForm] = useState({
//     name: '',
//     city: '',
//     image: '',
//     latitude: '',
//     longitude: '',
//     visitDuration: '',
//     entryFee: '',
//     priority: '',
//     description: ''
//   });

//   useEffect(() => {
//     const fetchPlace = async () => {
//       const data = await placeService.getPlaceById(id);
//       setForm(data);
//     };
//     fetchPlace();
//   }, [id]);

//   const handleChange = (e) => {
//     setForm({
//       ...form,
//       [e.target.name]: e.target.value
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     await placeService.updatePlace(id, {
//       ...form,
//       latitude: Number(form.latitude),
//       longitude: Number(form.longitude),
//       visitDuration: Number(form.visitDuration),
//       entryFee: Number(form.entryFee),
//       priority: Number(form.priority)
//     });

//     navigate(`/admin/places/${id}`);
//   };

//   return (
//     <div className="h-auto bg-bg flex items-center justify-center px-4">
//       <form
//   onSubmit={handleSubmit}
//   className="max-w-4xl w-full bg-surface p-8 rounded-2xl border border-border shadow-(--shadow-primary)"
// >
//   <h2 className="text-3xl font-bold text-text mb-6">
//     Edit Place
//   </h2>

//   {/* NAME + CITY */}
//   <div className="grid md:grid-cols-2 gap-4">
//     <Input label="Name" name="name" value={form.name} onChange={handleChange} />
//     <Input label="City" name="city" value={form.city} onChange={handleChange} />
//   </div>

//   {/* IMAGE */}
//   <Input label="Image URL" name="image" value={form.image} onChange={handleChange} />

//   {/* LOCATION */}
//   <div className="grid md:grid-cols-2 gap-4">
//     <Input label="Latitude" name="latitude" value={form.latitude} onChange={handleChange} />
//     <Input label="Longitude" name="longitude" value={form.longitude} onChange={handleChange} />
//   </div>

//   {/* DETAILS */}
//   <div className="grid md:grid-cols-3 gap-4">
//     <Input
//       label="Visit Duration (hrs)"
//       name="visitDuration"
//       value={form.visitDuration}
//       onChange={handleChange}
//     />

//     <Input
//       label="Entry Fee"
//       name="entryFee"
//       value={form.entryFee}
//       onChange={handleChange}
//     />

//     {/* PRIORITY */}
//     <div className="mb-4">
//       <label className="text-sm text-text-muted">Priority</label>
//       <select
//         name="priority"
//         value={form.priority}
//         onChange={handleChange}
//         className="w-full mt-2 px-4 py-2 rounded-lg border border-border bg-input-bg text-text focus:outline-none focus:ring-2 focus:ring-primary"
//       >
//         <option value="">Select priority</option>
//         <option value="1">Must Visit</option>
//         <option value="2">Recommended</option>
//         <option value="3">Optional</option>
//       </select>
//     </div>
//   </div>

//   {/* DESCRIPTION */}
//   <div className="mb-6">
//     <label className="text-sm text-text-muted">Description</label>
//     <textarea
//       name="description"
//       value={form.description || ''}
//       onChange={handleChange}
//       rows={4}
//       className="w-full mt-2 px-4 py-2 rounded-lg border border-border bg-input-bg text-text focus:outline-none focus:ring-2 focus:ring-primary"
//     />
//   </div>

//   <button
//     type="submit"
//     className="w-1/2 block mx-auto py-3 rounded-lg text-white font-medium bg-primary hover:bg-primary-hover transition-all shadow-(--shadow-primary)"
//   >
//     Update Place
//   </button>
// </form>
//     </div>
//   );
// };

// /* 🔹 Reusable Input Component */
// const Input = ({ label, name, value, onChange }) => (
//   <div className="mb-4">
//     <label className="text-sm text-text-muted">{label}</label>
//     <input
//       name={name}
//       value={value || ''}
//       onChange={onChange}
//       className="w-full mt-2 px-4 py-2 rounded-lg border border-border bg-input-bg text-text focus:outline-none focus:ring-2 focus:ring-primary"
//     />
//   </div>
// );

// export default EditPlace;




import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { placeService } from '../../services/place.service';

const EditPlace = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    city: '',
    placeImage: null, // 🔥 IMPORTANT
    latitude: '',
    longitude: '',
    visitDuration: '',
    entryFee: '',
    priority: '',
    description: ''
  });

  useEffect(() => {
    const fetchPlace = async () => {
      try {
        const data = await placeService.getPlaceById(id);

        setForm({
          ...data,
          placeImage: null // 🔥 reset file
        });
      } catch (err) {
        setError('Failed to load place');
      }
    };

    fetchPlace();
  }, [id]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // 🔥 FILE CHANGE
  const handleFileChange = (e) => {
    setForm({
      ...form,
      placeImage: e.target.files[0]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      const data = new FormData();

      data.append("name", form.name);
      data.append("city", form.city);
      data.append("latitude", parseFloat(form.latitude));
      data.append("longitude", parseFloat(form.longitude));
      data.append("visitDuration", parseFloat(form.visitDuration));
      data.append("entryFee", parseFloat(form.entryFee));
      data.append("priority", parseInt(form.priority));
      data.append("description", form.description);

      // 🔥 ONLY IF USER SELECTED NEW IMAGE
      if (form.placeImage) {
        data.append("placeImage", form.placeImage);
      }

      await placeService.updatePlace(id, data);

      navigate(`/admin/places/${id}`);

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update place');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-auto bg-bg flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="max-w-4xl w-full bg-surface p-8 rounded-2xl border border-border shadow-(--shadow-primary)"
      >
        <h2 className="text-3xl font-bold text-text mb-6">
          Edit Place
        </h2>

        {error && (
          <div className="text-red-600 mb-4 text-center">
            {error}
          </div>
        )}

        {/* NAME + CITY */}
        <div className="grid md:grid-cols-2 gap-4">
          <Input label="Name" name="name" value={form.name} onChange={handleChange} />
          <Input label="City" name="city" value={form.city} onChange={handleChange} />
        </div>

        {/* 🔥 IMAGE UPLOAD */}
        <div className="mb-4">
          <label className="text-sm text-text-muted">Update Image (optional)</label>

          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="mt-2"
          />

          {/* Show current image */}
          {form.image && (
            <img
              src={form.image}
              alt="current"
              className="mt-3 w-40 rounded-lg"
            />
          )}
        </div>

        {/* LOCATION */}
        <div className="grid md:grid-cols-2 gap-4">
          <Input label="Latitude" name="latitude" value={form.latitude} onChange={handleChange} />
          <Input label="Longitude" name="longitude" value={form.longitude} onChange={handleChange} />
        </div>

        {/* DETAILS */}
        <div className="grid md:grid-cols-3 gap-4">
          <Input
            label="Visit Duration (hrs)"
            name="visitDuration"
            value={form.visitDuration}
            onChange={handleChange}
          />

          <Input
            label="Entry Fee"
            name="entryFee"
            value={form.entryFee}
            onChange={handleChange}
          />

          <div className="mb-4">
            <label className="text-sm text-text-muted">Priority</label>
            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="w-full mt-2 px-4 py-2 rounded-lg border border-border bg-input-bg text-text"
            >
              <option value="">Select priority</option>
              <option value="1">Must Visit</option>
              <option value="2">Recommended</option>
              <option value="3">Optional</option>
            </select>
          </div>
        </div>

        {/* DESCRIPTION */}
        <div className="mb-6">
          <label className="text-sm text-text-muted">Description</label>
          <textarea
            name="description"
            value={form.description || ''}
            onChange={handleChange}
            rows={4}
            className="w-full mt-2 px-4 py-2 rounded-lg border border-border bg-input-bg text-text"
          />
        </div>

        {/* 🔥 BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-1/2 block mx-auto py-3 rounded-lg text-white font-medium bg-primary hover:bg-primary-hover transition-all disabled:opacity-60"
        >
          {loading ? 'Updating...' : 'Update Place'}
        </button>
      </form>
    </div>
  );
};

const Input = ({ label, name, value, onChange }) => (
  <div className="mb-4">
    <label className="text-sm text-text-muted">{label}</label>
    <input
      name={name}
      value={value || ''}
      onChange={onChange}
      className="w-full mt-2 px-4 py-2 rounded-lg border border-border bg-input-bg text-text"
    />
  </div>
);

export default EditPlace;