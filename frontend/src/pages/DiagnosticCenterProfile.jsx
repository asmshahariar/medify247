import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import Navbar from '../components/Navbar';
import './DiagnosticCenterProfile.css';

const DiagnosticCenterProfile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [diagnosticCenter, setDiagnosticCenter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [logoError, setLogoError] = useState(false);
  const [associatedDoctors, setAssociatedDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    tradeLicenseNumber: '',
    logo: '',
    contactInfo: {
      phone: [],
      email: '',
      website: ''
    },
    departments: [],
    operatingHours: {
      openingTime: '09:00',
      closingTime: '17:00'
    },
    homeSampleCollection: false,
    emergencyService: false,
    ambulanceService: {
      available: false,
      contactNumber: ''
    },
    numberOfLabTechnicians: 0,
    numberOfStaff: 0,
    reportingTime: 'depends_on_test',
    reportDeliveryOptions: {
      email: true,
      onlinePortal: true
    },
  });
  
  // Store raw input values for comma-separated fields
  const [rawInputs, setRawInputs] = useState({
    departments: '',
  });

  useEffect(() => {
    if (!user || user.role !== 'diagnostic_center_admin') {
      navigate('/diagnostic-center/login');
      return;
    }
    fetchDiagnosticCenterProfile();
  }, [user]);

  // Reset logo error when logo changes
  useEffect(() => {
    if (diagnosticCenter?.logo) {
      setLogoError(false);
    }
  }, [diagnosticCenter?.logo]);

  // Fetch associated doctors when diagnostic center is loaded
  useEffect(() => {
    if (diagnosticCenter?._id) {
      fetchAssociatedDoctors(diagnosticCenter._id);
    }
  }, [diagnosticCenter?._id]);

  const fetchAssociatedDoctors = async (centerId) => {
    setLoadingDoctors(true);
    try {
      const response = await api.get(`/diagnostic-centers/${centerId}/doctors`);
      if (response.data.success) {
        setAssociatedDoctors(response.data.data.doctors || []);
      }
    } catch (err) {
      console.error('Error fetching associated doctors:', err);
      setAssociatedDoctors([]);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const fetchDiagnosticCenterProfile = async () => {
    try {
      setLoading(true);
      setError('');
      
      // First get user profile to find diagnostic center
      const userResponse = await api.get(`/users/${user.id}`);
      
      if (userResponse.data.success && userResponse.data.data.roleData) {
        const centerData = userResponse.data.data.roleData;
        const centerId = centerData._id;
        
        // Try to get full diagnostic center profile (may fail if not approved)
        try {
          const centerResponse = await api.get(`/diagnostic-centers/${centerId}/profile`);
          
          if (centerResponse.data.success) {
            const fullCenterData = centerResponse.data.data.diagnosticCenter;
            setDiagnosticCenter(fullCenterData);
            
            // Initialize form data
            const departments = Array.isArray(fullCenterData.departments) ? fullCenterData.departments : [];
            
            setFormData({
              name: fullCenterData.name || '',
              address: fullCenterData.address || '',
              tradeLicenseNumber: fullCenterData.tradeLicenseNumber || '',
              logo: fullCenterData.logo || '',
              contactInfo: {
                phone: Array.isArray(fullCenterData.contactInfo?.phone) 
                  ? fullCenterData.contactInfo.phone 
                  : (fullCenterData.contactInfo?.phone ? [fullCenterData.contactInfo.phone] : []),
                email: fullCenterData.contactInfo?.email || fullCenterData.email || '',
                website: fullCenterData.contactInfo?.website || ''
              },
              departments: departments,
              operatingHours: fullCenterData.operatingHours || { openingTime: '09:00', closingTime: '17:00' },
              homeSampleCollection: fullCenterData.homeSampleCollection || false,
              emergencyService: fullCenterData.emergencyService || false,
              ambulanceService: fullCenterData.ambulanceService || { available: false, contactNumber: '' },
              numberOfLabTechnicians: fullCenterData.numberOfLabTechnicians || 0,
              numberOfStaff: fullCenterData.numberOfStaff || 0,
              reportingTime: fullCenterData.reportingTime || 'depends_on_test',
              reportDeliveryOptions: fullCenterData.reportDeliveryOptions || { email: true, onlinePortal: true },
            });
            
            // Initialize raw inputs
            setRawInputs({
              departments: departments.join(', '),
            });
            return; // Success, exit early
          }
        } catch (profileError) {
          // If profile endpoint fails (e.g., not approved), use basic center data
          if (profileError.response?.status === 403) {
            const departments = Array.isArray(centerData.departments) ? centerData.departments : [];
            
            setDiagnosticCenter(centerData);
            setFormData({
              name: centerData.name || '',
              address: centerData.address || '',
              tradeLicenseNumber: centerData.tradeLicenseNumber || '',
              logo: centerData.logo || '',
              contactInfo: {
                phone: Array.isArray(centerData.contactInfo?.phone) 
                  ? centerData.contactInfo.phone 
                  : (centerData.contactInfo?.phone ? [centerData.contactInfo.phone] : []),
                email: centerData.contactInfo?.email || centerData.email || '',
                website: centerData.contactInfo?.website || ''
              },
              departments: departments,
              operatingHours: centerData.operatingHours || { openingTime: '09:00', closingTime: '17:00' },
              homeSampleCollection: centerData.homeSampleCollection || false,
              emergencyService: centerData.emergencyService || false,
              ambulanceService: centerData.ambulanceService || { available: false, contactNumber: '' },
              numberOfLabTechnicians: centerData.numberOfLabTechnicians || 0,
              numberOfStaff: centerData.numberOfStaff || 0,
              reportingTime: centerData.reportingTime || 'depends_on_test',
              reportDeliveryOptions: centerData.reportDeliveryOptions || { email: true, onlinePortal: true },
            });
            
            // Initialize raw inputs
            setRawInputs({
              departments: departments.join(', '),
            });
            setError('Diagnostic center must be approved to view full profile. Some features may be limited.');
            return;
          }
          throw profileError; // Re-throw if it's a different error
        }
      } else {
        setError('Diagnostic center profile not found. Please contact support.');
      }
    } catch (err) {
      console.error('Error fetching diagnostic center profile:', err);
      if (err.response?.status === 403) {
        setError('Diagnostic center must be approved to view profile. Please wait for approval.');
      } else {
        setError(err.response?.data?.message || 'Failed to load diagnostic center profile.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('contactInfo.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          [field]: value
        }
      }));
    } else if (name.startsWith('operatingHours.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        operatingHours: {
          ...prev.operatingHours,
          [field]: value
        }
      }));
    } else if (name.startsWith('ambulanceService.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        ambulanceService: {
          ...prev.ambulanceService,
          [field]: field === 'available' ? checked : value
        }
      }));
    } else if (name.startsWith('reportDeliveryOptions.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        reportDeliveryOptions: {
          ...prev.reportDeliveryOptions,
          [field]: checked
        }
      }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value) || 0
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
      
      // If diagnostic center is approved, exclude critical fields (read-only)
      if (diagnosticCenter?.status === 'approved') {
        const criticalFields = ['name', 'address', 'tradeLicenseNumber'];
        criticalFields.forEach(field => {
          delete updateData[field];
        });
      }
      
      // Ensure logo is included and trimmed
      if (updateData.logo) {
        updateData.logo = updateData.logo.trim();
      }
      
      // Ensure arrays are properly formatted
      if (updateData.departments) {
        updateData.departments = Array.isArray(updateData.departments) 
          ? updateData.departments.filter(d => d && d.trim().length > 0)
          : [];
      }
      
      // Convert phone string to array if needed
      if (typeof updateData.contactInfo.phone === 'string') {
        updateData.contactInfo.phone = updateData.contactInfo.phone
          .split(',')
          .map(p => p.trim())
          .filter(p => p);
      }

      console.log('Sending update data:', updateData);

      const response = await api.put(`/diagnostic-centers/${diagnosticCenter._id}/profile`, updateData);

      if (response.data.success) {
        const updatedCenter = response.data.data.diagnosticCenter;
        console.log('Updated diagnostic center response:', updatedCenter);
        
        // Update diagnostic center state immediately with the response data
        if (updatedCenter) {
          setDiagnosticCenter(prev => {
            const newCenter = { 
              ...prev, 
              ...updatedCenter
            };
            // Explicitly set logo from response
            newCenter.logo = updatedCenter.logo !== undefined ? updatedCenter.logo : prev.logo;
            console.log('Updated diagnostic center state with logo:', newCenter.logo);
            return newCenter;
          });
          
          // Reset logo error since we have a new logo
          if (updatedCenter.logo) {
            setLogoError(false);
          }
          
          // Also update form data to reflect changes
          const updatedDepartments = updatedCenter.departments || [];
          
          setFormData(prev => ({
            ...prev,
            logo: updatedCenter.logo !== undefined ? updatedCenter.logo : prev.logo,
            contactInfo: updatedCenter.contactInfo || prev.contactInfo,
            departments: updatedDepartments,
            operatingHours: updatedCenter.operatingHours || prev.operatingHours,
            homeSampleCollection: updatedCenter.homeSampleCollection !== undefined ? updatedCenter.homeSampleCollection : prev.homeSampleCollection,
            emergencyService: updatedCenter.emergencyService !== undefined ? updatedCenter.emergencyService : prev.emergencyService,
            ambulanceService: updatedCenter.ambulanceService || prev.ambulanceService,
            numberOfLabTechnicians: updatedCenter.numberOfLabTechnicians !== undefined ? updatedCenter.numberOfLabTechnicians : prev.numberOfLabTechnicians,
            numberOfStaff: updatedCenter.numberOfStaff !== undefined ? updatedCenter.numberOfStaff : prev.numberOfStaff,
            reportingTime: updatedCenter.reportingTime || prev.reportingTime,
            reportDeliveryOptions: updatedCenter.reportDeliveryOptions || prev.reportDeliveryOptions,
          }));
          
          // Update raw inputs to match
          setRawInputs(prev => ({
            ...prev,
            departments: Array.isArray(updatedDepartments) ? updatedDepartments.join(', ') : '',
          }));
        }
        
        setSuccess('Diagnostic center profile updated successfully!');
        setEditing(false);
        
        // Refresh full profile
        setTimeout(async () => {
          try {
            await fetchDiagnosticCenterProfile();
          } catch (err) {
            console.warn('Profile refresh failed, but update was successful:', err);
          }
        }, 1000);
        
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Error updating diagnostic center profile:', err);
      setError(err.response?.data?.message || 'Failed to update diagnostic center profile.');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      approved: { label: 'Approved', class: 'status-approved' },
      pending_super_admin: { label: 'Pending Approval', class: 'status-pending' },
      rejected: { label: 'Rejected', class: 'status-rejected' },
      suspended: { label: 'Suspended', class: 'status-suspended' },
    };
    
    const config = statusConfig[status] || { label: status, class: 'status-pending' };
    return <span className={`status-badge ${config.class}`}>{config.label}</span>;
  };

  const isReadOnly = diagnosticCenter?.status === 'approved';

  if (loading) {
    return (
      <div className="diagnostic-center-profile-container">
        <Navbar />
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading diagnostic center profile...</p>
        </div>
      </div>
    );
  }

  if (error && !diagnosticCenter) {
    return (
      <div className="diagnostic-center-profile-container">
        <Navbar />
        <div className="error-state">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <h2>Error Loading Profile</h2>
          <p>{error}</p>
          <button onClick={fetchDiagnosticCenterProfile} className="retry-button">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="diagnostic-center-profile-container">
      <Navbar />
      <div className="diagnostic-center-profile-header">
        <div className="header-content">
          <div className="diagnostic-center-logo-section">
            {diagnosticCenter.logo && diagnosticCenter.logo.trim() && !logoError ? (
              <img 
                src={diagnosticCenter.logo.trim()} 
                alt="Diagnostic Center Logo" 
                className="diagnostic-center-logo"
                key={`${diagnosticCenter._id}-${diagnosticCenter.logo}`}
                onLoad={() => {
                  setLogoError(false);
                  console.log('Logo loaded successfully:', diagnosticCenter.logo);
                }}
                onError={(e) => {
                  console.error('Logo failed to load:', diagnosticCenter.logo);
                  setLogoError(true);
                  e.target.style.display = 'none';
                }}
              />
            ) : null}
            {(!diagnosticCenter.logo || !diagnosticCenter.logo.trim() || logoError) && (
              <div className="diagnostic-center-logo-placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" strokeWidth="2"/>
                </svg>
                {logoError && diagnosticCenter.logo && (
                  <span className="logo-error-text">Invalid URL</span>
                )}
              </div>
            )}
          </div>
          <div className="diagnostic-center-title-section">
            <h1>{diagnosticCenter.name}</h1>
            <div className="diagnostic-center-meta">
              {getStatusBadge(diagnosticCenter.status)}
              <span className="trade-license-number">License: {diagnosticCenter.tradeLicenseNumber}</span>
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
              <button onClick={() => { setEditing(false); fetchDiagnosticCenterProfile(); }} className="cancel-button">
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

      <div className="diagnostic-center-profile-content">
        <div className="profile-section">
          <h2 className="section-title">Basic Information</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Diagnostic Center Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!editing || isReadOnly}
                className={isReadOnly ? 'read-only' : ''}
                placeholder="Diagnostic center name"
              />
              {isReadOnly && <small className="read-only-hint">Cannot be changed after approval</small>}
            </div>

            <div className="form-group">
              <label>Trade License Number</label>
              <input
                type="text"
                name="tradeLicenseNumber"
                value={formData.tradeLicenseNumber}
                onChange={handleChange}
                disabled={!editing || isReadOnly}
                className={isReadOnly ? 'read-only' : ''}
                placeholder="Trade license number"
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
                placeholder="Diagnostic center address"
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
                placeholder="contact@diagnostic.com"
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
                placeholder="https://www.diagnostic.com"
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
              placeholder="Pathology, Radiology, Cardiology"
            />
            <small className="field-hint">Separate multiple items with commas (e.g., Pathology, Radiology, Cardiology)</small>
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
          <h2 className="section-title">Operating Hours</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Opening Time</label>
              <input
                type="time"
                name="operatingHours.openingTime"
                value={formData.operatingHours.openingTime}
                onChange={handleChange}
                disabled={!editing}
              />
            </div>
            <div className="form-group">
              <label>Closing Time</label>
              <input
                type="time"
                name="operatingHours.closingTime"
                value={formData.operatingHours.closingTime}
                onChange={handleChange}
                disabled={!editing}
              />
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h2 className="section-title">Services</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="homeSampleCollection"
                  checked={formData.homeSampleCollection}
                  onChange={handleChange}
                  disabled={!editing}
                />
                Home Sample Collection
              </label>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="emergencyService"
                  checked={formData.emergencyService}
                  onChange={handleChange}
                  disabled={!editing}
                />
                Emergency Service
              </label>
            </div>
            <div className="form-group full-width">
              <label>
                <input
                  type="checkbox"
                  name="ambulanceService.available"
                  checked={formData.ambulanceService.available}
                  onChange={handleChange}
                  disabled={!editing}
                />
                Ambulance Service Available
              </label>
              {formData.ambulanceService.available && (
                <input
                  type="text"
                  name="ambulanceService.contactNumber"
                  value={formData.ambulanceService.contactNumber}
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="Ambulance contact number"
                  style={{ marginTop: '8px' }}
                />
              )}
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h2 className="section-title">Staff Information</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Number of Lab Technicians</label>
              <input
                type="number"
                name="numberOfLabTechnicians"
                value={formData.numberOfLabTechnicians}
                onChange={handleChange}
                disabled={!editing}
                min="0"
              />
            </div>
            <div className="form-group">
              <label>Total Staff</label>
              <input
                type="number"
                name="numberOfStaff"
                value={formData.numberOfStaff}
                onChange={handleChange}
                disabled={!editing}
                min="0"
              />
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h2 className="section-title">Reporting & Delivery</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Reporting Time</label>
              <select
                name="reportingTime"
                value={formData.reportingTime}
                onChange={handleChange}
                disabled={!editing}
              >
                <option value="same_day">Same Day</option>
                <option value="24_hours">24 Hours</option>
                <option value="depends_on_test">Depends on Test</option>
              </select>
            </div>
            <div className="form-group">
              <label>Report Delivery Options</label>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="reportDeliveryOptions.email"
                    checked={formData.reportDeliveryOptions.email}
                    onChange={handleChange}
                    disabled={!editing}
                    className="checkbox-input"
                  />
                  <span>Email Delivery</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="reportDeliveryOptions.onlinePortal"
                    checked={formData.reportDeliveryOptions.onlinePortal}
                    onChange={handleChange}
                    disabled={!editing}
                    className="checkbox-input"
                  />
                  <span>Online Portal</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h2 className="section-title">Associated Doctors</h2>
          {loadingDoctors ? (
            <div className="loading-doctors">
              <div className="spinner"></div>
              <p>Loading doctors...</p>
            </div>
          ) : associatedDoctors.length > 0 ? (
            <>
              <p className="doctors-count">Total: {associatedDoctors.length} doctor(s)</p>
              <div className="doctors-grid">
                {associatedDoctors.map((doctor) => (
                  <div key={doctor._id} className="doctor-card">
                    <div className="doctor-info">
                      <h4>{doctor.name || 'Unknown'}</h4>
                      <p className="doctor-email">{doctor.email || 'N/A'}</p>
                      {doctor.specialization && (
                        <span className="doctor-dept">
                          {Array.isArray(doctor.specialization) 
                            ? doctor.specialization.join(', ') 
                            : doctor.specialization}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-doctors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <p>No doctors assigned yet</p>
              <small>Doctors linked to this diagnostic center will appear here</small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiagnosticCenterProfile;

