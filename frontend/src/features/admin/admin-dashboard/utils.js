import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import { formatDateString } from '../../../shared/utils/dateFormatter';
export { formatDateString };

export function getInitials(name) {
  if (!name) return 'EX';
  const clean = name.trim();
  if (clean.length === 0) return 'EX';
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  if (words[0].length >= 2) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return words[0].toUpperCase();
}

  export const getLocalTodayString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  export const handleExportPDF = async (tableId, title, showAlert) => {
    try {
      const element = document.getElementById(tableId);
      if (!element) {
        await showAlert("Table not found for export.");
        return;
      }
      const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#18181b' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'pt', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${title.replace(/\s+/g, '_')}_${getLocalTodayString()}.pdf`);
    } catch (err) {
      await showAlert("Failed to export PDF: " + err.message);
    }
  };

  export const handleExportImage = async (tableId, title, showAlert) => {
    try {
      const element = document.getElementById(tableId);
      if (!element) {
        await showAlert("Table not found for export.");
        return;
      }
      const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#18181b' });
      const link = document.createElement('a');
      link.download = `${title.replace(/\s+/g, '_')}_${getLocalTodayString()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      await showAlert("Failed to export Image: " + err.message);
    }
  };

  export const downloadPDFReceipt = async (booking, usersDb, settingsForm, showAlert) => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Find student details from usersDb
      const student = usersDb.find(u => u.id === booking.userId);
      const clientName = booking.userName || (student ? student.name : 'Student');
      const clientEmail = student ? student.email : 'N/A';
      const clientPhone = student ? student.phone : 'N/A';

      const service = booking.service === 'counselling' ? 'Psychological Counselling' : 'Career Mentoring';
      const mode = booking.mode === 'ONLINE' ? 'Video Call' : booking.mode === 'DOOR_STEP' ? 'Home Visit' : 'At Center';

      // GST and Amount Math
      const amountPaid = typeof booking.amountPaid === 'number' ? booking.amountPaid : 1200;
      const appliedDiscount = booking.appliedDiscount || 0;
      const totalBeforeDiscount = amountPaid + appliedDiscount;
      const gstEnabled = settingsForm.gstEnabled === true;
      const gstPercent = gstEnabled ? (Number(settingsForm.gstPercent) || 0) : 0;
      
      let baseFeeVal = totalBeforeDiscount;
      let gstAmountVal = 0;
      if (gstEnabled && gstPercent > 0) {
        baseFeeVal = Math.round(totalBeforeDiscount / (1 + gstPercent / 100));
        gstAmountVal = totalBeforeDiscount - baseFeeVal;
      }

      // Draw PDF Receipt
      // Top Banner Accent Bar (Teal brand color #06b6d4)
      doc.setFillColor(6, 182, 212);
      doc.rect(0, 0, 210, 8, 'F');

      // Header Brand Title
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(9, 9, 11); // zinc-900
      doc.text('BEHOLD.', 20, 25);
      
      doc.setFontSize(9);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(113, 113, 122); // zinc-500
      doc.text('Premium Career Guidance & Mental Health Platform', 20, 30);

      // Status Badge
      doc.setFillColor(240, 253, 250); // light teal background
      doc.roundedRect(142, 18, 48, 10, 2, 2, 'F');
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(13, 148, 136); // Teal text
      doc.text('CONFIRMED & PAID', 147, 24.5);

      // Divider Line
      doc.setDrawColor(228, 228, 231); // zinc-200
      doc.line(20, 36, 190, 36);

      // Client & Billing Info Grid
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(39, 39, 42); // zinc-800
      doc.text('CLIENT DETAILS', 20, 46);
      doc.text('RECEIPT METADATA', 120, 46);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(82, 82, 91); // zinc-600
      
      // Client info
      doc.text(`Name: ${clientName}`, 20, 52);
      doc.text(`Email: ${clientEmail}`, 20, 58);
      doc.text(`Phone: ${clientPhone}`, 20, 64);

      // Receipt Metadata info
      const displayId = booking.id ? booking.id.toString().substring(Math.max(0, booking.id.toString().length - 6)) : 'N/A';
      doc.text(`Receipt ID: REC-${displayId}`, 120, 52);
      doc.text(`Booking ID: SB-${booking.id || 'N/A'}`, 120, 58);
      doc.text(`Date of Issue: ${formatDateString(new Date())}`, 120, 64);

      // Divider Line
      doc.line(20, 70, 190, 70);

      // Booking Specifics
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(39, 39, 42);
      doc.text('SESSION DETAILS', 20, 80);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(82, 82, 91);
      doc.text(`Service Type: ${service}`, 20, 86);
      doc.text(`Advisor Assigned: ${booking.advisorName || 'Advisor'} (${booking.advisorRole || 'Consultant'})`, 20, 92);
      doc.text(`Session Schedule: ${formatDateString(booking.date)} at ${booking.time}`, 20, 98);
      doc.text(`Session Mode: ${mode}`, 20, 104);

      // Divider Line
      doc.line(20, 110, 190, 110);

      // Pricing Breakdown Table
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(39, 39, 42);
      doc.text('CHARGES BREAKDOWN', 20, 120);

      // Table Header Background
      doc.setFillColor(244, 244, 245); // zinc-100
      doc.rect(20, 124, 170, 8, 'F');
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(63, 63, 70); // zinc-700
      doc.text('Description', 24, 129.5);
      doc.text('Amount', 160, 129.5);

      // Table Rows
      let tableY = 138;
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(82, 82, 91);

      // 1. Base fee
      doc.text(`${service} Session Booking Fee`, 24, tableY);
      doc.text(`Rs. ${baseFeeVal.toFixed(2)}`, 160, tableY);
      tableY += 8;

      // 2. GST (if enabled)
      if (gstAmountVal > 0) {
        doc.text(`GST (${gstPercent}%)`, 24, tableY);
        doc.text(`Rs. ${gstAmountVal.toFixed(2)}`, 160, tableY);
        tableY += 8;
      }

      // 3. Discount (if applied)
      if (appliedDiscount > 0) {
        doc.setTextColor(0, 229, 255); // neon blue
        doc.text(`Promo Discount Code`, 24, tableY);
        doc.text(`-Rs. ${appliedDiscount.toFixed(2)}`, 160, tableY);
        tableY += 8;
        doc.setTextColor(82, 82, 91); // reset to zinc-600
      }

      // Border line for total
      doc.setDrawColor(228, 228, 231);
      doc.line(20, tableY - 4, 190, tableY - 4);

      // Total Row
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(9, 9, 11); // zinc-900
      doc.text('Net Total Paid', 24, tableY + 2);
      doc.setTextColor(13, 148, 136); // Teal color for total price
      doc.setFontSize(10.5);
      doc.text(`INR ${amountPaid.toFixed(2)}`, 160, tableY + 2);
      
      tableY += 16;

      // Google Meet Session Link if Online
      if (booking.meetLink && booking.meetLink !== 'LOCKED') {
        doc.setFillColor(240, 253, 250); // Light teal bg
        doc.roundedRect(20, tableY, 170, 18, 2, 2, 'F');
        
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(13, 148, 136);
        doc.text('Google Meet Session Link (Online Video Call):', 25, tableY + 6);
        
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(6, 182, 212); // blue-link
        doc.text(booking.meetLink, 25, tableY + 12);
        
        tableY += 28;
      } else {
        tableY += 10;
      }

      // Footer Notes
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(161, 161, 170); // zinc-400
      doc.text('This is a secure computer-generated booking receipt. No physical signature is required.', 20, tableY);
      doc.text('For rescheduling queries, cancellations, or support, please reply to your coordinator on WhatsApp.', 20, tableY + 5);

      // Save document
      doc.save(`Behold_Session_Receipt_${booking.id}.pdf`);
    } catch (e) {
      console.error(e);
      await showAlert("Failed to generate PDF receipt: " + e.message);
    }
  };

  export const downloadDiagnosticPDF = async (booking, showAlert) => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Colors
      const brandDark = '#0f172a'; // slate-900
      const brandTeal = '#0d9488'; // teal-600
      const textGray = '#4b5563'; // gray-600

      // Top Accent Line
      doc.setFillColor(13, 148, 136); // Teal
      doc.rect(0, 0, 210, 10, 'F');

      // Clinical Header Title
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(15, 23, 42); // Slate-900
      doc.text('BEHOLD.', 20, 25);

      doc.setFontSize(9);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text('A Personal Development and Mentoring Ecosystem', 20, 30);

      // Document Type Tag
      doc.setFillColor(240, 253, 250); // Light teal bg
      doc.roundedRect(138, 18, 52, 11, 2, 2, 'F');
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(13, 148, 136); // Teal text
      doc.text('CLINICAL REPORT', 144, 25);

      // Divider
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.line(20, 36, 190, 36);

      // 1. Counsellor (Practitioner) Details - Left side
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text('PRACTITIONER DETAILS', 20, 45);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105); // slate-600

      const cName = booking.counsellorName || (booking.counsellor && booking.counsellor.name) || 'Consultant Psychologist';
      const cTitle = (booking.counsellor && booking.counsellor.title) || 'Consultant Psychologist';
      const cEdu = (booking.counsellor && booking.counsellor.education) || 'Professional Degree';
      const cPhone = (booking.counsellor && booking.counsellor.phone) || 'N/A';
      const cEmail = (booking.counsellor && booking.counsellor.email) || 'N/A';

      doc.text(`Name: ${cName}`, 20, 51);
      doc.text(`Title: ${cTitle}`, 20, 56);
      doc.text(`Education: ${cEdu}`, 20, 61);
      doc.text(`Contact: ${cPhone} | ${cEmail}`, 20, 66);

      // 2. Student (Client) Details - Right side
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text('STUDENT DETAILS', 115, 45);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);

      const sName = booking.studentName || (booking.student && booking.student.name) || 'N/A';
      const sSchool = (booking.student && booking.student.schoolName) || 'N/A';
      const sGrade = (booking.student && booking.student.grade) || 'N/A';
      const sGName = (booking.student && booking.student.guardianName) || 'N/A';
      const sGPhone = (booking.student && booking.student.guardianPhone) || 'N/A';

      doc.text(`Name: ${sName}`, 115, 51);
      doc.text(`School: ${sSchool}`, 115, 56);
      doc.text(`Grade: ${sGrade}`, 115, 61);
      doc.text(`Guardian: ${sGName} (${sGPhone})`, 115, 66);

      // Divider
      doc.line(20, 72, 190, 72);

      // Metadata Info Box
      doc.setFillColor(248, 250, 252); // slate-50 bg
      doc.rect(20, 77, 170, 15, 'F');
      doc.setDrawColor(241, 245, 249);
      doc.rect(20, 77, 170, 15, 'S');

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text('REPORT ID:', 24, 82);
      doc.text('SESSION SCHEDULE:', 80, 82);
      doc.text('DATE GENERATED:', 145, 82);

      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      const displayId = booking.id ? booking.id.toString().substring(Math.max(0, booking.id.toString().length - 6)) : 'N/A';
      doc.text(`CL-REP-${displayId}`, 24, 88);
      doc.text(`${formatDateString(booking.date)} at ${booking.time}`, 80, 88);
      doc.text(`${formatDateString(new Date())}`, 145, 88);

      // Clinical Notes / Diagnostics Header
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(13, 148, 136); // Teal Rx symbol
      doc.text('Rx', 20, 103);

      doc.setFontSize(11);
      doc.text('CLINICAL ASSESSMENT & DIAGNOSTICS', 27, 103);

      doc.setDrawColor(13, 148, 136);
      doc.setLineWidth(0.3);
      doc.line(20, 105, 190, 105);

      // Section Content Auto-Pagebreak System
      let y = 112;
      const bottomLimit = 265;

      const printTextSection = (titleText, bodyText, gapBeforeTitle = 10) => {
        // Check if title fits on current page
        if (y + gapBeforeTitle > bottomLimit) {
          doc.addPage();
          doc.setFillColor(13, 148, 136);
          doc.rect(0, 0, 210, 8, 'F');
          
          doc.setFont('Helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(148, 163, 184);
          doc.text(`Clinical Report ID: CL-REP-${displayId} | Continuation Page`, 20, 15);
          doc.line(20, 17, 190, 17);
          
          y = 25;
        } else {
          y += gapBeforeTitle;
        }
        
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(15, 23, 42);
        doc.text(titleText, 20, y);
        y += 6;
        
        doc.setFont('Helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
        doc.setFontSize(8.5);
        
        const lines = doc.splitTextToSize(bodyText, 170);
        for (let i = 0; i < lines.length; i++) {
          if (y > bottomLimit) {
            doc.addPage();
            doc.setFillColor(13, 148, 136);
            doc.rect(0, 0, 210, 8, 'F');
            
            doc.setFont('Helvetica', 'normal');
            doc.setFontSize(7.5);
            doc.setTextColor(148, 163, 184);
            doc.text(`Clinical Report ID: CL-REP-${displayId} | Continuation Page`, 20, 15);
            doc.line(20, 17, 190, 17);
            
            y = 25;
          }
          // Restore font style for text lines after page break
          doc.setFont('Helvetica', 'normal');
          doc.setTextColor(51, 65, 85);
          doc.setFontSize(8.5);

          doc.text(lines[i], 20, y);
          y += 4.5;
        }
      };

      const clinicalNotes = booking.notes || 'No clinical/diagnostic notes recorded for this session.';
      printTextSection('Clinical Assessment & Observation Notes:', clinicalNotes, 8);

      const feedbackText = booking.feedback || 'No student-facing feedback or recommendations recorded.';
      printTextSection('Recommendations & Feedback:', feedbackText, 10);

      const hasNextSession = booking.nextSession && 
                             booking.nextSession.trim() !== '' && 
                             booking.nextSession.trim().toLowerCase() !== 'n/a' && 
                             booking.nextSession.trim().toLowerCase() !== 'none' && 
                             booking.nextSession.trim().toLowerCase() !== 'no' && 
                             booking.nextSession.trim().toLowerCase() !== 'null';

      if (hasNextSession) {
        if (y + 12 > bottomLimit) {
          doc.addPage();
          doc.setFillColor(13, 148, 136);
          doc.rect(0, 0, 210, 8, 'F');
          doc.setFont('Helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(148, 163, 184);
          doc.text(`Clinical Report ID: CL-REP-${displayId} | Continuation Page`, 20, 15);
          doc.line(20, 17, 190, 17);
          y = 25;
        } else {
          y += 10;
        }
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(15, 23, 42);
        doc.text('Next Session Approximate Time:', 20, y);
        y += 5.5;

        doc.setFont('Helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
        doc.setFontSize(8.5);
        doc.text(booking.nextSession.trim(), 20, y);
        y += 5;
      }

      let sigY = y + 18;
      if (sigY > 250) {
        doc.addPage();
        doc.setFillColor(13, 148, 136);
        doc.rect(0, 0, 210, 8, 'F');
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.text(`Clinical Report ID: CL-REP-${displayId} | Continuation Page`, 20, 15);
        doc.line(20, 17, 190, 17);
        sigY = 35;
      }

      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.3);
      doc.line(130, sigY, 190, sigY);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text('Authorized Signature', 142, sigY + 5);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`${cName}, ${cTitle}`, 130, sigY + 9, { maxWidth: 60 });

      doc.setFontSize(7.5);
      doc.text('This is a confidential medical-styled diagnostic document issued by the consultant psychologist.', 20, sigY + 18);
      doc.text('Please secure this document. For inquiries, reach out to contact@beholdaspire.com.', 20, sigY + 22);

      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.text(`Page ${i} of ${totalPages}`, 105, 288, { align: 'center' });
      }

      doc.save(`Clinical_Report_${sName.replace(/\s+/g, '_')}_${displayId}.pdf`);
    } catch (e) {
      console.error(e);
      await showAlert("Failed to generate Clinical Diagnostic PDF: " + e.message);
    }
  };

