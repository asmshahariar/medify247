# Doctor Search Feature Implementation

## Overview

The Doctor Search feature allows users to search for doctors using multiple search options within the platform. The system supports various search combinations and provides complete doctor information including profile, department, schedule, fees, and hospital details.

---

## Features

### 1. **Multiple Search Options**

Users can search doctors using:

#### Search by Hospital
- **Hospital name only** - View all doctors available in that hospital
- **Hospital name + Doctor name** - Find specific doctor in a hospital
- **Hospital name + Department** - Find all doctors in a specific department of a hospital

#### Search without Hospital
- **Doctor name only** - Search across all hospitals
- **Department name only** - Find all doctors in a department across all hospitals

#### Additional Filters
- **Specialization** - Filter by medical specialization

### 2. **Complete Doctor Information**

When viewing a doctor's profile, users can see:
- **Profile Information**: Name, bio, description, photo, qualifications, experience
- **Department**: Department information from hospital associations
- **Schedule**: Visiting days and time slots for each chamber
- **Fees**: Consultation fee, follow-up fee, report fee
- **Hospital Information**: All hospitals where the doctor practices
- **Chambers**: All active chambers with location and fees
- **Ratings**: Doctor ratings and reviews
- **Contact Information**: Phone, email, emergency availability

---

## API Endpoints

### Base URLs
- **Public (No Authentication)**: `/api/shared/doctors`
- **Authenticated (Patient)**: `/api/patient/doctors`

### 1. Search Doctors

**GET** `/api/shared/doctors/search` or `/api/patient/doctors/search`

**Query Parameters:**
- `hospitalName` (optional) - Search by hospital name
- `doctorName` (optional) - Search by doctor name
- `department` (optional) - Search by department name
- `specialization` (optional) - Filter by specialization
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 20)

**Search Scenarios:**

#### Scenario 1: Search by Hospital Name Only
```
GET /api/shared/doctors/search?hospitalName=City General Hospital
```
Returns all doctors associated with the specified hospital.

#### Scenario 2: Search by Hospital Name + Doctor Name
```
GET /api/shared/doctors/search?hospitalName=City General Hospital&doctorName=Dr. Smith
```
Returns doctors matching the name within the specified hospital.

#### Scenario 3: Search by Hospital Name + Department
```
GET /api/shared/doctors/search?hospitalName=City General Hospital&department=Cardiology
```
Returns all doctors in the specified department of the hospital.

#### Scenario 4: Search by Doctor Name Only
```
GET /api/shared/doctors/search?doctorName=Dr. Smith
```
Returns all doctors matching the name across all hospitals.

#### Scenario 5: Search by Department Only
```
GET /api/shared/doctors/search?department=Cardiology
```
Returns all doctors in the specified department across all hospitals.

#### Scenario 6: Combined Search
```
GET /api/shared/doctors/search?hospitalName=City General Hospital&doctorName=Dr. Smith&department=Cardiology&specialization=Cardiology
```
Returns doctors matching all specified criteria.

**Response:**
```json
{
  "success": true,
  "data": {
    "doctors": [
      {
        "_id": "...",
        "name": "Dr. John Smith",
        "email": "dr.smith@example.com",
        "phone": "+1234567890",
        "bio": "Experienced cardiologist...",
        "description": "Specialized in...",
        "profilePhotoUrl": "https://...",
        "specialization": ["Cardiology", "Internal Medicine"],
        "qualifications": "MBBS, MD, FACC",
        "experienceYears": 15,
        "consultationFee": 1500,
        "followUpFee": 1000,
        "reportFee": 500,
        "visitingDays": [
          {
            "dayOfWeek": 1,
            "startTime": "09:00",
            "endTime": "17:00"
          }
        ],
        "rating": {
          "average": 4.5,
          "count": 120
        },
        "hospitals": [
          {
            "hospitalId": "...",
            "hospitalName": "City General Hospital",
            "address": "123 Main St, City",
            "logo": "https://...",
            "department": "Cardiology",
            "designation": "Senior Consultant"
          }
        ],
        "chambers": [
          {
            "chamberId": "...",
            "name": "Cardiology Chamber",
            "address": {
              "street": "Hospital Building, Floor 2",
              "city": "City",
              "state": "State"
            },
            "consultationFee": 1500,
            "followUpFee": 1000,
            "hospital": {
              "hospitalId": "...",
              "name": "City General Hospital",
              "address": "123 Main St",
              "logo": "https://..."
            }
          }
        ]
      }
    ],
    "total": 25,
    "page": 1,
    "limit": 20,
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 25,
      "pages": 2
    }
  }
}
```

### 2. Get Doctor Details

**GET** `/api/shared/doctors/:doctorId` or `/api/patient/doctors/:doctorId`

**URL Parameters:**
- `doctorId` - Doctor's unique ID

