# User Home Service Request API

Complete guide for users/patients to submit home service requests for both hospitals and diagnostic centers.

---

## 🔐 Authentication

**Required**: User must be authenticated with a patient token

---

## 📋 Submit Home Service Request

### Endpoint
**POST** `/api/patient/home-services/request`

**Description**: Submit a request for a home service (hospital or diagnostic center)

**Authentication**: Required (Patient token)

---

## Request Body

### For Hospital Home Service:
```json
{
  "hospitalId": "507f1f77bcf86cd799439011",
  "homeServiceId": "507f1f77bcf86cd799439012",
  "patientName": "John Doe",
  "patientAge": 35,
  "patientGender": "male",
  "homeAddress": {
    "street": "123 Main Street",
    "city": "City",
    "state": "State",
    "zipCode": "12345",
    "country": "Country",
    "coordinates": {
      "latitude": 40.7128,
      "longitude": -74.0060
    }
  },
  "phoneNumber": "+1234567890",
  "requestedDate": "2024-01-20",
  "requestedTime": "14:00",
  "notes": "Patient has mobility issues"
}
```

### For Diagnostic Center Home Service:
```json
{
  "diagnosticCenterId": "507f1f77bcf86cd799439011",
  "homeServiceId": "507f1f77bcf86cd799439012",
  "patientName": "John Doe",
  "patientAge": 35,
  "patientGender": "male",
  "homeAddress": {
    "street": "123 Main Street",
    "city": "City",
    "state": "State",
    "zipCode": "12345",
    "country": "Country",
    "coordinates": {
      "latitude": 40.7128,
      "longitude": -74.0060
    }
  },
  "phoneNumber": "+1234567890",
  "requestedDate": "2024-01-20",
  "requestedTime": "14:00",
  "notes": "Patient has mobility issues"
}
```

---

## Request Fields

### Required Fields:

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `hospitalId` OR `diagnosticCenterId` | String | ID of hospital or diagnostic center | `"507f1f77bcf86cd799439011"` |
| `homeServiceId` | String | ID of the home service | `"507f1f77bcf86cd799439012"` |
| `patientName` | String | Name of the patient | `"John Doe"` |
| `patientAge` | Number | Age of the patient (min: 0) | `35` |
| `patientGender` | String | Gender: `male`, `female`, or `other` | `"male"` |
| `homeAddress.street` | String | Street address | `"123 Main Street"` |
| `homeAddress.city` | String | City name | `"City"` |
| `phoneNumber` | String | Contact phone number | `"+1234567890"` |

### Optional Fields:

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `homeAddress.state` | String | State/Province | `"State"` |
| `homeAddress.zipCode` | String | ZIP/Postal code | `"12345"` |
| `homeAddress.country` | String | Country name | `"Country"` |
| `homeAddress.coordinates.latitude` | Number | Latitude for mapping | `40.7128` |
| `homeAddress.coordinates.longitude` | Number | Longitude for mapping | `-74.0060` |
| `requestedDate` | String (ISO 8601) | Preferred date for service | `"2024-01-20"` |
| `requestedTime` | String (HH:mm) | Preferred time for service | `"14:00"` |
| `notes` | String | Additional notes or instructions | `"Patient has mobility issues"` |

---

## Validation Rules

1. **Either `hospitalId` OR `diagnosticCenterId` must be provided** (not both, not neither)
2. `patientAge` must be a non-negative integer
3. `patientGender` must be one of: `male`, `female`, `other`
4. `requestedDate` must be in ISO 8601 format (YYYY-MM-DD)
5. `requestedTime` must be in HH:mm format (24-hour, e.g., "14:00")
6. `homeAddress.street` and `homeAddress.city` are required
7. `phoneNumber` is required

---

## Example Requests

### Example 1: Request Hospital Home Service (Full Details)
```bash
POST http://localhost:5000/api/patient/home-services/request
Authorization: Bearer <patient_token>
Content-Type: application/json

{
  "hospitalId": "507f1f77bcf86cd799439011",
  "homeServiceId": "507f1f77bcf86cd799439012",
  "patientName": "John Doe",
  "patientAge": 35,
  "patientGender": "male",
  "homeAddress": {
    "street": "123 Main Street",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA",
    "coordinates": {
      "latitude": 40.7128,
      "longitude": -74.0060
    }
  },
  "phoneNumber": "+1234567890",
  "requestedDate": "2024-01-20",
  "requestedTime": "14:00",
  "notes": "Patient has mobility issues. Please use ground floor entrance."
}
```

### Example 2: Request Diagnostic Center Home Service (Minimal Details)
```bash
POST http://localhost:5000/api/patient/home-services/request
Authorization: Bearer <patient_token>
Content-Type: application/json

{
  "diagnosticCenterId": "507f1f77bcf86cd799439011",
  "homeServiceId": "507f1f77bcf86cd799439012",
  "patientName": "Jane Smith",
  "patientAge": 28,
  "patientGender": "female",
  "homeAddress": {
    "street": "456 Oak Avenue",
    "city": "Los Angeles"
  },
  "phoneNumber": "+1987654321"
}
```

