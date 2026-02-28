import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import Navbar from '../components/Navbar';
import './SearchDoctors.css';

const SearchDoctors = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [loadingDoctor, setLoadingDoctor] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });

  const [filters, setFilters] = useState({
    hospitalName: '',
    doctorName: '',
    department: '',
    specialization: '',
    page: 1
  });

  useEffect(() => {
    fetchSpecializations();
    // Initial search on mount
    const initialSearch = async () => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams();
        params.append('page', '1');
        params.append('limit', '12');
        const response = await api.get(`/shared/doctors/search?${params.toString()}`);
        if (response.data.success) {
          setDoctors(response.data.data.doctors || []);
          setPagination(response.data.data.pagination || {
            page: 1,
            limit: 12,
            total: 0,
            pages: 0
          });
        }
      } catch (err) {
        console.error('Error searching doctors:', err);
        setError(err.response?.data?.message || 'Failed to search doctors');
      } finally {
        setLoading(false);
      }
    };
    initialSearch();
  }, []);

  useEffect(() => {
    performSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.page]);

  const fetchSpecializations = async () => {
    try {
      const response = await api.get('/shared/specializations');
      if (response.data.success) {
        setSpecializations(response.data.data.specializations || []);
      }
    } catch (err) {
      console.error('Error fetching specializations:', err);
    }
  };

  const performSearch = async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (filters.hospitalName) params.append('hospitalName', filters.hospitalName);
      if (filters.doctorName) params.append('doctorName', filters.doctorName);
      if (filters.department) params.append('department', filters.department);
      if (filters.specialization) params.append('specialization', filters.specialization);
      params.append('page', filters.page);
      params.append('limit', pagination.limit);

      const response = await api.get(`/shared/doctors/search?${params.toString()}`);
      if (response.data.success) {
        setDoctors(response.data.data.doctors || []);
        setPagination(response.data.data.pagination || {
          page: 1,
          limit: 12,
          total: 0,
          pages: 0
        });
      } else {
        setError(response.data.message || 'Failed to search doctors');
      }
    } catch (err) {
      console.error('Error searching doctors:', err);
      setError(err.response?.data?.message || 'Failed to search doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: 1 // Reset to first page on filter change
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, page: 1 }));
    performSearch();
  };

  const handleClearFilters = () => {
    setFilters({
      hospitalName: '',
      doctorName: '',
      department: '',
      specialization: '',
      page: 1
    });
  };

  const handleDoctorClick = async (doctorId) => {
    if (!doctorId) return;
    
    setShowDoctorModal(true);
    setLoadingDoctor(true);
    setSelectedDoctor(null);

    try {
      const id = typeof doctorId === 'string' ? doctorId : (doctorId._id || doctorId.id || doctorId);
      const response = await api.get(`/shared/doctors/${id}`);
      if (response.data.success) {
        setSelectedDoctor(response.data.data.doctor || response.data.data);
      } else {
        setError(response.data.message || 'Failed to load doctor details');
      }
    } catch (err) {
      console.error('Error fetching doctor details:', err);
      setError(err.response?.data?.message || 'Failed to load doctor details');
    } finally {
      setLoadingDoctor(false);
    }
  };

  const closeDoctorModal = () => {
    setShowDoctorModal(false);
    setSelectedDoctor(null);
  };

  const handleBookAppointment = (doctor) => {
    navigate('/book-appointment', { state: { doctorId: doctor._id } });
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="search-doctors-page">
      <Navbar />
      <div className="search-doctors-container">
        <div className="search-doctors-header">
          <h1>Find Your Doctor</h1>
          <p>Search for doctors by name, hospital, department, or specialization</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSearch} className="search-form">
          <div className="search-form-grid">
            <div className="form-group">
              <label>
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                Hospital Name
              </label>
              <input
                type="text"
                placeholder="Enter hospital name"
                value={filters.hospitalName}
                onChange={(e) => handleFilterChange('hospitalName', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                Doctor Name
              </label>
              <input
                type="text"
                placeholder="Enter doctor name"
                value={filters.doctorName}
                onChange={(e) => handleFilterChange('doctorName', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                Department
              </label>
              <input
                type="text"
                placeholder="e.g., Cardiology, Neurology"
                value={filters.department}
                onChange={(e) => handleFilterChange('department', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Specialization
              </label>
              <select
                value={filters.specialization}
                onChange={(e) => handleFilterChange('specialization', e.target.value)}
              >
                <option value="">All Specializations</option>
                {specializations.map((spec) => (
                  <option key={spec._id} value={spec.name}>
                    {spec.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="search-form-actions">
            <button type="button" onClick={handleClearFilters} className="btn-clear">
              Clear Filters
            </button>
            <button type="submit" className="btn-search" disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner-small"></div>
                  Searching...
                </>
              ) : (
                <>
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                  Search Doctors
                </>
              )}
            </button>
          </div>
        </form>

        {loading && doctors.length === 0 ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Searching for doctors...</p>
          </div>
        ) : doctors.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2" />
            </svg>
            <h3>No Doctors Found</h3>
            <p>Try adjusting your search criteria or filters</p>
          </div>
        ) : (
          <>
            <div className="results-header">
              <h2>
                Found {pagination.total} Doctor{pagination.total !== 1 ? 's' : ''}
              </h2>
              {pagination.pages > 1 && (
                <div className="pagination-info">
                  Page {pagination.page} of {pagination.pages}
                </div>
              )}
            </div>

            <div className="doctors-grid">
              {doctors.map((doctor) => (
                <DoctorCard
                  key={doctor._id}
                  doctor={doctor}
                  onViewDetails={() => handleDoctorClick(doctor._id)}
                  onBookAppointment={() => handleBookAppointment(doctor)}
                />
              ))}
            </div>

            {pagination.pages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="pagination-btn"
                >
                  Previous
                </button>
                <div className="pagination-pages">
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    let pageNum;
                    if (pagination.pages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.pages - 2) {
                      pageNum = pagination.pages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`pagination-btn ${pagination.page === pageNum ? 'active' : ''}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="pagination-btn"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Doctor Details Modal */}
      {showDoctorModal && (
        <DoctorDetailsModal
          doctor={selectedDoctor}
          loading={loadingDoctor}
          onClose={closeDoctorModal}
          onBookAppointment={handleBookAppointment}
        />
      )}
    </div>
  );
};

// Doctor Card Component
const DoctorCard = ({ doctor, onViewDetails, onBookAppointment }) => {
  const primaryHospital = doctor.hospitals && doctor.hospitals.length > 0 ? doctor.hospitals[0] : null;
  const specialization = Array.isArray(doctor.specialization) 
    ? doctor.specialization.join(', ') 
    : doctor.specialization || 'N/A';

  return (
    <div className="doctor-card">
      <div className="doctor-card-header">
        {doctor.profilePhotoUrl ? (
          <img src={doctor.profilePhotoUrl} alt={doctor.name} className="doctor-photo" />
        ) : (
          <div className="doctor-photo-placeholder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth="2" />
              <circle cx="12" cy="7" r="4" strokeWidth="2" />
            </svg>
          </div>
        )}
        {primaryHospital?.logo && (
          <div className="hospital-badge">
            <img src={primaryHospital.logo} alt={primaryHospital.hospitalName} />
          </div>
        )}
      </div>

      <div className="doctor-card-body">
        <h3 className="doctor-name">{doctor.name}</h3>
        <p className="doctor-specialization">{specialization}</p>
        
        {primaryHospital && (
          <div className="doctor-hospital">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <span>{primaryHospital.hospitalName}</span>
            {primaryHospital.department && (
              <span className="department-badge">{primaryHospital.department}</span>
            )}
          </div>
        )}

        {doctor.qualifications && (
          <p className="doctor-qualifications">
            {Array.isArray(doctor.qualifications) 
              ? doctor.qualifications.join(', ') 
              : doctor.qualifications}
          </p>
        )}

        {doctor.experienceYears && (
          <p className="doctor-experience">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            {doctor.experienceYears} years of experience
          </p>
        )}

        {doctor.consultationFee && (
          <div className="doctor-fee">
            <span className="fee-label">Consultation Fee:</span>
            <span className="fee-value">{doctor.consultationFee} tk</span>
          </div>
        )}
      </div>

      <div className="doctor-card-footer">
        <button onClick={onViewDetails} className="btn-view-details">
          View Details
        </button>
        <button onClick={onBookAppointment} className="btn-book-appointment">
          Book Appointment
        </button>
      </div>
    </div>
  );
};

// Doctor Details Modal Component (reusing from UserDashboard)
const DoctorDetailsModal = ({ doctor, loading, onClose, onBookAppointment }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  if (loading) {
    return (
      <div className="doctor-modal-overlay" onClick={onClose}>
        <div className="doctor-modal" onClick={(e) => e.stopPropagation()}>
          <div className="doctor-modal-loading">
            <div className="spinner"></div>
            <p>Loading doctor details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="doctor-modal-overlay" onClick={onClose}>
        <div className="doctor-modal" onClick={(e) => e.stopPropagation()}>
          <div className="doctor-modal-error">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <h3>Doctor details not available</h3>
            <button onClick={onClose} className="btn-close-modal">Close</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-modal-overlay" onClick={onClose}>
      <div className="doctor-modal" onClick={(e) => e.stopPropagation()}>
        <div className="doctor-modal-header">
          <h2>Doctor Details</h2>
          <button onClick={onClose} className="doctor-modal-close">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="doctor-modal-body">
          <div className="doctor-profile-section">
            <div className="doctor-profile-image">
              {doctor.profilePhotoUrl ? (
                <img src={doctor.profilePhotoUrl} alt={doctor.name} />
              ) : (
                <div className="doctor-profile-placeholder">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="7" r="4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>
            <div className="doctor-profile-info">
              <h3>{doctor.name}</h3>
              {doctor.specialization && (
                <p className="doctor-specialization">
                  {Array.isArray(doctor.specialization) 
                    ? doctor.specialization.join(', ') 
                    : doctor.specialization}
                </p>
              )}
              {doctor.designation && (
                <p className="doctor-designation">{doctor.designation}</p>
              )}
            </div>
          </div>

          <div className="doctor-details-grid">
            <div className="detail-section">
              <h4>
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                Contact Information
              </h4>
              <div className="detail-items">
                {doctor.email && (
                  <div className="detail-item">
                    <label>Email:</label>
                    <span>{doctor.email}</span>
                  </div>
                )}
                {doctor.phone && (
                  <div className="detail-item">
                    <label>Phone:</label>
                    <span>{doctor.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {doctor.medicalLicenseNumber && (
              <div className="detail-section">
                <h4>
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Professional Information
                </h4>
                <div className="detail-items">
                  <div className="detail-item">
                    <label>Medical License:</label>
                    <span>{doctor.medicalLicenseNumber}</span>
                  </div>
                  {doctor.qualifications && (
                    <div className="detail-item">
                      <label>Qualifications:</label>
                      <span>{Array.isArray(doctor.qualifications) ? doctor.qualifications.join(', ') : doctor.qualifications}</span>
                    </div>
                  )}
                  {doctor.experienceYears && (
                    <div className="detail-item">
                      <label>Experience:</label>
                      <span>{doctor.experienceYears} years</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {doctor.bio && (
              <div className="detail-section">
                <h4>
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Biography
                </h4>
                <p className="doctor-bio">{doctor.bio}</p>
              </div>
            )}

            {doctor.hospitals && doctor.hospitals.length > 0 && (
              <div className="detail-section">
                <h4>
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                  Hospital Associations
                </h4>
                <div className="hospital-list">
                  {doctor.hospitals.map((hospital, index) => (
                    <div key={index} className="hospital-item">
                      <h5>{hospital.hospitalName}</h5>
                      {hospital.department && (
                        <p className="hospital-department">Department: {hospital.department}</p>
                      )}
                      {hospital.designation && (
                        <p className="hospital-designation">Designation: {hospital.designation}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {doctor.chambers && doctor.chambers.length > 0 && (
              <div className="detail-section">
                <h4>
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  Chambers & Schedule
                </h4>
                <div className="chamber-list">
                  {doctor.chambers.map((chamber, index) => (
                    <div key={index} className="chamber-item">
                      <h5>{chamber.name}</h5>
                      {chamber.hospital && chamber.hospital.name && (
                        <p className="chamber-hospital">Hospital: {chamber.hospital.name}</p>
                      )}
                      {chamber.consultationFee && (
                        <p className="chamber-fee">Consultation Fee: {chamber.consultationFee} tk</p>
                      )}
                      {chamber.followUpFee && (
                        <p className="chamber-fee">Follow-up Fee: {chamber.followUpFee} tk</p>
                      )}
                      {chamber.schedules && chamber.schedules.length > 0 && (
                        <div className="chamber-schedule">
                          <strong>Schedule:</strong>
                          <ul>
                            {chamber.schedules.map((schedule, sIdx) => {
                              const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                              const dayName = dayNames[schedule.dayOfWeek] || `Day ${schedule.dayOfWeek}`;
                              return (
                                <li key={sIdx}>
                                  {dayName}: {schedule.timeSlots && schedule.timeSlots.length > 0 ? (
                                    schedule.timeSlots.map((slot, slotIdx) => (
                                      <span key={slotIdx}>
                                        {slot.startTime} - {slot.endTime}
                                        {slotIdx < schedule.timeSlots.length - 1 ? ', ' : ''}
                                      </span>
                                    ))
                                  ) : 'Not specified'}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="doctor-modal-footer">
          <button onClick={onClose} className="btn-close-modal">
            Close
          </button>
          {onBookAppointment && (
            <button onClick={() => { onBookAppointment(doctor); onClose(); }} className="btn-book-modal">
              Book Appointment
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchDoctors;

