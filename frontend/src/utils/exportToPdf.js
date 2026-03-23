// import { jsPDF } from "jspdf";
// import autoTable from "jspdf-autotable"; // Import the function directly

// export const exportToPDF = (itinerary) => {
//   const doc = new jsPDF();
//   const pageWidth = doc.internal.pageSize.getWidth();

//   // 1. Header Section
//   doc.setFillColor(243, 244, 246); // Light gray
//   doc.rect(0, 0, pageWidth, 40, 'F');
  
//   doc.setFontSize(22);
//   doc.setTextColor(31, 41, 55); 
//   doc.text(`${itinerary.destination} Plan`, 14, 20);

//   doc.setFontSize(10);
//   doc.setTextColor(107, 114, 128);
//   doc.text(
//     `${itinerary.days} Days | ${itinerary.groupSize} Travelers | Total: Rs. ${itinerary.budget}`, 
//     14, 30
//   );

//   let currentY = 50; // Starting position after header

//   // 2. Loop through Days
//   itinerary.plan.forEach((dayPlan) => {
//     // Check if we need a new page for the next Day Header
//     if (currentY > 260) {
//       doc.addPage();
//       currentY = 20;
//     }

//     // Day Heading
//     doc.setFontSize(16);
//     doc.setTextColor(37, 99, 235); // Blue
//     doc.text(`Day ${dayPlan.day}`, 14, currentY);
//     currentY += 5;

//     // Prepare Table Data
//     const tableRows = dayPlan.places.map(place => [
//       place.name,
//       `~${place.visitDuration}h`,
//       place.entryFee > 0 ? `Rs. ${place.entryFee}` : 'Free',
//       place.description
//     ]);

//     // 🔥 FIX: Call autoTable as a function, passing 'doc' as the first argument
//     autoTable(doc, {
//       startY: currentY,
//       head: [['Place', 'Duration', 'Fee', 'Description']],
//       body: tableRows,
//       theme: 'striped',
//       headStyles: { fillColor: [37, 99, 235], fontSize: 10 },
//       styles: { fontSize: 9, cellPadding: 3 },
//       columnStyles: {
//         0: { cellWidth: 35, fontStyle: 'bold' },
//         1: { cellWidth: 20 },
//         2: { cellWidth: 20 },
//         3: { cellWidth: 'auto' }
//       },
//       margin: { left: 14, right: 14 },
//       didDrawPage: (data) => {
//         // This ensures the next element knows where the table ended
//         currentY = data.cursor.y;
//       }
//     });

//     // Update currentY to the end of the table + a little gap
//     currentY = doc.lastAutoTable.finalY + 15;
//   });

//   // 3. Footer (Page Numbers)
//   const pageCount = doc.internal.getNumberOfPages();
//   for (let i = 1; i <= pageCount; i++) {
//     doc.setPage(i);
//     doc.setFontSize(8);
//     doc.setTextColor(150);
//     doc.text(
//       `Page ${i} of ${pageCount} - Created with WealthNest`, 
//       pageWidth / 2, 285, 
//       { align: 'center' }
//     );
//   }

//   // 4. Save
//   doc.save(`${itinerary.destination}_itinerary.pdf`);
// };

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const getBase64ImageFromURL = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.setAttribute("crossOrigin", "anonymous");
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL("image/jpeg");
      resolve(dataURL);
    };
    img.onerror = (error) => reject(error);
    img.src = url;
  });
};

export const exportToPDF = async (itinerary) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // --- Theme Colors ---
  const colors = {
    bg: [255, 244, 214],      // Your Saffron Cream
    primary: [251, 146, 60],  // Saffron 400
    text: [50, 38, 30],       // Espresso Text
    border: [180, 120, 40],   // Warm Border
  };

  // Helper function to paint the background
  const addPageBackground = () => {
    doc.setFillColor(...colors.bg);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
  };

  // 1. Initial Page Setup
  addPageBackground();

  // Header 
  doc.setFillColor(255, 244, 214); 
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  doc.setFontSize(26);
  doc.setTextColor(...colors.text);
  doc.text(`${itinerary.destination} Journey`, 14, 22);

  doc.setFontSize(11);
  doc.setTextColor(50, 38, 30, 0.7);
  doc.text(
    `${itinerary.days} Days • ${itinerary.groupSize} Travelers • Total Budget: Rs. ${itinerary.budget}`, 
    14, 32
  );

  let currentY = 55;

  // 2. Loop through Days
  for (const dayPlan of itinerary.plan) {
    // Check for page break
    if (currentY > 240) { 
      doc.addPage(); 
      addPageBackground(); // Paint new page cream
      currentY = 20; 
    }

    // Day Heading
    doc.setFontSize(20);
    doc.setTextColor(...colors.primary);
    doc.text(`Day ${dayPlan.day}`, 14, currentY);
    currentY += 10;

    for (const place of dayPlan.places) {
      // Place Image
      if (place.image) {
        try {
          const imgData = await getBase64ImageFromURL(place.image);
          
          // White rounded-like border for image
          doc.setFillColor(255, 255, 255);
          doc.rect(13, currentY - 1, 42, 32, 'F');
          
          doc.addImage(imgData, "JPEG", 14, currentY, 40, 30);

          doc.setFontSize(14);
          doc.setTextColor(...colors.text);
          doc.text(place.name, 60, currentY + 5);
          
          doc.setFontSize(10);
          doc.setTextColor(...colors.primary);
          doc.text(`~${place.visitDuration}h | ${place.entryFee > 0 ? 'Rs.' + place.entryFee : 'Free Entry'}`, 60, currentY + 12);

          doc.setTextColor(80, 70, 60);
          doc.setFontSize(9);
          const splitDescription = doc.splitTextToSize(place.description, 130);
          doc.text(splitDescription, 60, currentY + 18);
          
          currentY += 40;
        } catch (e) {
          doc.setTextColor(...colors.text);
          doc.text(place.name, 14, currentY);
          currentY += 10;
        }
      } else {
        doc.setFontSize(14);
        doc.setTextColor(...colors.text);
        doc.text(place.name, 14, currentY);
        currentY += 12;
      }

      if (currentY > 270) { 
        doc.addPage(); 
        addPageBackground(); 
        currentY = 20; 
      }
    }
    currentY += 5; 
  }

  // 3. Final Footer Pass
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(...colors.border);
    doc.text(`WealthNest • ${itinerary.destination} • Page ${i} of ${pageCount}`, pageWidth / 2, 288, { align: 'center' });
  }

  doc.save(`${itinerary.destination}_Itinerary.pdf`);
};