### Example 3: Request with Coordinates (For Mapping)
```bash
POST http://localhost:5000/api/patient/home-services/request
Authorization: Bearer <patient_token>
Content-Type: application/json

{
  "diagnosticCenterId": "507f1f77bcf86cd799439011",
  "homeServiceId": "507f1f77bcf86cd799439012",
  "patientName": "Robert Johnson",
  "patientAge": 45,
  "patientGender": "male",
  "homeAddress": {
    "street": "789 Pine Road",
    "city": "Chicago",
    "state": "IL",
    "zipCode": "60601",
    "country": "USA",
    "coordinates": {
      "latitude": 41.8781,
      "longitude": -87.6298
    }
  },
  "phoneNumber": "+1555123456",
  "requestedDate": "2024-01-25",
  "requestedTime": "10:00",
  "notes": "Please call 30 minutes before arrival"
}
```

---

## Success Response

**Status Code**: `201 Created`

```json
{
  "success": true,
  "message": "Home service request submitted successfully",
  "data": {
    "request": {
      "_id": "507f1f77bcf86cd799439013",
      "requestNumber": "HSR-1705123456-ABC123",
      "patientId": "507f1f77bcf86cd799439014",
      "hospitalId": "507f1f77bcf86cd799439011",
      "diagnosticCenterId": null,
      "homeServiceId": "507f1f77bcf86cd799439012",
      "patientName": "John Doe",
      "patientAge": 35,
      "patientGender": "male",
      "homeAddress": {
        "street": "123 Main Street",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "country": "USA",
        "coordinates": {
          "latitude": 40.7128,
          "longitude": -74.0060
        }
      },
      "phoneNumber": "+1234567890",
      "serviceType": "Home Sample Collection",
      "servicePrice": 500,
      "serviceNote": "Our lab technician will collect samples from your home",
      "status": "pending",
      "requestedDate": "2024-01-20T00:00:00.000Z",
      "requestedTime": "14:00",
      "notes": "Patient has mobility issues",
      "hospital": {
        "id": "507f1f77bcf86cd799439011",
        "name": "City General Hospital"
      },
      "diagnosticCenter": null,
      "service": {
        "id": "507f1f77bcf86cd799439012",
        "serviceType": "Home Sample Collection",
        "price": 500
      },
      "createdAt": "2024-01-16T10:00:00.000Z",
      "updatedAt": "2024-01-16T10:00:00.000Z"
    }
  }
}
```

---

## Error Responses

### 400 Bad Request - Validation Failed
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Either hospitalId or diagnosticCenterId is required",
      "param": "hospitalId",
      "location": "body"
    },
    {
      "msg": "Patient name is required",
      "param": "patientName",
      "location": "body"
    }
  ]
}
```

### 400 Bad Request - Both IDs Provided
```json
{
  "success": false,
  "message": "Cannot specify both hospitalId and diagnosticCenterId"
}
```

### 400 Bad Request - Neither ID Provided
```json
{
  "success": false,
  "message": "Either hospitalId or diagnosticCenterId is required"
}
```

### 404 Not Found - Hospital/Diagnostic Center Not Approved
```json
{
  "success": false,
  "message": "Hospital not found or not approved"
}
```

or

```json
{
  "success": false,
  "message": "Diagnostic center not found or not approved"
}
```

### 404 Not Found - Home Service Not Available
```json
{
  "success": false,
  "message": "Home service not found or not available"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "No token provided. Access denied."
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to submit home service request",
  "error": "Error message details"
}
```

---

## What Happens After Submission

1. **Request Created**: 
   - Unique request number generated (format: `HSR-{timestamp}-{random}`)
   - Status set to `pending`
   - Service details saved as snapshot (type, price, note)

2. **Notifications Sent**:
   - **To Patient**: "Home Service Request Submitted" notification
   - **To Hospital/Diagnostic Center Admins**: "New Home Service Request" notification (sent to all admins)

3. **Request Status**: 
   - Initially: `pending`
   - Admin can later: `accept` or `reject`
   - Patient will receive notification when status changes

---

## Request Number Format

Each request gets a unique request number:
- Format: `HSR-{timestamp}-{random}`
- Example: `HSR-1705123456-ABC123`
- Used for tracking and reference

---

## Service Details Snapshot

When a request is submitted, the following service details are saved as a snapshot:
- `serviceType` - Type of service (e.g., "Home Sample Collection")
- `servicePrice` - Price at time of request
- `serviceNote` - Service description/note

This ensures that even if the service is later modified, the request retains the original information.

---

## Address Format

### Minimum Required:
```json
{
  "street": "123 Main Street",
  "city": "City"
}
```

### Complete Format:
```json
{
  "street": "123 Main Street",
  "city": "City",
  "state": "State",
  "zipCode": "12345",
  "country": "Country",
  "coordinates": {
    "latitude": 40.7128,
    "longitude": -74.0060
  }
}
```

**Coordinates** are optional but recommended for:
- Accurate mapping
- Route planning
- GPS navigation

---

## Time Format

- **Date**: ISO 8601 format (YYYY-MM-DD)
  - Example: `"2024-01-20"`
  
- **Time**: 24-hour format (HH:mm)
  - Example: `"14:00"` (2:00 PM)
  - Example: `"09:00"` (9:00 AM)
  - Example: `"17:30"` (5:30 PM)

---

## Complete Example: cURL

### Hospital Home Service Request
```bash
curl -X POST http://localhost:5000/api/patient/home-services/request \
  -H "Authorization: Bearer YOUR_PATIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "hospitalId": "507f1f77bcf86cd799439011",
    "homeServiceId": "507f1f77bcf86cd799439012",
    "patientName": "John Doe",
    "patientAge": 35,
    "patientGender": "male",
    "homeAddress": {
      "street": "123 Main Street",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    },
    "phoneNumber": "+1234567890",
    "requestedDate": "2024-01-20",
    "requestedTime": "14:00",
    "notes": "Patient has mobility issues"
  }'
