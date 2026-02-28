import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import moment from 'moment';
import { uploadFileFromPath } from './cloudinary.util.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generatePrescriptionPDF = async (prescription, appointment, patient, doctor) => {
  try {
    const outputDir = path.join(__dirname, '../../uploads/prescriptions');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filename = `prescription-${prescription._id}.pdf`;
    const filepath = path.join(outputDir, filename);

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    // Header
    doc.fontSize(20).text('PRESCRIPTION', { align: 'center' });
    doc.moveDown();

    // Doctor Information
    doc.fontSize(14).text('Doctor Information:', { underline: true });
    doc.fontSize(12).text(`Name: ${doctor.name || 'N/A'}`);
    doc.text(`BMDC No: ${doctor.bmdcNo || 'N/A'}`);
    doc.text(`Specialization: ${doctor.specialization || 'N/A'}`);
    doc.moveDown();

    // Patient Information
    doc.fontSize(14).text('Patient Information:', { underline: true });
    doc.fontSize(12).text(`Name: ${patient.name}`);
    doc.text(`Age: ${patient.dateOfBirth ? moment().diff(moment(patient.dateOfBirth), 'years') : 'N/A'} years`);
    doc.text(`Gender: ${patient.gender || 'N/A'}`);
    doc.text(`Date: ${moment(appointment.appointmentDate).format('DD MMM YYYY')}`);
    doc.moveDown();

    // Vitals
    if (prescription.vitals) {
      doc.fontSize(14).text('Vitals:', { underline: true });
      doc.fontSize(12);
      if (prescription.vitals.bloodPressure) doc.text(`Blood Pressure: ${prescription.vitals.bloodPressure}`);
      if (prescription.vitals.temperature) doc.text(`Temperature: ${prescription.vitals.temperature}`);
      if (prescription.vitals.heartRate) doc.text(`Heart Rate: ${prescription.vitals.heartRate}`);
      if (prescription.vitals.weight) doc.text(`Weight: ${prescription.vitals.weight}`);
      if (prescription.vitals.height) doc.text(`Height: ${prescription.vitals.height}`);
      if (prescription.vitals.bmi) doc.text(`BMI: ${prescription.vitals.bmi}`);
      if (prescription.vitals.spo2) doc.text(`SpO2: ${prescription.vitals.spo2}`);
      doc.moveDown();
    }

    // Diagnosis
    if (prescription.diagnosis && prescription.diagnosis.length > 0) {
      doc.fontSize(14).text('Diagnosis:', { underline: true });
      doc.fontSize(12);
      prescription.diagnosis.forEach(diag => {
        doc.text(`${diag.icdCode || ''} - ${diag.description}`);
      });
      doc.moveDown();
    }

    // Medicines
    if (prescription.medicines && prescription.medicines.length > 0) {
      doc.fontSize(14).text('Medicines:', { underline: true });
      doc.fontSize(12);
      
      const tableTop = doc.y;
      let yPos = tableTop;
      
      prescription.medicines.forEach((med, index) => {
        doc.fontSize(11);
        doc.text(`${index + 1}. ${med.name}`, 50, yPos);
        yPos += 15;
        doc.text(`   Dosage: ${med.dosage || 'N/A'}`, 60, yPos);
        yPos += 15;
        doc.text(`   Frequency: ${med.frequency || 'N/A'}`, 60, yPos);
        yPos += 15;
        doc.text(`   Duration: ${med.duration || 'N/A'}`, 60, yPos);
        yPos += 15;
        if (med.instructions) {
          doc.text(`   Instructions: ${med.instructions}`, 60, yPos);
          yPos += 15;
        }
        yPos += 5;
      });
      
      doc.y = yPos;
      doc.moveDown();
    }

    // Tests
    if (prescription.tests && prescription.tests.length > 0) {
      doc.fontSize(14).text('Tests Recommended:', { underline: true });
      doc.fontSize(12);
      prescription.tests.forEach(test => {
        doc.text(`- ${test.testName}`);
        if (test.instructions) {
          doc.text(`  Instructions: ${test.instructions}`, { indent: 10 });
        }
      });
      doc.moveDown();
    }

    // Advice
    if (prescription.advice) {
      doc.fontSize(14).text('Advice:', { underline: true });
      doc.fontSize(12).text(prescription.advice);
      doc.moveDown();
    }

    // Follow-up
    if (prescription.followUpDate) {
      doc.fontSize(14).text('Follow-up Date:', { underline: true });
      doc.fontSize(12).text(moment(prescription.followUpDate).format('DD MMM YYYY'));
      doc.moveDown();
    }

    // Footer
    doc.moveDown(2);
    doc.fontSize(10).text(`Generated on: ${moment().format('DD MMM YYYY, hh:mm A')}`, { align: 'center' });
    doc.text('This is a digital prescription', { align: 'center' });

    doc.end();

    return new Promise(async (resolve, reject) => {
      stream.on('finish', async () => {
        try {
          // Upload to Cloudinary
          const cloudinaryResult = await uploadFileFromPath(filepath, 'prescriptions', 'raw');
          
          // Delete local file after upload
          if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
          }
          
          resolve({
            filename,
            filepath: cloudinaryResult.secure_url,
            cloudinaryPublicId: cloudinaryResult.public_id
          });
        } catch (error) {
          console.error('Error uploading to Cloudinary:', error);
          // Return local path as fallback
          resolve({
            filename,
            filepath: `/uploads/prescriptions/${filename}`
          });
        }
      });
      stream.on('error', reject);
    });
  } catch (error) {
    console.error('Error generating prescription PDF:', error);
    throw error;
  }
};

