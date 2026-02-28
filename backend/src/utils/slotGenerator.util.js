import moment from 'moment';
import Appointment from '../models/Appointment.model.js';
import Schedule from '../models/Schedule.model.js';

export const generateAvailableSlots = async (doctorId, chamberId, date) => {
  try {
    // Get all schedules for the doctor and chamber
    const dayOfWeek = moment(date).day();
    
    // Find schedule for this day
    const schedules = await Schedule.find({
      doctorId,
      chamberId,
      dayOfWeek,
      isActive: true,
      $or: [
        { validUntil: { $gte: date } },
        { validUntil: null }
      ]
    }).populate('chamberId');

    if (!schedules || schedules.length === 0) {
      return [];
    }

    // Get existing appointments for the date
    const startOfDay = moment(date).startOf('day').toDate();
    const endOfDay = moment(date).endOf('day').toDate();
    
    const existingAppointments = await Appointment.find({
      doctorId,
      chamberId,
      appointmentDate: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: {
        $in: ['pending', 'accepted', 'completed']
      }
    });

    const bookedSlots = existingAppointments.map(apt => ({
      start: apt.timeSlot.startTime,
      end: apt.timeSlot.endTime
    }));

    // Generate all possible slots
    const allSlots = [];
    
    schedules.forEach(schedule => {
      schedule.timeSlots.forEach(timeSlot => {
        const slotDuration = timeSlot.sessionDuration || 15; // minutes
        const start = moment(timeSlot.startTime, 'HH:mm');
        const end = moment(timeSlot.endTime, 'HH:mm');
        
        let current = moment(start);
        
        while (current.isBefore(end)) {
          const slotStart = current.format('HH:mm');
          const slotEnd = moment(current).add(slotDuration, 'minutes').format('HH:mm');
          
          // Check if slot is available
          const isBooked = bookedSlots.some(booked => {
            return (slotStart >= booked.start && slotStart < booked.end) ||
                   (slotEnd > booked.start && slotEnd <= booked.end) ||
                   (slotStart <= booked.start && slotEnd >= booked.end);
          });
          
          if (!isBooked && moment(slotEnd, 'HH:mm').isSameOrBefore(end)) {
            allSlots.push({
              startTime: slotStart,
              endTime: slotEnd,
              duration: slotDuration,
              available: true
            });
          }
          
          current.add(slotDuration, 'minutes');
        }
      });
    });

    // Sort by time
    allSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));
    
    return allSlots;
  } catch (error) {
    console.error('Error generating slots:', error);
    throw error;
  }
};

export const lockSlot = async (doctorId, chamberId, date, startTime, endTime, appointmentId = null) => {
  try {
    const appointmentDate = moment(date).startOf('day').toDate();
    
    // Check if slot is already booked
    const existing = await Appointment.findOne({
      doctorId,
      chamberId,
      appointmentDate,
      'timeSlot.startTime': startTime,
      'timeSlot.endTime': endTime,
      status: {
        $in: ['pending', 'accepted']
      },
      _id: { $ne: appointmentId }
    });
    
    return !existing;
  } catch (error) {
    console.error('Error locking slot:', error);
    return false;
  }
};