```

### Diagnostic Center Home Service Request
```bash
curl -X POST http://localhost:5000/api/patient/home-services/request \
  -H "Authorization: Bearer YOUR_PATIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "diagnosticCenterId": "507f1f77bcf86cd799439011",
    "homeServiceId": "507f1f77bcf86cd799439012",
    "patientName": "Jane Smith",
    "patientAge": 28,
    "patientGender": "female",
    "homeAddress": {
      "street": "456 Oak Avenue",
      "city": "Los Angeles",
      "state": "CA",
      "zipCode": "90001"
    },
    "phoneNumber": "+1987654321",
    "requestedDate": "2024-01-22",
    "requestedTime": "10:00"
  }'
```

---

## JavaScript/Fetch Example

```javascript
const submitHomeServiceRequest = async (requestData) => {
  try {
    const response = await fetch('http://localhost:5000/api/patient/home-services/request', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${patientToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        diagnosticCenterId: '507f1f77bcf86cd799439011',
        homeServiceId: '507f1f77bcf86cd799439012',
        patientName: 'John Doe',
        patientAge: 35,
        patientGender: 'male',
        homeAddress: {
          street: '123 Main Street',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
          coordinates: {
            latitude: 40.7128,
            longitude: -74.0060
          }
        },
        phoneNumber: '+1234567890',
        requestedDate: '2024-01-20',
        requestedTime: '14:00',
        notes: 'Patient has mobility issues'
      })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('Request submitted:', data.data.request.requestNumber);
      return data.data.request;
    } else {
      console.error('Error:', data.message);
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
};
```

---

## Python Example

```python
import requests

def submit_home_service_request(patient_token, request_data):
    url = "http://localhost:5000/api/patient/home-services/request"
    headers = {
        "Authorization": f"Bearer {patient_token}",
        "Content-Type": "application/json"
    }
    
    response = requests.post(url, json=request_data, headers=headers)
    
    if response.status_code == 201:
        data = response.json()
        print(f"Request submitted: {data['data']['request']['requestNumber']}")
        return data['data']['request']
    else:
        print(f"Error: {response.json()['message']}")
        return None

# Example usage
request_data = {
    "diagnosticCenterId": "507f1f77bcf86cd799439011",
    "homeServiceId": "507f1f77bcf86cd799439012",
    "patientName": "John Doe",
    "patientAge": 35,
    "patientGender": "male",
    "homeAddress": {
        "street": "123 Main Street",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001"
    },
    "phoneNumber": "+1234567890",
    "requestedDate": "2024-01-20",
    "requestedTime": "14:00"
}

result = submit_home_service_request("YOUR_PATIENT_TOKEN", request_data)
```

---

## Important Notes

1. **Authentication Required**: User must be logged in as a patient to submit requests

2. **Either/Or**: Provide either `hospitalId` OR `diagnosticCenterId`, not both

3. **Service Must Be Active**: The home service must exist and be active (`isActive: true`)

4. **Hospital/Diagnostic Center Must Be Approved**: Only approved facilities can receive requests

5. **Request Number**: Save the `requestNumber` from the response for tracking

6. **Status Tracking**: After submission, request status is `pending`. Check status later via history endpoint

7. **Notifications**: You will receive notifications when the request is accepted or rejected

8. **Address Accuracy**: Provide accurate address details for service delivery

9. **Coordinates Optional**: GPS coordinates are optional but help with accurate location

10. **Date/Time Format**: 
    - Date: YYYY-MM-DD (e.g., "2024-01-20")
    - Time: HH:mm (24-hour format, e.g., "14:00")

---

## Viewing Your Requests

After submitting a request, you can view it in your history:

**GET** `/api/patient/history?type=home_services`

This will show all your home service requests (both hospital and diagnostic center) with their current status.

---

## Request Status Values

- **`pending`** - Request submitted, awaiting admin review
- **`accepted`** - Request accepted by admin
- **`rejected`** - Request rejected by admin (with reason)
- **`completed`** - Service has been completed
- **`cancelled`** - Request was cancelled

---

**Ready to submit home service requests!** ✅

