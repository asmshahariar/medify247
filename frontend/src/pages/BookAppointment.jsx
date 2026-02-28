import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import Navbar from '../components/Navbar';
import './BookAppointment.css';

const BookAppointment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1); // 1: Select Doctor, 2: Select Chamber, 3: Select Date & Time, 4: Confirm
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Doctor selection
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctorDetails, setDoctorDetails] = useState(null);
  const [loadingDoctor, setLoadingDoctor] = useState(false);

  // Chamber selection
  const [selectedChamber, setSelectedChamber] = useState(null);
  const [availableChambers, setAvailableChambers] = useState([]);

  // Date and time selection (for slot-based)
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Serial-based booking
  const [bookingType, setBookingType] = useState(null); // 'slots' or 'serials'
  const [serialSettings, setSerialSettings] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedSerialDate, setSelectedSerialDate] = useState('');
  const [availableSerials, setAvailableSerials] = useState([]);
  const [selectedSerial, setSelectedSerial] = useState(null);
  const [loadingSerials, setLoadingSerials] = useState(false);
  const [dateAvailability, setDateAvailability] = useState({}); // { date: { availableCount, totalCount, adminNote } }
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date()); // Start of current week
  const [enabledDates, setEnabledDates] = useState({}); // { dateStr: { adminNote, totalSerials } }

  // Booking form
  const [bookingData, setBookingData] = useState({
    consultationType: 'new',
    reason: ''
  });

  const handleDoctorSelect = async (doctorId) => {
    if (!doctorId) return;
    
    setLoadingDoctor(true);
    setError('');
    setSelectedDoctor(doctorId);

    try {
      const id = typeof doctorId === 'string' ? doctorId : (doctorId._id || doctorId.id || doctorId);
      
      // First check if doctor uses serial-based booking
      try {
        const serialResponse = await api.get(`/patient/doctors/${id}/serial-settings`);
        if (serialResponse.data.success) {
          setSerialSettings(serialResponse.data.data);
          setBookingType('serials');
          setStep(2); // Skip chamber selection for serial-based
          return;
        }
      } catch (serialErr) {
        // Doctor doesn't use serials, check for slot-based
        console.log('No serial settings found, checking for slot-based booking');
      }

      // Load doctor details for slot-based booking
      const response = await api.get(`/shared/doctors/${id}`);
      if (response.data.success) {
        const doctor = response.data.data.doctor || response.data.data;
        setDoctorDetails(doctor);
        setAvailableChambers(doctor.chambers || []);
        setBookingType('slots');
        
        if (doctor.chambers && doctor.chambers.length === 1) {
          // Auto-select if only one chamber
          setSelectedChamber(doctor.chambers[0]);
          setStep(3);
        } else if (doctor.chambers && doctor.chambers.length > 0) {
          setStep(2);
        } else {
          setError('No active chambers found for this doctor');
        }
      } else {
        setError('Failed to load doctor details');
      }
    } catch (err) {
      console.error('Error fetching doctor:', err);
      setError(err.response?.data?.message || 'Failed to load doctor details');
    } finally {
      setLoadingDoctor(false);
    }
  };

  // Check if doctorId is passed from navigation
  useEffect(() => {
    const doctorId = location.state?.doctorId;
    if (doctorId) {
      handleDoctorSelect(doctorId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const handleChamberSelect = (chamber) => {
    setSelectedChamber(chamber);
    setSelectedDate('');
    setAvailableSlots([]);
    setSelectedSlot(null);
    setStep(3);
  };

  const handleDateSelect = async (date) => {
    if (!selectedChamber || !selectedDoctor) return;
    
    setSelectedDate(date);
    setSelectedSlot(null);
    setLoadingSlots(true);
    setError('');

    try {
      const doctorId = typeof selectedDoctor === 'string' ? selectedDoctor : (selectedDoctor._id || selectedDoctor.id || selectedDoctor);
      const chamberId = selectedChamber.chamberId || selectedChamber._id;
      
      console.log('Fetching slots for:', { doctorId, chamberId, date });
      const response = await api.get(`/patient/doctors/${doctorId}/slots?chamberId=${chamberId}&date=${date}`);
      console.log('Slots response:', response.data);
      
      if (response.data.success) {
        setAvailableSlots(response.data.data.slots || []);
        if (!response.data.data.slots || response.data.data.slots.length === 0) {
          setError('No available slots for this date. Please try another date.');
        }
      } else {
        setError(response.data.message || 'Failed to load available slots');
      }
    } catch (err) {
      console.error('Error fetching slots:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to load available slots');
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setStep(4);
  };

  // Generate 1 week of dates
  useEffect(() => {
    if (bookingType === 'serials' && serialSettings && selectedDoctor) {
      generateWeekDates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingType, serialSettings, selectedDoctor, currentWeekStart]);

  // Fetch enabled dates after availableDates is set
  useEffect(() => {
    if (bookingType === 'serials' && serialSettings && selectedDoctor && availableDates.length > 0) {
      fetchEnabledDatesForWeek();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableDates]);

  // Helper function to format date as YYYY-MM-DD using UTC to avoid timezone shifts
  const formatDateAsUTC = (date) => {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper function to create a Date object in UTC for a specific date string (YYYY-MM-DD)
  const createUTCDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
  };

  // Helper function to get date string from a Date object, ensuring it matches what was stored
  const getDateString = (date) => {
    // If date is already a string, return it
    if (typeof date === 'string') return date;
    // Otherwise, format using UTC to match database storage
    return formatDateAsUTC(date);
  };

  const generateWeekDates = () => {
    // Get the current week start date
    const currentDate = new Date(currentWeekStart);
    // Use UTC methods to get date components to avoid timezone shifts
    const currentYear = currentDate.getUTCFullYear();
    const currentMonth = currentDate.getUTCMonth();
    const currentDay = currentDate.getUTCDate();
    
    // Create a temporary date in UTC to get the day of week
    const tempDate = new Date(Date.UTC(currentYear, currentMonth, currentDay));
    const day = tempDate.getUTCDay(); // 0 = Sunday
    
    // Calculate week start date (Sunday) in UTC
    const weekStartDay = currentDay - day;
    const weekStartDate = new Date(Date.UTC(currentYear, currentMonth, weekStartDay));
    
    // Create dates array using UTC to avoid timezone shifts
    const dates = [];
    for (let i = 0; i < 7; i++) {
      // Create date in UTC
      const date = new Date(Date.UTC(currentYear, currentMonth, weekStartDay + i));
      dates.push(date);
    }
    
    setAvailableDates(dates);
    
    // Reset selected date if it's not in the current week
    if (selectedSerialDate) {
      const selectedDateStr = selectedSerialDate; // Already a string
      const isInWeek = dates.some(d => formatDateAsUTC(d) === selectedDateStr);
      if (!isInWeek) {
        setSelectedSerialDate('');
        setSelectedSerial(null);
      }
    }
  };

  const fetchEnabledDatesForWeek = async () => {
    if (!selectedDoctor || !serialSettings) return;
    
    const doctorId = typeof selectedDoctor === 'string' ? selectedDoctor : (selectedDoctor._id || selectedDoctor.id || selectedDoctor);
    
    // Get week dates from availableDates (already generated)
    // We'll use the dates from availableDates to ensure consistency
    const availability = {};
    const enabledDatesMap = {};
    
    // Check each date in the week using availableDates
    for (let i = 0; i < availableDates.length; i++) {
      const date = availableDates[i];
      // Format date using UTC to avoid timezone shifts
      const dateStr = formatDateAsUTC(date);
      
      try {
        const response = await api.get(`/patient/doctors/${doctorId}/serials?date=${dateStr}`);
        console.log(`[DEBUG] Date ${dateStr} API Response:`, response.data);
        
        if (response.data.success) {
          const data = response.data.data;
          
          // Check if date is enabled - use isDateEnabled flag from backend
          // Backend returns isDateEnabled: true for enabled dates, false for disabled
          // If isDateEnabled is undefined, check if we have serial data (backward compatibility)
          const isEnabled = data.isDateEnabled === true || 
                           (data.isDateEnabled === undefined && (data.availableSerials !== undefined || data.totalSerials > 0));
          
          console.log(`[DEBUG] Date ${dateStr} - isDateEnabled: ${data.isDateEnabled}, isEnabled (calculated): ${isEnabled}, availableCount: ${data.availableCount}, totalSerials: ${data.totalSerials}`);
          
          if (isEnabled) {
            // Date is enabled - show it even if all serials are booked
            enabledDatesMap[dateStr] = {
              adminNote: data.adminNote || null,
              totalSerials: data.totalSerials || 0,
              availableCount: data.availableCount || 0,
              bookedCount: data.bookedCount || 0,
              isEnabled: true
            };
            availability[dateStr] = {
              availableCount: data.availableCount || 0,
              totalCount: data.totalSerials || 0,
              bookedCount: data.bookedCount || 0,
              adminNote: data.adminNote || null,
              isEnabled: true
            };
          } else {
            // Date is explicitly disabled or not configured
            console.log(`[DEBUG] Date ${dateStr} is NOT enabled`);
            enabledDatesMap[dateStr] = {
              adminNote: data.adminNote || null,
              totalSerials: data.totalSerials || 0,
              availableCount: 0,
              bookedCount: 0,
              isEnabled: false
            };
          }
        } else {
          // Response was not successful
          console.log(`[DEBUG] Date ${dateStr} - API returned success: false`);
          enabledDatesMap[dateStr] = {
            adminNote: null,
            totalSerials: 0,
            availableCount: 0,
            bookedCount: 0,
            isEnabled: false
          };
        }
      } catch (err) {
        // Date is not enabled or has error
        console.log(`[DEBUG] Date ${dateStr} error:`, err.response?.data || err.message);
        enabledDatesMap[dateStr] = {
          adminNote: null,
          totalSerials: 0,
          availableCount: 0,
          bookedCount: 0,
          isEnabled: false
        };
      }
    }
    
    console.log(`[DEBUG] Enabled dates map for week:`, enabledDatesMap);
    setEnabledDates(enabledDatesMap);
    setDateAvailability(availability);
  };

  const navigateWeek = (direction) => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(newWeekStart.getDate() + (direction * 7));
    setCurrentWeekStart(newWeekStart);
    setSelectedSerialDate('');
    setSelectedSerial(null);
  };

  const fetchDateAvailability = async (dates) => {
    if (!selectedDoctor || !dates.length) return;
    
    const doctorId = typeof selectedDoctor === 'string' ? selectedDoctor : (selectedDoctor._id || selectedDoctor.id || selectedDoctor);
    const availability = {};
    
    // Fetch availability for first few dates to show in calendar
    const datesToCheck = dates.slice(0, 14); // Check first 14 available dates
    
    for (const date of datesToCheck) {
      try {
        // Format date using UTC to avoid timezone shifts
        const dateStr = formatDateAsUTC(date);
        const response = await api.get(`/patient/doctors/${doctorId}/serials?date=${dateStr}`);
        if (response.data.success) {
          availability[dateStr] = {
            availableCount: response.data.data.availableCount || 0,
            totalCount: response.data.data.totalSerials || 0,
            bookedCount: response.data.data.bookedCount || 0
          };
        }
      } catch (err) {
        console.error(`Error fetching availability for ${dateStr}:`, err);
      }
    }
    
    setDateAvailability(availability);
  };

  const handleSerialDateSelect = async (date) => {
    if (!selectedDoctor) return;
    
    // Format date using UTC to avoid timezone shifts
    const dateStr = typeof date === 'string' ? date : formatDateAsUTC(date);
    const enabledDate = enabledDates[dateStr];
    
    // Compare dates using UTC to avoid timezone issues
    const dateObj = typeof date === 'string' ? createUTCDate(date) : date;
    const today = new Date();
    const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    const dateUTC = new Date(Date.UTC(dateObj.getUTCFullYear(), dateObj.getUTCMonth(), dateObj.getUTCDate()));
    const isPast = dateUTC < todayUTC;
    
    // Check if date is enabled
    if (isPast) {
      setError('Cannot book appointments for past dates.');
      return;
    }
    
    if (!enabledDate || !enabledDate.isEnabled) {
      setError(enabledDate?.adminNote || 'This date is not available for serial booking.');
      return;
    }
    
    // Always store as string for consistent lookups
    setSelectedSerialDate(dateStr);
    setSelectedSerial(null);
    setLoadingSerials(true);
    setError('');
    
    // Show info message if all serials are booked, but still allow user to see the date
    if (enabledDate.availableCount === 0) {
      setError('All serials are booked for this date. Please try another date.');
    }

    try {
      const doctorId = typeof selectedDoctor === 'string' ? selectedDoctor : (selectedDoctor._id || selectedDoctor.id || selectedDoctor);
      
      const response = await api.get(`/patient/doctors/${doctorId}/serials?date=${dateStr}`);
      if (response.data.success) {
        const data = response.data.data;
        setAvailableSerials(data.availableSerials || []);
        
        // Update enabledDates with the latest admin note from the API response
        if (data.adminNote || data.isDateEnabled) {
          setEnabledDates(prev => ({
            ...prev,
            [dateStr]: {
              ...prev[dateStr],
              adminNote: data.adminNote || prev[dateStr]?.adminNote || null,
              isEnabled: data.isDateEnabled !== undefined ? data.isDateEnabled : (prev[dateStr]?.isEnabled || true),
              availableCount: data.availableCount || 0,
              totalSerials: data.totalSerials || prev[dateStr]?.totalSerials || 0
            }
          }));
        }
        
        if (!data.availableSerials || data.availableSerials.length === 0) {
          setError(data.adminNote || 'No available serials for this date. Please try another date.');
        }
      } else {
        setError(response.data.message || 'Failed to load available serials');
      }
    } catch (err) {
      console.error('Error fetching serials:', err);
      setError(err.response?.data?.message || 'Failed to load available serials');
      setAvailableSerials([]);
    } finally {
      setLoadingSerials(false);
    }
  };

  const handleSerialSelect = (serial) => {
    setSelectedSerial(serial);
    setStep(4);
  };

  const handleBookingSubmit = async () => {
    if (bookingType === 'serials') {
      // Serial-based booking
      if (!selectedDoctor || !selectedSerialDate || !selectedSerial) {
        setError('Please complete all required fields');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const doctorId = typeof selectedDoctor === 'string' ? selectedDoctor : (selectedDoctor._id || selectedDoctor.id || selectedDoctor);
        const dateStr = selectedSerialDate; // Already stored as string

        const bookingData = {
          doctorId,
          serialNumber: selectedSerial.serialNumber,
          date: dateStr
        };

        console.log('Booking serial with data:', bookingData);
        const response = await api.post('/patient/serials/book', bookingData);
        console.log('Booking response:', response.data);
        
        if (response.data.success) {
          setSuccess('Appointment booked successfully!');
          
          // Refresh the serial list to remove the booked serial
          if (selectedSerialDate) {
            await handleSerialDateSelect(selectedSerialDate);
          }
          
          // Clear selected serial
          setSelectedSerial(null);
          
          setTimeout(() => {
            navigate('/user/dashboard', { state: { showAppointments: true } });
          }, 2000);
        } else {
          setError(response.data.message || 'Failed to book appointment');
        }
      } catch (err) {
        console.error('Error booking serial:', err);
        console.error('Error response:', err.response?.data);
        const errorMessage = err.response?.data?.message || 
                            err.response?.data?.errors?.[0]?.msg || 
                            'Failed to book appointment. Please try again.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    } else {
      // Slot-based booking
      if (!selectedDoctor || !selectedChamber || !selectedDate || !selectedSlot) {
        setError('Please complete all required fields');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const doctorId = typeof selectedDoctor === 'string' ? selectedDoctor : (selectedDoctor._id || selectedDoctor.id || selectedDoctor);
        const chamberId = selectedChamber.chamberId || selectedChamber._id;

        // Format date to ISO8601 format
        const appointmentDate = new Date(selectedDate).toISOString();

        const appointmentData = {
          doctorId,
          chamberId,
          appointmentDate,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          consultationType: bookingData.consultationType,
          reason: bookingData.reason || undefined
        };

        console.log('Booking appointment with data:', appointmentData);
        const response = await api.post('/patient/appointments', appointmentData);
        console.log('Booking response:', response.data);
        
        if (response.data.success) {
          setSuccess('Appointment booked successfully!');
          setTimeout(() => {
            navigate('/user/dashboard', { state: { showAppointments: true } });
          }, 2000);
        } else {
          setError(response.data.message || 'Failed to book appointment');
        }
      } catch (err) {
        console.error('Error booking appointment:', err);
        console.error('Error response:', err.response?.data);
        const errorMessage = err.response?.data?.message || 
                            err.response?.data?.errors?.[0]?.msg || 
                            'Failed to book appointment. Please try again.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30); // 30 days ahead
    return maxDate.toISOString().split('T')[0];
  };

  // Get available days of week for selected chamber
  const getAvailableDays = () => {
    if (!selectedChamber || !selectedChamber.schedules) return [];
    return selectedChamber.schedules
      .filter(s => s.isActive)
      .map(s => s.dayOfWeek)
      .sort((a, b) => a - b);
  };

  // Check if a date is available based on schedule
  const isDateAvailable = (dateString) => {
    if (!selectedChamber || !selectedChamber.schedules) return false;
    const date = new Date(dateString);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    return selectedChamber.schedules.some(s => 
      s.isActive && s.dayOfWeek === dayOfWeek
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="book-appointment-page">
      <Navbar />
      <div className="book-appointment-container">
        <div className="booking-header">
          <h1>Book Appointment</h1>
          <p>Follow the steps to book your appointment</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {success}
          </div>
        )}

        {/* Progress Steps */}
        <div className="booking-steps">
          <div className={`step-indicator ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-label">Select Doctor</div>
          </div>
          <div className={`step-indicator ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">Select Chamber</div>
          </div>
          <div className={`step-indicator ${step >= 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-label">Date & Time</div>
          </div>
          <div className={`step-indicator ${step >= 4 ? 'active' : ''}`}>
            <div className="step-number">4</div>
            <div className="step-label">Confirm</div>
          </div>
        </div>

        {/* Step 1: Select Doctor */}
        {step === 1 && (
          <div className="booking-step-content">
            <div className="step-header">
              <h2>Select Doctor</h2>
              <p>Search and select a doctor to book an appointment</p>
            </div>
            <div className="doctor-search-section">
              <button
                onClick={() => navigate('/search-doctors')}
                className="btn-search-doctors"
              >
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
                Search Doctors
              </button>
              {loadingDoctor && (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading doctor details...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Serial Settings & Chamber Info OR Chamber Selection */}
        {step === 2 && bookingType === 'serials' && serialSettings && (
          <div className="booking-step-content">
            <div className="step-header">
              <h2>Serial Booking Information</h2>
              <p>View doctor's serial schedule and chamber location</p>
            </div>

            <div className="doctor-summary">
              <div className="doctor-summary-image">
                {serialSettings.doctor?.profilePhotoUrl ? (
                  <img src={serialSettings.doctor.profilePhotoUrl} alt={serialSettings.doctor.name} />
                ) : (
                  <div className="doctor-summary-placeholder">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth="2" />
                      <circle cx="12" cy="7" r="4" strokeWidth="2" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="doctor-summary-info">
                <h3>{serialSettings.doctor?.name}</h3>
                <p className="specialization">
                  {Array.isArray(serialSettings.doctor?.specialization) 
                    ? serialSettings.doctor.specialization.join(', ') 
                    : serialSettings.doctor?.specialization}
                </p>
              </div>
            </div>

            {/* Chamber/Location Info */}
            {serialSettings.chamber && (
              <div className="serial-chamber-info">
                <h3>Chamber/Location Details</h3>
                <div className="chamber-details-card">
                  <h4>{serialSettings.chamber.name || 'Chamber'}</h4>
                  {serialSettings.chamber.hospital && (
                    <div className="chamber-hospital">
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                      </svg>
                      <span>{serialSettings.chamber.hospital.name}</span>
                    </div>
                  )}
                  {serialSettings.chamber.address && (
                    <div className="chamber-address">
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <span>
                        {serialSettings.chamber.address.street && `${serialSettings.chamber.address.street}, `}
                        {serialSettings.chamber.address.city}
                        {serialSettings.chamber.address.state && `, ${serialSettings.chamber.address.state}`}
                      </span>
                    </div>
                  )}
                  <div className="chamber-fees">
                    <div className="fee-item">
                      <span className="fee-label">Appointment Fee:</span>
                      <span className="fee-value">{serialSettings.serialSettings?.appointmentPrice || 0} tk</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Serial Schedule Info */}
            <div className="serial-schedule-info">
              <h3>Serial Schedule</h3>
              <div className="schedule-info-grid">
                <div className="schedule-info-item">
                  <label>Total Serials Per Day:</label>
                  <span>{serialSettings.serialSettings?.totalSerialsPerDay || 0}</span>
                </div>
                <div className="schedule-info-item">
                  <label>Time Range:</label>
                  <span>
                    {serialSettings.serialSettings?.timeRange?.startTime} - {serialSettings.serialSettings?.timeRange?.endTime}
                  </span>
                </div>
                <div className="schedule-info-item">
                  <label>Available Days:</label>
                  <div className="available-days-tags">
                    {serialSettings.serialSettings?.availableDays?.map((day, idx) => {
                      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                      return (
                        <span key={idx} className="day-tag">{dayNames[day]}</span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(3)}
              className="btn-continue"
            >
              Continue to Date Selection
            </button>
          </div>
        )}

        {/* Step 2: View Availability & Select Chamber (Slot-based) */}
        {step === 2 && bookingType === 'slots' && doctorDetails && (
          <div className="booking-step-content">
            <div className="step-header">
              <h2>Doctor Availability & Chamber Selection</h2>
              <p>View doctor's schedule and choose your preferred chamber</p>
            </div>

            <div className="doctor-summary">
              <div className="doctor-summary-image">
                {doctorDetails.profilePhotoUrl ? (
                  <img src={doctorDetails.profilePhotoUrl} alt={doctorDetails.name} />
                ) : (
                  <div className="doctor-summary-placeholder">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth="2" />
                      <circle cx="12" cy="7" r="4" strokeWidth="2" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="doctor-summary-info">
                <h3>{doctorDetails.name}</h3>
                <p className="specialization">
                  {Array.isArray(doctorDetails.specialization) 
                    ? doctorDetails.specialization.join(', ') 
                    : doctorDetails.specialization}
                </p>
              </div>
            </div>

            <div className="chambers-grid">
              {availableChambers.map((chamber, index) => (
                <div
                  key={index}
                  className={`chamber-card ${selectedChamber?.chamberId === chamber.chamberId ? 'selected' : ''}`}
                  onClick={() => handleChamberSelect(chamber)}
                >
                  <div className="chamber-card-header">
                    <h4>{chamber.name || `Chamber ${index + 1}`}</h4>
                    {chamber.hospital && (
                      <div className="chamber-hospital">
                        <svg viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                        </svg>
                        <span>{chamber.hospital.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="chamber-card-body">
                    {chamber.address && (
                      <div className="chamber-address">
                        <svg viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <span>
                          {chamber.address.street && `${chamber.address.street}, `}
                          {chamber.address.city}
                        </span>
                      </div>
                    )}
                    <div className="chamber-fees">
                      <div className="fee-item">
                        <span className="fee-label">Consultation:</span>
                        <span className="fee-value">{chamber.consultationFee || 0} tk</span>
                      </div>
                      {chamber.followUpFee > 0 && (
                        <div className="fee-item">
                          <span className="fee-label">Follow-up:</span>
                          <span className="fee-value">{chamber.followUpFee} tk</span>
                        </div>
                      )}
                    </div>
                    {chamber.schedules && chamber.schedules.length > 0 ? (
                      <div className="chamber-schedule-detailed">
                        <div className="schedule-header">
                          <svg viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          <strong>Available Schedule</strong>
                        </div>
                        <div className="schedule-days">
                          {chamber.schedules
                            .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                            .map((schedule, sIdx) => {
                              const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                              const dayName = dayNames[schedule.dayOfWeek] || `Day ${schedule.dayOfWeek}`;
                              return (
                                <div key={sIdx} className="schedule-day-item">
                                  <div className="schedule-day-name">{dayName}</div>
                                  <div className="schedule-time-slots">
                                    {schedule.timeSlots && schedule.timeSlots.length > 0 ? (
                                      schedule.timeSlots.map((timeSlot, tIdx) => (
                                        <span key={tIdx} className="time-slot-badge">
                                          {timeSlot.startTime} - {timeSlot.endTime}
                                        </span>
                                      ))
                                    ) : (
                                      <span className="no-time">Not specified</span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    ) : (
                      <div className="chamber-no-schedule">
                        <svg viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <span>Schedule not available</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Select Date & Serial (Serial-based) */}
        {step === 3 && bookingType === 'serials' && serialSettings && (
          <div className="booking-step-content">
            <div className="step-header">
              <h2>Select Date & Serial Number</h2>
              <p>Choose your preferred date and available serial number</p>
              {selectedSerialDate && (
                <div className="selected-date-banner">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  <span><strong>Selected Date:</strong> {formatDate(selectedSerialDate)}</span>
                </div>
              )}
            </div>

            {/* Available Dates Calendar - 1 Week View */}
            <div className="serial-dates-selection">
              <div className="week-navigation">
                <button 
                  className="week-nav-btn"
                  onClick={() => navigateWeek(-1)}
                  aria-label="Previous week"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <h3 className="week-title">
                  {availableDates.length > 0 && (
                    <>
                      {availableDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })} - 
                      {availableDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}
                    </>
                  )}
                </h3>
                <button 
                  className="week-nav-btn"
                  onClick={() => navigateWeek(1)}
                  aria-label="Next week"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <div className="dates-calendar week-view">
                {availableDates.length > 0 ? (
                  availableDates.map((date, idx) => {
                    // Format date using UTC to avoid timezone shifts
                    const dateStr = formatDateAsUTC(date);
                    const availability = dateAvailability[dateStr];
                    const enabledDate = enabledDates[dateStr];
                    const isSelected = selectedSerialDate === dateStr;
                    // Date is enabled if it exists in enabledDates and isEnabled is true
                    const isEnabled = enabledDate && enabledDate.isEnabled === true;
                    // Compare dates using UTC to avoid timezone issues
                    const today = new Date();
                    const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
                    const dateUTC = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
                    const isPast = dateUTC < todayUTC;
                    
                    return (
                      <button
                        key={idx}
                        className={`date-card ${isSelected ? 'selected' : ''} ${!isEnabled ? 'disabled' : ''} ${isPast ? 'past' : ''}`}
                        onClick={() => isEnabled && !isPast ? handleSerialDateSelect(date) : null}
                        disabled={!isEnabled || isPast}
                        title={!isEnabled ? (enabledDate?.adminNote || 'Not available') : ''}
                      >
                        <div className="date-card-day">
                          {date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' })}
                        </div>
                        <div className="date-card-date">
                          {date.getUTCDate()}
                        </div>
                        <div className="date-card-month">
                          {date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' })}
                        </div>
                        {isEnabled && !isPast ? (
                          <div className="date-card-availability">
                            <span className="availability-count">
                              {availability?.availableCount || enabledDate?.availableCount || 0} / {availability?.totalCount || enabledDate?.totalSerials || 0}
                            </span>
                            <span className="availability-label">serials</span>
                            {(availability?.availableCount === 0 || enabledDate?.availableCount === 0) && (
                              <span className="status-badge full">Full</span>
                            )}
                          </div>
                        ) : (
                          <div className="date-card-status">
                            {isPast ? (
                              <span className="status-badge past">Past</span>
                            ) : (
                              <span className="status-badge unavailable">Not Available</span>
                            )}
                          </div>
                        )}
                        {enabledDate?.adminNote && (
                          <div className="date-card-note" title={enabledDate.adminNote}>
                            <svg viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })
                ) : (
                  <div className="no-dates">
                    <p>No dates available for this week</p>
                  </div>
                )}
              </div>
              {selectedSerialDate && enabledDates[selectedSerialDate]?.adminNote && (
                <div className="admin-note-banner">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span><strong>Note:</strong> {enabledDates[selectedSerialDate].adminNote}</span>
                </div>
              )}
            </div>

            {/* Available Serials for Selected Date */}
            {selectedSerialDate && (
              <div className="serials-selection">
                <div className="selected-date-info">
                  <label>
                    Available Serial Numbers for {selectedSerialDate ? formatDate(selectedSerialDate) : 'Selected Date'}
                  </label>
                  {serialSettings?.chamber && (
                    <div className="chamber-info-badge">
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                      </svg>
                      <span>{serialSettings.chamber.name || 'Chamber'}</span>
                    </div>
                  )}
                  {selectedSerialDate && enabledDates[selectedSerialDate]?.adminNote && (
                    <div className="admin-note-inline">
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <span>{enabledDates[selectedSerialDate].adminNote}</span>
                    </div>
                  )}
                </div>
                {loadingSerials ? (
                  <div className="serials-loading">
                    <div className="spinner-small"></div>
                    <span>Loading available serials...</span>
                  </div>
                ) : availableSerials.length === 0 ? (
                  <div className="no-serials">
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <p>No available serials for this date</p>
                    <p className="no-serials-hint">Please try another date</p>
                  </div>
                ) : (
                  <>
                    <div className="serials-grid">
                      {[...availableSerials]
                        .sort((a, b) => a.serialNumber - b.serialNumber) // Sort by serial number (ascending - lower numbers first)
                        .map((serial, index) => (
                        <button
                          key={`serial-${serial.serialNumber}-${index}`}
                          className={`serial-button ${selectedSerial?.serialNumber === serial.serialNumber ? 'selected' : ''}`}
                          onClick={() => handleSerialSelect(serial)}
                        >
                          <div className="serial-number">
                            Serial #{serial.serialNumber}
                          </div>
                          <div className="serial-time">
                            {serial.time} - {serial.endTime}
                          </div>
                          <div className="serial-status">
                            <span className="available">Available</span>
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="serials-info">
                      <p>
                        <strong>{availableSerials.length}</strong> serial{availableSerials.length !== 1 ? 's' : ''} available out of {serialSettings.serialSettings?.totalSerialsPerDay || 0} total
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}

            {selectedSerial && (
              <div className="selected-serial-summary">
                <h4>Selected Serial</h4>
                <div className="serial-summary-details">
                  <div>
                    <strong>Date:</strong> {selectedSerialDate ? formatDate(selectedSerialDate) : 'Not selected'}
                  </div>
                  <div>
                    <strong>Serial Number:</strong> #{selectedSerial.serialNumber}
                  </div>
                  <div>
                    <strong>Time:</strong> {selectedSerial.time} - {selectedSerial.endTime}
                  </div>
                  {serialSettings?.chamber && (
                    <div>
                      <strong>Chamber/Location:</strong> {serialSettings.chamber.name}
                    </div>
                  )}
                  <div>
                    <strong>Fee:</strong> {serialSettings.serialSettings?.appointmentPrice || 0} tk
                  </div>
                  {selectedSerialDate && enabledDates[selectedSerialDate]?.adminNote && (
                    <div className="admin-note-summary">
                      <strong>Admin Note:</strong> {enabledDates[selectedSerialDate].adminNote}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setStep(4)}
                  className="btn-continue"
                >
                  Continue to Confirmation
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Select Date & Time (Slot-based) */}
        {step === 3 && bookingType === 'slots' && selectedChamber && (
          <div className="booking-step-content">
            <div className="step-header">
              <h2>Select Date & Time</h2>
              <p>Choose your preferred date and available time slot</p>
            </div>

            {/* Show selected chamber info and schedule */}
            <div className="selected-chamber-info">
              <div className="chamber-info-header">
                <h3>{selectedChamber.name || 'Selected Chamber'}</h3>
                {selectedChamber.hospital && (
                  <span className="chamber-hospital-badge">
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                    {selectedChamber.hospital.name}
                  </span>
                )}
              </div>
              {selectedChamber.address && (
                <p className="chamber-info-address">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {selectedChamber.address.street && `${selectedChamber.address.street}, `}
                  {selectedChamber.address.city}
                </p>
              )}
              {selectedChamber.schedules && selectedChamber.schedules.length > 0 && (
                <div className="chamber-info-schedule">
                  <strong>Available Days:</strong>
                  <div className="available-days-list">
                    {selectedChamber.schedules
                      .filter(s => s.isActive)
                      .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                      .map((schedule, idx) => {
                        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                        const dayName = dayNames[schedule.dayOfWeek];
                        return (
                          <span key={idx} className="available-day-tag">
                            {dayName}
                            {schedule.timeSlots && schedule.timeSlots.length > 0 && (
                              <span className="day-times">
                                {' '}({schedule.timeSlots.map(ts => `${ts.startTime}-${ts.endTime}`).join(', ')})
                              </span>
                            )}
                          </span>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>

            <div className="date-time-selection">
              <div className="date-selection">
                <label>Select Date (Only available days are selectable)</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    const date = e.target.value;
                    if (isDateAvailable(date)) {
                      handleDateSelect(date);
                    } else {
                      setError('This date is not available. Please select a day when the doctor is available.');
                    }
                  }}
                  min={getMinDate()}
                  max={getMaxDate()}
                  className="date-input"
                />
                {selectedDate && (
                  <p className="selected-date-text">{formatDate(selectedDate)}</p>
                )}
                {getAvailableDays().length > 0 && (
                  <p className="available-days-hint">
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Doctor is available on: {getAvailableDays().map(day => {
                      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                      return dayNames[day];
                    }).join(', ')}
                  </p>
                )}
              </div>

              {selectedDate && (
                <div className="slots-selection">
                  <label>Available Time Slots</label>
                  {loadingSlots ? (
                    <div className="slots-loading">
                      <div className="spinner-small"></div>
                      <span>Loading available slots...</span>
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div className="no-slots">
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <p>No available slots for this date</p>
                      <p className="no-slots-hint">Please try another date</p>
                    </div>
                  ) : (
                    <div className="slots-grid">
                      {availableSlots.map((slot, index) => (
                        <button
                          key={index}
                          className={`slot-button ${selectedSlot?.startTime === slot.startTime ? 'selected' : ''}`}
                          onClick={() => handleSlotSelect(slot)}
                        >
                          <div className="slot-time">
                            {slot.startTime} - {slot.endTime}
                          </div>
                          <div className="slot-status">
                            {slot.available ? (
                              <span className="available">Available</span>
                            ) : (
                              <span className="booked">Booked</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {selectedSlot && (
              <div className="selected-slot-summary">
                <h4>Selected Slot</h4>
                <div className="slot-summary-details">
                  <div>
                    <strong>Date:</strong> {formatDate(selectedDate)}
                  </div>
                  <div>
                    <strong>Time:</strong> {selectedSlot.startTime} - {selectedSlot.endTime}
                  </div>
                  <div>
                    <strong>Fee:</strong> {bookingData.consultationType === 'follow_up' 
                      ? (selectedChamber.followUpFee || 0) 
                      : (selectedChamber.consultationFee || 0)} tk
                  </div>
                </div>
                <button
                  onClick={() => setStep(4)}
                  className="btn-continue"
                >
                  Continue to Confirmation
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Confirm Booking - Serial-based */}
        {step === 4 && bookingType === 'serials' && selectedDoctor && selectedSerial && selectedSerialDate && serialSettings && (
          <div className="booking-step-content">
            <div className="step-header">
              <h2>Confirm Appointment</h2>
              <p>Review your appointment details and confirm</p>
              {selectedSerialDate && (
                <div className="selected-date-banner">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  <span><strong>Appointment Date:</strong> {formatDate(selectedSerialDate)}</span>
                </div>
              )}
            </div>

            <div className="booking-summary">
              <div className="summary-section">
                <h3>Doctor Information</h3>
                <div className="summary-doctor">
                  {serialSettings?.doctor?.profilePhotoUrl && (
                    <img src={serialSettings.doctor.profilePhotoUrl} alt={serialSettings.doctor.name} />
                  )}
                  <div>
                    <h4>{serialSettings?.doctor?.name}</h4>
                    <p>
                      {Array.isArray(serialSettings?.doctor?.specialization) 
                        ? serialSettings.doctor.specialization.join(', ') 
                        : serialSettings?.doctor?.specialization}
                    </p>
                  </div>
                </div>
              </div>

              <div className="summary-section">
                <h3>Chamber/Location Details</h3>
                <div className="summary-details">
                  {serialSettings.chamber ? (
                    <>
                      <div className="detail-row">
                        <span className="detail-label">Chamber:</span>
                        <span className="detail-value">{serialSettings.chamber.name || 'N/A'}</span>
                      </div>
                      {serialSettings.chamber.hospital && (
                        <div className="detail-row">
                          <span className="detail-label">Hospital:</span>
                          <span className="detail-value">{serialSettings.chamber.hospital.name}</span>
                        </div>
                      )}
                      {serialSettings.chamber.address && (
                        <div className="detail-row">
                          <span className="detail-label">Address:</span>
                          <span className="detail-value">
                            {serialSettings.chamber.address.street && `${serialSettings.chamber.address.street}, `}
                            {serialSettings.chamber.address.city}
                            {serialSettings.chamber.address.state && `, ${serialSettings.chamber.address.state}`}
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="detail-row">
                      <span className="detail-label">Location:</span>
                      <span className="detail-value">
                        {serialSettings.hospital?.name || serialSettings.diagnosticCenter?.name || 'Not specified'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="summary-section">
                <h3>Appointment Details</h3>
                <div className="summary-details">
                  <div className="detail-row">
                    <span className="detail-label">Date:</span>
                    <span className="detail-value">
                      {selectedSerialDate ? formatDate(selectedSerialDate) : 'Not selected'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Serial Number:</span>
                    <span className="detail-value">#{selectedSerial.serialNumber}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Time:</span>
                    <span className="detail-value">{selectedSerial.time} - {selectedSerial.endTime}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Fee:</span>
                    <span className="detail-value fee-highlight">
                      {serialSettings.serialSettings?.appointmentPrice || 0} tk
                    </span>
                  </div>
                  {selectedSerialDate && enabledDates[selectedSerialDate]?.adminNote && (
                    <div className="detail-row admin-note-row">
                      <span className="detail-label">Admin Note:</span>
                      <span className="detail-value admin-note-value">
                        {enabledDates[selectedSerialDate].adminNote}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="booking-actions">
              <button
                onClick={() => setStep(3)}
                className="btn-back"
              >
                Back
              </button>
              <button
                onClick={handleBookingSubmit}
                disabled={loading}
                className="btn-confirm-booking"
              >
                {loading ? (
                  <>
                    <div className="spinner-small"></div>
                    Booking...
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Confirm Booking
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookAppointment;