**Response:**
```json
{
  "success": true,
  "data": {
    "doctor": {
      "doctorId": "...",
      "name": "Dr. John Smith",
      "email": "dr.smith@example.com",
      "phone": "+1234567890",
      "bio": "Experienced cardiologist with 15 years of experience...",
      "description": "Specialized in cardiac care and preventive medicine...",
      "profilePhotoUrl": "https://...",
      "specialization": ["Cardiology", "Internal Medicine"],
      "qualifications": "MBBS, MD, FACC",
      "experienceYears": 15,
      "medicalLicenseNumber": "MD12345",
      "consultationFee": 1500,
      "followUpFee": 1000,
      "reportFee": 500,
      "visitingDays": [
        {
          "dayOfWeek": 1,
          "startTime": "09:00",
          "endTime": "17:00"
        },
        {
          "dayOfWeek": 3,
          "startTime": "09:00",
          "endTime": "17:00"
        }
      ],
      "chamber": {
        "name": "Cardiology Chamber",
        "address": "Hospital Building, Floor 2",
        "daysOpen": ["Monday", "Wednesday", "Friday"],
        "hours": "9:00 AM - 5:00 PM"
      },
      "emergencyAvailability": {
        "available": true,
        "contactNumber": "+1234567890",
        "notes": "Available 24/7 for emergencies"
      },
      "socialLinks": {
        "website": "https://drsmith.com",
        "linkedin": "https://linkedin.com/in/drsmith"
      },
      "rating": {
        "average": 4.5,
        "count": 120
      },
      "holidays": [],
      "hospitals": [
        {
          "hospitalId": "...",
          "hospitalName": "City General Hospital",
          "address": "123 Main St, City, State, ZIP",
          "logo": "https://...",
          "contactInfo": {
            "phone": ["+1234567890"],
            "email": "info@hospital.com",
            "website": "https://hospital.com"
          },
          "departments": ["Cardiology", "Internal Medicine", "Emergency"],
          "department": "Cardiology",
          "designation": "Senior Consultant",
          "joinedAt": "2023-01-15T00:00:00.000Z"
        }
      ],
      "chambers": [
        {
          "chamberId": "...",
          "name": "Cardiology Chamber",
          "address": {
            "street": "Hospital Building, Floor 2",
            "city": "City",
            "state": "State",
            "zipCode": "12345",
            "country": "Country"
          },
          "consultationFee": 1500,
          "followUpFee": 1000,
          "contactInfo": {
            "phone": "+1234567890",
            "email": "chamber@hospital.com"
          },
          "hospital": {
            "hospitalId": "...",
            "name": "City General Hospital",
            "address": "123 Main St",
            "logo": "https://...",
            "contactInfo": {
              "phone": ["+1234567890"],
              "email": "info@hospital.com"
            }
          },
          "schedules": [
            {
              "scheduleId": "...",
              "dayOfWeek": 1,
              "timeSlots": [
                {
                  "startTime": "09:00",
                  "endTime": "12:00",
                  "sessionDuration": 15,
                  "maxPatients": 1
                },
                {
                  "startTime": "14:00",
                  "endTime": "17:00",
                  "sessionDuration": 15,
                  "maxPatients": 1
                }
              ],
              "isActive": true
            }
          ]
        }
      ],
      "createdAt": "2023-01-15T00:00:00.000Z",
      "updatedAt": "2024-01-15T00:00:00.000Z"
    }
  }
}
```

---

## Search Logic

### How Search Works

1. **Hospital Name Search**:
   - Searches hospitals by name (case-insensitive)
   - Finds doctors through:
     - `associatedDoctors` array in Hospital model
     - `Chamber` model where `hospitalId` matches
   - Only includes approved hospitals (`status: 'approved'`)

2. **Department Search**:
   - Searches in hospital `departments` array
   - Searches in `associatedDoctors.department` field
   - Can be combined with hospital name for hospital-specific department search

3. **Doctor Name Search**:
   - Searches doctor `name` field (case-insensitive regex)
   - Can be combined with hospital or department filters

4. **Specialization Filter**:
   - Filters by doctor's `specialization` array
   - Uses exact match within the array

### Search Priority

1. If `hospitalName` is provided:
   - First, find matching hospitals
   - Then, get all doctors from those hospitals
   - Apply additional filters (doctor name, department) on the result set

2. If only `department` is provided:
   - Search all hospitals for the department
   - Find doctors associated with those departments

3. If only `doctorName` is provided:
   - Search all approved doctors by name

4. All searches only return doctors with `status: 'approved'`

---

## Data Consistency

### Doctor-Hospital Relationship

Doctors can be associated with hospitals in two ways:

1. **Direct Association** (`Doctor.hospitalId`):
   - Doctor's primary hospital
   - Set during registration or by hospital admin

