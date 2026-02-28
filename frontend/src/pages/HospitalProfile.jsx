import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import Navbar from '../components/Navbar';
import './HospitalProfile.css';

const HospitalProfile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [logoError, setLogoError] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    registrationNumber: '',
    logo: '',
    contactInfo: {
      phone: [],
      email: '',
      website: ''
    },
    departments: [],
    facilities: [],
    services: [],
  });
  
  // Store raw input values for comma-separated fields
  const [rawInputs, setRawInputs] = useState({
    departments: '',
    facilities: '',
    services: '',
  });

  useEffect(() => {
    if (!user || user.role !== 'hospital_admin') {
      navigate('/hospital/login');
      return;
    }
    fetchHospitalProfile();
  }, [user]);

  // Reset logo error when logo changes
  useEffect(() => {
    if (hospital?.logo) {
      setLogoError(false);
    }
  }, [hospital?.logo]);

  const fetchHospitalProfile = async () => {
    try {
      setLoading(true);
      setError('');
      
      // First get user profile to find hospital
      const userResponse = await api.get(`/users/${user.id}`);
      
      if (userResponse.data.success && userResponse.data.data.roleData) {
        const hospitalData = userResponse.data.data.roleData;
        const hospitalId = hospitalData._id;
        
        // Try to get full hospital profile (may fail if not approved)
        try {
          const hospitalResponse = await api.get(`/hospitals/${hospitalId}/profile`);
          
          if (hospitalResponse.data.success) {
            const fullHospitalData = hospitalResponse.data.data.hospital;
            setHospital(fullHospitalData);
            
            // Initialize form data
            const departments = Array.isArray(fullHospitalData.departments) ? fullHospitalData.departments : [];
            const facilities = Array.isArray(fullHospitalData.facilities) ? fullHospitalData.facilities : [];
            const services = Array.isArray(fullHospitalData.services) ? fullHospitalData.services : [];
            
            setFormData({
              name: fullHospitalData.name || '',
              address: fullHospitalData.address || '',
              registrationNumber: fullHospitalData.registrationNumber || '',
              logo: fullHospitalData.logo || '',
              contactInfo: {
                phone: Array.isArray(fullHospitalData.contactInfo?.phone) 
                  ? fullHospitalData.contactInfo.phone 
                  : (fullHospitalData.contactInfo?.phone ? [fullHospitalData.contactInfo.phone] : []),
                email: fullHospitalData.contactInfo?.email || '',
                website: fullHospitalData.contactInfo?.website || ''
              },
              departments: departments,
              facilities: facilities,
              services: services,
            });
            
            // Initialize raw inputs
            setRawInputs({
              departments: departments.join(', '),
              facilities: facilities.join(', '),
              services: services.join(', '),
            });
            return; // Success, exit early
          }
        } catch (profileError) {
          // If profile endpoint fails (e.g., not approved), use basic hospital data
          if (profileError.response?.status === 403) {
            const departments = Array.isArray(hospitalData.departments) ? hospitalData.departments : [];
            const facilities = Array.isArray(hospitalData.facilities) ? hospitalData.facilities : [];
            const services = Array.isArray(hospitalData.services) ? hospitalData.services : [];
            
            setHospital(hospitalData);
            setFormData({
              name: hospitalData.name || '',
              address: hospitalData.address || '',
              registrationNumber: hospitalData.registrationNumber || '',
              logo: hospitalData.logo || '',
              contactInfo: {
                phone: Array.isArray(hospitalData.contactInfo?.phone) 
                  ? hospitalData.contactInfo.phone 
                  : (hospitalData.contactInfo?.phone ? [hospitalData.contactInfo.phone] : []),
                email: hospitalData.contactInfo?.email || '',
                website: hospitalData.contactInfo?.website || ''
              },
              departments: departments,
              facilities: facilities,
              services: services,
            });
            
            // Initialize raw inputs
            setRawInputs({
              departments: departments.join(', '),
              facilities: facilities.join(', '),
              services: services.join(', '),
            });
            setError('Hospital must be approved to view full profile. Some features may be limited.');
            return;
          }
          throw profileError; // Re-throw if it's a different error
        }
      } else {
        setError('Hospital profile not found. Please contact support.');
      }
    } catch (err) {
      console.error('Error fetching hospital profile:', err);
      if (err.response?.status === 403) {
        setError('Hospital must be approved to view profile. Please wait for approval.');
      } else {
        setError(err.response?.data?.message || 'Failed to load hospital profile.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('contactInfo.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    setError('');
  };

  const handleArrayInputChange = (field, value) => {
    // Update raw input value (allows typing commas freely)
    setRawInputs(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Process and update form data (for tags display and saving)
    const items = value
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);
    
    setFormData(prev => ({
      ...prev,
      [field]: items
    }));
  };
  
  const handleArrayBlur = (field) => {
    // On blur, clean up the raw input (remove trailing commas/spaces)
    const currentValue = rawInputs[field];
    const cleaned = currentValue
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0)
      .join(', ');
    
    setRawInputs(prev => ({
      ...prev,
      [field]: cleaned
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    setLogoError(false);

    try {
      const updateData = { ...formData };
      
      // If hospital is approved, exclude critical fields (read-only)
      if (hospital?.status === 'approved') {
        const criticalFields = ['name', 'address', 'registrationNumber'];
        criticalFields.forEach(field => {
          delete updateData[field];
        });
      }
      
      // Ensure logo is included and trimmed
      if (updateData.logo) {
        updateData.logo = updateData.logo.trim();
      }
      
      // Ensure arrays are properly formatted (departments, facilities, services)
      if (updateData.departments) {
        updateData.departments = Array.isArray(updateData.departments) 
          ? updateData.departments.filter(d => d && d.trim().length > 0)
          : [];
      }
      if (updateData.facilities) {
        updateData.facilities = Array.isArray(updateData.facilities) 
          ? updateData.facilities.filter(f => f && f.trim().length > 0)
          : [];
      }
      if (updateData.services) {
        updateData.services = Array.isArray(updateData.services) 
          ? updateData.services.filter(s => s && s.trim().length > 0)
          : [];
      }
      
      // Convert phone string to array if needed
      if (typeof updateData.contactInfo.phone === 'string') {
        updateData.contactInfo.phone = updateData.contactInfo.phone
          .split(',')
          .map(p => p.trim())
          .filter(p => p);
      }
      
      console.log('Sending update data:', updateData); // Debug log

      console.log('Updating hospital with data:', updateData); // Debug log

      const response = await api.put(`/hospitals/${hospital._id}/profile`, updateData);

      if (response.data.success) {
        const updatedHospital = response.data.data.hospital;
        console.log('Updated hospital response:', updatedHospital); // Debug log
        
        // Update hospital state immediately with the response data
        if (updatedHospital) {
          setHospital(prev => {
            const newHospital = { 
              ...prev, 
              ...updatedHospital
            };
            // Explicitly set logo from response (even if empty string, use it)
            newHospital.logo = updatedHospital.logo !== undefined ? updatedHospital.logo : prev.logo;
            console.log('Updated hospital state with logo:', newHospital.logo); // Debug log
            return newHospital;
          });
          
          // Reset logo error since we have a new logo
          if (updatedHospital.logo) {
            setLogoError(false);
          }
          
          // Also update form data to reflect changes
          const updatedDepartments = updatedHospital.departments || prev.departments;
          const updatedFacilities = updatedHospital.facilities || prev.facilities;
          const updatedServices = updatedHospital.services || prev.services;
          
          setFormData(prev => ({
            ...prev,
            logo: updatedHospital.logo !== undefined ? updatedHospital.logo : prev.logo,
            contactInfo: updatedHospital.contactInfo || prev.contactInfo,
            departments: updatedDepartments,
            facilities: updatedFacilities,
            services: updatedServices,
          }));
          
          // Update raw inputs to match
          setRawInputs(prev => ({
            ...prev,
            departments: Array.isArray(updatedDepartments) ? updatedDepartments.join(', ') : '',
            facilities: Array.isArray(updatedFacilities) ? updatedFacilities.join(', ') : '',
            services: Array.isArray(updatedServices) ? updatedServices.join(', ') : '',
          }));
        }
        
        setSuccess('Hospital profile updated successfully!');
        setEditing(false);
        
        // Refresh full profile to get any populated data (doctors, etc.) but only if needed
        // The logo should already be updated in state above
        setTimeout(async () => {
          try {
            await fetchHospitalProfile();
          } catch (err) {
            // If refresh fails, that's okay - we already updated the state
            console.warn('Profile refresh failed, but update was successful:', err);
          }
        }, 1000);
        
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Error updating hospital profile:', err);
      setError(err.response?.data?.message || 'Failed to update hospital profile.');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      approved: { label: 'Approved', class: 'status-approved' },
      pending_super_admin: { label: 'Pending Approval', class: 'status-pending' },
      pending_hospital: { label: 'Pending', class: 'status-pending' },
      pending_hospital_and_super_admin: { label: 'Pending', class: 'status-pending' },
      rejected: { label: 'Rejected', class: 'status-rejected' },
      suspended: { label: 'Suspended', class: 'status-suspended' },
    };
    
    const config = statusConfig[status] || { label: status, class: 'status-pending' };
    return <span className={`status-badge ${config.class}`}>{config.label}</span>;
  };

  const isReadOnly = hospital?.status === 'approved';

  if (loading) {
    return (
      <div className="hospital-profile-container">
        <Navbar />
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading hospital profile...</p>
        </div>
      </div>
    );
  }

  if (error && !hospital) {
    return (
      <div className="hospital-profile-container">
        <Navbar />
        <div className="error-state">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <h2>Error Loading Profile</h2>
          <p>{error}</p>
          <button onClick={fetchHospitalProfile} className="retry-button">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="hospital-profile-container">
      <Navbar />
      <div className="hospital-profile-header">
        <div className="header-content">
          <div className="hospital-logo-section">
            {hospital.logo && hospital.logo.trim() && !logoError ? (
              <img 
                src={hospital.logo.trim()} 
                alt="Hospital Logo" 
                className="hospital-logo"
                key={`${hospital._id}-${hospital.logo}`} // Force re-render when logo URL changes
                onLoad={() => {
                  setLogoError(false);
                  console.log('Logo loaded successfully:', hospital.logo);
                }}
                onError={(e) => {
                  console.error('Logo failed to load:', hospital.logo);
                  setLogoError(true);
                  e.target.style.display = 'none';
                }}
              />
            ) : null}
            {(!hospital.logo || !hospital.logo.trim() || logoError) && (
              <div className="hospital-logo-placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" strokeWidth="2"/>
                </svg>
                {logoError && hospital.logo && (
                  <span className="logo-error-text">Invalid URL</span>
                )}
              </div>
            )}
          </div>
          <div className="hospital-title-section">
            <h1>{hospital.name}</h1>
            <div className="hospital-meta">
              {getStatusBadge(hospital.status)}
              <span className="registration-number">Reg: {hospital.registrationNumber}</span>
            </div>
          </div>
        </div>
        <div className="header-actions">
          {!editing ? (
            <button onClick={() => setEditing(true)} className="edit-button">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Edit Profile
            </button>
          ) : (
            <div className="edit-actions">
              <button onClick={() => { setEditing(false); fetchHospitalProfile(); }} className="cancel-button">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={saving} className="save-button">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
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

      <div className="hospital-profile-content">
        <div className="profile-section">
          <h2 className="section-title">Basic Information</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Hospital Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!editing || isReadOnly}
                className={isReadOnly ? 'read-only' : ''}
                placeholder="Hospital name"
              />
              {isReadOnly && <small className="read-only-hint">Cannot be changed after approval</small>}
            </div>

            <div className="form-group">
              <label>Registration Number</label>
              <input
                type="text"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleChange}
                disabled={!editing || isReadOnly}
                className={isReadOnly ? 'read-only' : ''}
                placeholder="Registration number"
              />
              {isReadOnly && <small className="read-only-hint">Cannot be changed after approval</small>}
            </div>

            <div className="form-group full-width">
              <label>Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                disabled={!editing || isReadOnly}
                className={isReadOnly ? 'read-only' : ''}
                placeholder="Hospital address"
              />
              {isReadOnly && <small className="read-only-hint">Cannot be changed after approval</small>}
            </div>

            <div className="form-group">
              <label>Logo URL</label>
              <input
                type="url"
                name="logo"
                value={formData.logo}
                onChange={handleChange}
                disabled={!editing}
                placeholder="https://example.com/logo.png"
              />
              {editing && formData.logo && formData.logo.trim() && (
                <div className="logo-preview">
                  <small>Preview:</small>
                  <img 
                    src={formData.logo.trim()} 
                    alt="Logo preview" 
                    className="logo-preview-image"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'block';
                    }}
                  />
                  <span className="logo-preview-error" style={{ display: 'none' }}>
                    Invalid image URL
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h2 className="section-title">Contact Information</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Phone Numbers (comma separated)</label>
              <input
                type="text"
                name="phone"
                value={formData.contactInfo.phone.join(', ')}
                onChange={(e) => {
                  const phones = e.target.value.split(',').map(p => p.trim()).filter(p => p);
                  setFormData(prev => ({
                    ...prev,
                    contactInfo: {
                      ...prev.contactInfo,
                      phone: phones
                    }
                  }));
                }}
                disabled={!editing}
                placeholder="+1234567890, +0987654321"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="contactInfo.email"
                value={formData.contactInfo.email}
                onChange={handleChange}
                disabled={!editing}
                placeholder="contact@hospital.com"
              />
            </div>

            <div className="form-group">
              <label>Website</label>
              <input
                type="url"
                name="contactInfo.website"
                value={formData.contactInfo.website}
                onChange={handleChange}
                disabled={!editing}
                placeholder="https://www.hospital.com"
              />
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h2 className="section-title">Departments</h2>
          <div className="form-group">
            <label>Departments (comma separated)</label>
            <input
              type="text"
              value={rawInputs.departments}
              onChange={(e) => handleArrayInputChange('departments', e.target.value)}
              onBlur={() => handleArrayBlur('departments')}
              disabled={!editing}
              placeholder="Cardiology, Neurology, Pediatrics"
            />
            <small className="field-hint">Separate multiple items with commas (e.g., Cardiology, Neurology, Pediatrics)</small>
          </div>
          {formData.departments.length > 0 && (
            <div className="tags-container">
              {formData.departments.map((dept, idx) => (
                <span key={idx} className="tag">{dept}</span>
              ))}
            </div>
          )}
        </div>

        <div className="profile-section">
          <h2 className="section-title">Facilities</h2>
          <div className="form-group">
            <label>Facilities (comma separated)</label>
            <input
              type="text"
              value={rawInputs.facilities}
              onChange={(e) => handleArrayInputChange('facilities', e.target.value)}
              onBlur={() => handleArrayBlur('facilities')}
              disabled={!editing}
              placeholder="ICU, Emergency, Pharmacy, Lab"
            />
            <small className="field-hint">Separate multiple items with commas (e.g., ICU, Emergency, Pharmacy)</small>
          </div>
          {formData.facilities.length > 0 && (
            <div className="tags-container">
              {formData.facilities.map((facility, idx) => (
                <span key={idx} className="tag">{facility}</span>
              ))}
            </div>
          )}
        </div>

        <div className="profile-section">
          <h2 className="section-title">Services</h2>
          <div className="form-group">
            <label>Services (comma separated)</label>
            <input
              type="text"
              value={rawInputs.services}
              onChange={(e) => handleArrayInputChange('services', e.target.value)}
              onBlur={() => handleArrayBlur('services')}
              disabled={!editing}
              placeholder="Emergency Care, Surgery, Consultation"
            />
            <small className="field-hint">Separate multiple items with commas (e.g., Emergency Care, Surgery, Consultation)</small>
          </div>
          {formData.services.length > 0 && (
            <div className="tags-container">
              {formData.services.map((service, idx) => (
                <span key={idx} className="tag">{service}</span>
              ))}
            </div>
          )}
        </div>

        {hospital.associatedDoctors && hospital.associatedDoctors.length > 0 && (
          <div className="profile-section">
            <h2 className="section-title">Associated Doctors ({hospital.associatedDoctors.length})</h2>
            <div className="doctors-grid">
              {hospital.associatedDoctors.map((assoc, idx) => (
                <div key={idx} className="doctor-card">
                  <div className="doctor-info">
                    <h4>{assoc.doctor?.name || 'Unknown'}</h4>
                    <p className="doctor-email">{assoc.doctor?.email}</p>
                    {assoc.department && <span className="doctor-dept">{assoc.department}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalProfile;

