# Home Service Feature Implementation

## Overview

The Home Service feature allows hospital admins to manage different types of home services offered by their hospital. This includes setting prices, availability times, and defining off days when services are unavailable.

---

## Features

### 1. **Add Home Services**
Hospital admins can add different types of home services such as:
- Home doctor visit
- Home nursing
- Sample collection
- And any other custom service types

### 2. **Service Configuration**
Each home service includes:
- **Service Type**: Name/type of the service (required)
- **Price**: Cost of the service (required, must be positive)
- **Note**: Optional short description/note about the service
- **Available Time**: Start and end time when the service is available (format: HH:mm)
- **Off Days**: Array of days when the service is unavailable (0=Sunday, 6=Saturday)

### 3. **Service Management**
- View all home services for the hospital
- View a specific home service
- Update existing home services
- Delete home services
- Filter services by active/inactive status
---
## API Endpoints

All endpoints require authentication and hospital admin role. The hospital admin can only manage services for their own hospital.

### Base URL
```
/api/hospitals/:hospitalId/home-services
```

### 1. Create Home Service
**POST** `/api/hospitals/:hospitalId/home-services`

**Request Body:**
```json
{
  "serviceType": "home_doctor_visit",
  "price": 1500,
  "note": "Doctor will visit patient's home for consultation",
  "availableTime": {
    "startTime": "09:00",
    "endTime": "17:00"
  },
  "offDays": [0, 6]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Home service created successfully",
  "data": {
    "homeService": {
      "_id": "...",
      "hospitalId": "...",
      "serviceType": "home_doctor_visit",
      "price": 1500,
      "note": "Doctor will visit patient's home for consultation",
      "availableTime": {
        "startTime": "09:00",
        "endTime": "17:00"
      },
      "offDays": [0, 6],
      "isActive": true,
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
}
```

### 2. Get All Home Services
**GET** `/api/hospitals/:hospitalId/home-services?isActive=true`

**Query Parameters:**
- `isActive` (optional): Filter by active status (`true` or `false`)

**Response:**
```json
{
  "success": true,
  "data": {
    "homeServices": [...],
    "count": 5
  }
}
```

### 3. Get Single Home Service
**GET** `/api/hospitals/:hospitalId/home-services/:serviceId`

**Response:**
```json
{
  "success": true,
  "data": {
    "homeService": {...}
  }
}
```

### 4. Update Home Service
**PUT** `/api/hospitals/:hospitalId/home-services/:serviceId`

**Request Body:** (all fields optional)
```json
{
  "serviceType": "home_nursing",
  "price": 2000,
  "note": "Updated note",
  "availableTime": {
    "startTime": "08:00",
    "endTime": "18:00"
  },
  "offDays": [0],
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Home service updated successfully",
  "data": {
    "homeService": {...}
  }
}
```

### 5. Delete Home Service
**DELETE** `/api/hospitals/:hospitalId/home-services/:serviceId`

**Response:**
```json
{
  "success": true,
  "message": "Home service deleted successfully"
}
```

---

## Data Model

### HomeService Schema

```javascript
{
  hospitalId: ObjectId,        // Reference to Hospital (required)
  serviceType: String,          // Type of service (required)
  price: Number,               // Price in currency (required, min: 0)
  note: String,                 // Optional description
  availableTime: {
    startTime: String,          // Format: "HH:mm" (required)
    endTime: String             // Format: "HH:mm" (required)
  },
  offDays: [Number],            // Array of day numbers (0-6)
  isActive: Boolean,            // Service active status (default: true)
  createdAt: Date,
  updatedAt: Date
}
```

### Day Number Reference
- `0` = Sunday
- `1` = Monday
- `2` = Tuesday
- `3` = Wednesday
- `4` = Thursday
- `5` = Friday
- `6` = Saturday

---

## Validation Rules

### Service Type
- Required field
- Must be a non-empty string (trimmed)

### Price
- Required field
- Must be a positive number (≥ 0)

### Note
- Optional field
- String (trimmed)

### Available Time
- Both `startTime` and `endTime` are required
- Format: `HH:mm` (24-hour format)
- Examples: `"09:00"`, `"17:00"`, `"23:59"`
- `endTime` must be after `startTime`