2. **Hospital Association** (`Hospital.associatedDoctors`):
   - Doctors linked to hospital with department and designation
   - Can have multiple hospitals
   - Includes department information

3. **Chamber Association** (`Chamber` model):
   - Doctors can have chambers in hospitals
   - Each chamber has its own fees and schedule
   - Links doctor to hospital through `chamber.hospitalId`

### Department Information

Department information comes from:
- `Hospital.departments` - Hospital's department list
- `Hospital.associatedDoctors[].department` - Doctor's specific department in that hospital

---

## Security & Access Control

### Public Access
- Search endpoints are available without authentication
- Anyone can search and view doctor profiles
- Only approved doctors are shown (`status: 'approved'`)
- Only approved hospitals are included (`status: 'approved'`)

### Data Privacy
- Doctor passwords are never returned
- Sensitive information (like rejection reasons) is excluded
- Only active chambers are shown (`isActive: true`)

### Error Responses

**404 Not Found:**
```json
{
  "success": false,
  "message": "Doctor not found"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "Doctor profile is not available"
}
```
(Returned when doctor status is not 'approved')

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Failed to search doctors",
  "error": "Error details"
}
```

---

## Example Usage

### Example 1: Find All Doctors in a Hospital
```bash
GET /api/shared/doctors/search?hospitalName=City General Hospital
```

### Example 2: Find Specific Doctor in Hospital
```bash
GET /api/shared/doctors/search?hospitalName=City General Hospital&doctorName=Dr. Smith
```

### Example 3: Find Cardiology Doctors in Hospital
```bash
GET /api/shared/doctors/search?hospitalName=City General Hospital&department=Cardiology
```

### Example 4: Find All Cardiology Doctors
```bash
GET /api/shared/doctors/search?department=Cardiology
```

### Example 5: Search Doctor by Name
```bash
GET /api/shared/doctors/search?doctorName=Dr. Smith
```

### Example 6: View Complete Doctor Profile
```bash
GET /api/shared/doctors/507f1f77bcf86cd799439011
```

### Example 7: Combined Search with Pagination
```bash
GET /api/shared/doctors/search?hospitalName=City General Hospital&department=Cardiology&specialization=Cardiology&page=1&limit=10
```

---

## Files Modified

### Controllers
- `src/controllers/patient.controller.js`
  - Updated `searchDoctors` function with comprehensive search logic
  - Updated `getDoctorDetails` function with complete doctor information

### Routes
- `src/routes/shared.routes.js`
  - Added public doctor search endpoint
  - Added public doctor details endpoint
- `src/routes/patient.routes.js`
  - Existing routes remain for authenticated users

### Models Used
- `Doctor` - Doctor information
- `Hospital` - Hospital information and associations
- `Chamber` - Chamber information and fees
- `Schedule` - Doctor schedules for chambers

---

## Search Performance

### Indexes
The search uses existing indexes:
- `Doctor.status` - For filtering approved doctors
- `Hospital.status` - For filtering approved hospitals
- `Hospital.name` - For hospital name search
- `Doctor.name` - For doctor name search
- `Chamber.hospitalId` - For finding doctors in hospitals

### Optimization
- Pagination is applied after filtering
- Only necessary fields are selected
- Population is limited to required fields
- Results are sorted for consistency

---

## Notes

1. **Case-Insensitive Search**: All text searches are case-insensitive using regex with `$options: 'i'`

2. **Approved Status Only**: Only doctors and hospitals with `status: 'approved'` are shown in search results

3. **Active Chambers Only**: Only chambers with `isActive: true` are included

4. **Department Matching**: Department search uses partial matching (contains), so "Cardio" will match "Cardiology"

5. **Multiple Hospitals**: A doctor can be associated with multiple hospitals, and all associations are returned

6. **Chamber Fees**: Each chamber can have different fees, which are shown separately from doctor's default fees

7. **Schedule Information**: Schedules are linked to chambers, so each chamber can have different schedules

---

## Testing

### Test Scenarios

1. **Search by Hospital Name**
   - Should return all doctors in the hospital
   - Should handle hospital name variations

2. **Search by Hospital + Doctor Name**
   - Should return only matching doctors in the hospital
   - Should handle partial name matches

3. **Search by Hospital + Department**
   - Should return all doctors in the department
   - Should handle department name variations

4. **Search by Doctor Name Only**
   - Should return all matching doctors across hospitals
   - Should handle partial name matches

5. **Search by Department Only**
   - Should return all doctors in the department across hospitals
   - Should handle department name variations

6. **Get Doctor Details**
   - Should return complete doctor information
   - Should include all hospitals and chambers
   - Should include schedules for each chamber

7. **Pagination**
   - Should work correctly with all search combinations
   - Should return correct total count

8. **Empty Results**
   - Should handle cases where no doctors match
   - Should return empty array with proper pagination info

---

**Feature Status:** ✅ Complete and Ready for Use