export const generateSerialListPDF = async (doctorId, date, appointments) => {
  try {
    const outputDir = path.join(__dirname, '../../uploads/serial-lists');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filename = `serial-list-${doctorId}-${moment(date).format('YYYY-MM-DD')}.pdf`;
    const filepath = path.join(outputDir, filename);

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    // Header
    doc.fontSize(20).text('APPOINTMENT SERIAL LIST', { align: 'center' });
    doc.fontSize(14).text(`Date: ${moment(date).format('DD MMM YYYY')}`, { align: 'center' });
    doc.moveDown();

    // Table Header
    const tableTop = doc.y;
    let yPos = tableTop;
    
    doc.fontSize(12).font('Helvetica-Bold');
    doc.text('Serial', 50, yPos);
    doc.text('Patient Name', 100, yPos);
    doc.text('Gender', 250, yPos);
    doc.text('Contact', 310, yPos);
    doc.text('Appointment Time', 400, yPos);
    
    yPos += 20;
    doc.moveTo(50, yPos).lineTo(550, yPos).stroke();
    yPos += 10;

    // Sort appointments by time
    const sortedAppointments = [...appointments].sort((a, b) => {
      return a.timeSlot.startTime.localeCompare(b.timeSlot.startTime);
    });

    // Table Rows
    doc.font('Helvetica').fontSize(11);
    sortedAppointments.forEach((apt, index) => {
      doc.text(`${index + 1}`, 50, yPos);
      doc.text(apt.patientId?.name || 'N/A', 100, yPos, { width: 140 });
      doc.text(apt.patientId?.gender || 'N/A', 250, yPos, { width: 50 });
      doc.text(apt.patientId?.phone || 'N/A', 310, yPos, { width: 80 });
      doc.text(`${apt.timeSlot.startTime} - ${apt.timeSlot.endTime}`, 400, yPos, { width: 140 });
      
      yPos += 20;
    });

    // Footer
    doc.moveDown(2);
    doc.fontSize(10).text(`Total Appointments: ${sortedAppointments.length}`, { align: 'center' });
    doc.text(`Generated on: ${moment().format('DD MMM YYYY, hh:mm A')}`, { align: 'center' });

    doc.end();

    return new Promise(async (resolve, reject) => {
      stream.on('finish', async () => {
        try {
          // Upload to Cloudinary
          const cloudinaryResult = await uploadFileFromPath(filepath, 'serial-lists', 'raw');
          
          // Delete local file after upload
          if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
          }
          
          resolve({
            filename,
            filepath: cloudinaryResult.secure_url,
            cloudinaryPublicId: cloudinaryResult.public_id
          });
        } catch (error) {
          console.error('Error uploading to Cloudinary:', error);
          // Return local path as fallback
          resolve({
            filename,
            filepath: `/uploads/serial-lists/${filename}`
          });
        }
      });
      stream.on('error', reject);
    });
  } catch (error) {
    console.error('Error generating serial list PDF:', error);
    throw error;
  }
};