### Off Days
- Optional array
- Each element must be an integer between 0 and 6
- Represents days of the week when service is unavailable

### Is Active
- Optional boolean
- Default: `true`

---

## Security & Access Control

### Authentication
- All endpoints require JWT authentication
- Token must be provided in `Authorization` header: `Bearer <token>`

### Authorization
- Only users with `hospital_admin` role can access these endpoints
- Hospital admin can only manage services for their own hospital
- The `checkHospitalOwnership` middleware ensures the admin belongs to the specified hospital

### Error Responses

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Authentication required"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "Access denied"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Hospital not found"
}
```

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [...]
}
```

---

## Example Usage

### Example 1: Add Home Doctor Visit Service
```bash
POST /api/hospitals/507f1f77bcf86cd799439011/home-services
Authorization: Bearer <hospital_admin_token>

{
  "serviceType": "home_doctor_visit",
  "price": 1500,
  "note": "Qualified doctor will visit patient's home",
  "availableTime": {
    "startTime": "09:00",
    "endTime": "17:00"
  },
  "offDays": [0, 6]
}
```

### Example 2: Add Home Nursing Service
```bash
POST /api/hospitals/507f1f77bcf86cd799439011/home-services
Authorization: Bearer <hospital_admin_token>

{
  "serviceType": "home_nursing",
  "price": 2000,
  "note": "Professional nursing care at home",
  "availableTime": {
    "startTime": "08:00",
    "endTime": "20:00"
  },
  "offDays": []
}
```

### Example 3: Add Sample Collection Service
```bash
POST /api/hospitals/507f1f77bcf86cd799439011/home-services
Authorization: Bearer <hospital_admin_token>

{
  "serviceType": "sample_collection",
  "price": 500,
  "note": "Home sample collection for lab tests",
  "availableTime": {
    "startTime": "07:00",
    "endTime": "19:00"
  },
  "offDays": [0]
}
```

### Example 4: Get All Active Services
```bash
GET /api/hospitals/507f1f77bcf86cd799439011/home-services?isActive=true
Authorization: Bearer <hospital_admin_token>
```

### Example 5: Update Service Price
```bash
PUT /api/hospitals/507f1f77bcf86cd799439011/home-services/507f1f77bcf86cd799439012
Authorization: Bearer <hospital_admin_token>

{
  "price": 1800
}
```

---

## Files Created/Modified

### New Files
- `src/models/HomeService.model.js` - HomeService data model

### Modified Files
- `src/controllers/hospital.controller.js` - Added home service controller functions:
  - `createHomeService`
  - `getHomeServices`
  - `getHomeService`
  - `updateHomeService`
  - `deleteHomeService`
- `src/routes/hospital.routes.js` - Added home service routes

---

## Database Indexes

The HomeService model includes the following indexes for efficient queries:
- `{ hospitalId: 1, isActive: 1 }` - For filtering services by hospital and status
- `{ hospitalId: 1, serviceType: 1 }` - For searching services by type

---

## Notes

1. **Time Format**: All times are stored in `HH:mm` format (24-hour). Examples: `"09:00"`, `"17:00"`, `"23:59"`

2. **Off Days**: If no off days are specified, the service is available all days of the week (subject to available time).

3. **Service Type**: The service type is a free-form string, allowing hospitals to define their own service types. Common examples:
   - `home_doctor_visit`
   - `home_nursing`
   - `sample_collection`
   - `physiotherapy_at_home`
   - `vaccination_at_home`
   - etc.

4. **Default Values**: 
   - If `availableTime` is not provided, defaults to `09:00` - `17:00`
   - If `offDays` is not provided, defaults to empty array (available all days)
   - `isActive` defaults to `true`

5. **Validation**: The model includes pre-save validation to ensure `endTime` is after `startTime`.

---

## Testing

To test the endpoints, use the following flow:

1. **Login as Hospital Admin** to get authentication token
2. **Create a home service** using POST endpoint
3. **List all services** using GET endpoint
4. **Update a service** using PUT endpoint
5. **Delete a service** using DELETE endpoint

All requests must include the `Authorization: Bearer <token>` header.

---

**Feature Status:** ✅ Complete and Ready for Use

