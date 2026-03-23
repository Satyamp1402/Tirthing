// import { useEffect, useRef } from "react";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";

// const MapView = ({ latitude, longitude, name = "Location", height = "300px" }) => {
//   const mapRef = useRef(null);

//   useEffect(() => {
//     if (!latitude || !longitude) return;

//     const map = L.map(mapRef.current).setView([latitude, longitude], 13);

//     L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//       attribution: "&copy; OpenStreetMap"
//     }).addTo(map);

//     L.marker([latitude, longitude])
//       .addTo(map)
//       .bindPopup(name)
//       .openPopup();

//     return () => map.remove();
//   }, [latitude, longitude, name]);

//   return <div ref={mapRef} style={{ height, width: "100%" }} className="rounded-xl" />;
// };

// export default MapView;


import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ✅ Marker fix
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const MapView = ({ latitude, longitude, name = "Location", height = "300px" }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (!latitude || !longitude) return;

    // ✅ Prevent double initialization
    if (mapInstance.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
      boxZoom: false,
      keyboard: false
    }).setView([latitude, longitude], 10);

    mapInstance.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    L.marker([latitude, longitude])
      .addTo(map)
      .bindPopup(name)
      .openPopup();

  }, [latitude, longitude, name]);

  return (
    <div
      ref={mapRef}
      style={{ height, width: "100%" }}
      className="rounded-xl overflow-hidden"
    />
  );
};

export default MapView;

