import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true,
    unique: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  vitals: {
    bloodPressure: String,
    temperature: String,
    heartRate: String,
    weight: String,
    height: String,
    bmi: String,
    spo2: String,
    notes: String
  },
  diagnosis: [{
    icdCode: String,
    description: String
  }],
  medicines: [{
    name: String,
    dosage: String,
    frequency: String,
    duration: String,
    instructions: String,
    beforeMeal: Boolean
  }],
  tests: [{
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test'
    },
    testName: String,
    instructions: String
  }],
  advice: {
    type: String
  },
  followUpDate: {
    type: Date
  },
  pdfPath: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Prescription = mongoose.model('Prescription', prescriptionSchema);

export default Prescription;

