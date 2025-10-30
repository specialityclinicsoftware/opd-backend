# Medical OPD Management System - API Documentation

## Overview

Multi-tenant hospital management system with a two-stage consultation workflow (Nurse Pre-Consultation → Doctor Consultation).

**Base URL:** `http://localhost:3001/api`

---

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### POST /auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "doctor@hospital.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "name": "Dr. John Doe",
      "email": "doctor@hospital.com",
      "role": "doctor",
      "hospitalId": "hospital_id"
    },
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

### POST /auth/refresh-token
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "your_refresh_token"
}
```

### GET /auth/me
Get current user information (requires authentication).

### POST /auth/logout
Logout user (requires authentication).

### POST /auth/change-password
Change user password (requires authentication).

**Request Body:**
```json
{
  "oldPassword": "current_password",
  "newPassword": "new_password"
}
```

---

## Hospital Management

### POST /admin/hospitals
Create a new hospital (Super Admin only).

**Request Body:**
```json
{
  "hospital": {
    "hospitalName": "City Hospital",
    "address": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "phoneNumber": "022-12345678",
    "email": "info@cityhospital.com",
    "registrationNumber": "REG123",
    "subscriptionPlan": "premium"
  },
  "admin": {
    "name": "Admin User",
    "email": "admin@cityhospital.com",
    "password": "admin123",
    "phoneNumber": "9876543210"
  }
}
```

### GET /admin/hospitals
Get all hospitals (Super Admin only).

**Query Parameters:**
- `isActive`: Filter by active status (true/false)

### GET /hospitals/:id
Get hospital details by ID.

### PUT /hospitals/:id
Update hospital information.

### POST /hospitals/:id/activate
Activate a hospital (Super Admin only).

### POST /hospitals/:id/deactivate
Deactivate a hospital (Super Admin only).

### GET /hospitals/:id/stats
Get hospital statistics (user counts by role).

---

## User Management

### POST /hospitals/:hospitalId/users
Create a new user in a hospital (Hospital Admin only).

**Request Body:**
```json
{
  "name": "Dr. Jane Smith",
  "email": "jane@cityhospital.com",
  "password": "password123",
  "role": "doctor",
  "phoneNumber": "9876543210",
  "specialization": "Cardiology",
  "licenseNumber": "LIC12345"
}
```

**Available Roles:**
- `super_admin` - System administrator
- `hospital_admin` - Hospital administrator
- `doctor` - Doctor
- `nurse` - Nurse/Assistant
- `receptionist` - Receptionist (future)

### GET /hospitals/:hospitalId/users
Get all users in a hospital.

**Query Parameters:**
- `role`: Filter by role
- `isActive`: Filter by active status

### GET /hospitals/:hospitalId/doctors
Get all doctors in a hospital.

### GET /hospitals/:hospitalId/nurses
Get all nurses in a hospital.

### GET /users/:id
Get user details by ID.

### PUT /users/:id
Update user information.

### POST /users/:id/activate
Activate a user.

### POST /users/:id/deactivate
Deactivate a user.

### DELETE /users/:id
Delete a user (soft delete).

---

## Patient Management

### POST /patients/register
Register a new patient.

**Request Body:**
```json
{
  "name": "John Patient",
  "phoneNumber": "9876543210",
  "age": 35,
  "gender": "Male",
  "address": "456 Oak Avenue, Mumbai"
}
```

**Note:** `hospitalId` is automatically added from the authenticated user.

### GET /patients
Get all patients in the hospital.

### GET /patients/search?phoneNumber=9876543210
Search patient by phone number.

### GET /patients/:id
Get patient details by ID.

### PUT /patients/:id
Update patient information.

### DELETE /patients/:id
Delete a patient.

---

## Two-Stage Consultation Workflow

### Stage 1: Nurse Pre-Consultation

#### GET /visits/queue/nurse
Get nurse queue (pending and with-nurse visits).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "visit_id",
      "patientId": {
        "name": "John Patient",
        "phoneNumber": "9876543210"
      },
      "status": "pending",
      "visitDate": "2025-10-29T10:00:00.000Z"
    }
  ]
}
```

#### POST /visits/:id/start-pre-consultation
Start pre-consultation (nurse picks up the visit).

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "visit_id",
    "status": "with-nurse",
    "nurseId": "nurse_user_id"
  }
}
```

#### PUT /visits/:id/pre-consultation
Update pre-consultation data.

**Request Body:**
```json
{
  "vitals": {
    "pulseRate": 75,
    "bloodPressure": {
      "systolic": 120,
      "diastolic": 80
    },
    "spO2": 98,
    "temperature": 98.6
  },
  "chiefComplaints": "Fever and cough for 3 days",
  "pastHistory": "No significant past history",
  "familyHistory": "Father has diabetes",
  "maritalHistory": "Married",
  "generalExamination": {
    "pallor": false,
    "icterus": false,
    "clubbing": false,
    "cyanosis": false,
    "lymphadenopathy": false
  },
  "bloodInvestigations": [
    {
      "testName": "Hemoglobin",
      "value": "14.5",
      "unit": "g/dL",
      "referenceRange": "13-17",
      "testDate": "2025-10-29"
    }
  ]
}
```

**Nurse can update:**
- Vitals
- Chief Complaints
- Past/Family/Marital History
- General Examination
- Blood Investigations

#### POST /visits/:id/complete-pre-consultation
Mark pre-consultation as complete (moves to doctor queue).

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "visit_id",
    "status": "ready-for-doctor",
    "preConsultationCompletedAt": "2025-10-29T10:30:00.000Z"
  }
}
```

---

### Stage 2: Doctor Consultation

#### GET /visits/queue/doctor
Get doctor queue (ready-for-doctor and with-doctor visits).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "visit_id",
      "patientId": {
        "name": "John Patient",
        "phoneNumber": "9876543210"
      },
      "status": "ready-for-doctor",
      "preConsultationCompletedAt": "2025-10-29T10:30:00.000Z",
      "vitals": { ... },
      "chiefComplaints": "Fever and cough for 3 days"
    }
  ]
}
```

#### POST /visits/:id/start-consultation
Start consultation (doctor picks up the visit).

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "visit_id",
    "status": "with-doctor",
    "doctorId": "doctor_user_id"
  }
}
```

#### PUT /visits/:id/consultation
Update consultation data.

**Request Body:**
```json
{
  "systemicExamination": {
    "cvs": "S1 S2 heard, no murmur",
    "rs": "Bilateral air entry present",
    "pa": "Soft, non-tender",
    "cns": "Conscious, oriented"
  },
  "diagnosis": "Upper Respiratory Tract Infection",
  "treatment": "Rest and fluids",
  "investigation": "Chest X-ray if symptoms persist",
  "advice": "Take medications as prescribed, return if fever persists",
  "reviewDate": "2025-11-05"
}
```

**Doctor can update:**
- Systemic Examination (CVS, RS, PA, CNS)
- Diagnosis
- Treatment
- Investigation orders
- Advice
- Review Date

**Doctor can also edit nurse data** (if hospital settings allow):
- If `allowNurseEdit` is enabled in hospital settings, doctor can modify vitals and history

#### POST /visits/:id/finalize
Finalize the visit (marks as completed).

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "visit_id",
    "status": "completed",
    "consultationCompletedAt": "2025-10-29T11:00:00.000Z"
  }
}
```

---

## Visit Management

### POST /visits
Create a new visit (any role can create).

**Request Body:**
```json
{
  "patientId": "patient_id",
  "visitDate": "2025-10-29"
}
```

**Note:** Visit is created with `status: "pending"` and `hospitalId` is automatically added.

### GET /visits/:id
Get visit details by ID.

### POST /visits/:id/cancel
Cancel a visit.

**Request Body:**
```json
{
  "reason": "Patient did not show up"
}
```

### GET /hospitals/:hospitalId/visits
Get all visits for a hospital with filters.

**Query Parameters:**
- `status`: Filter by status (pending, with-nurse, ready-for-doctor, with-doctor, completed, cancelled)
- `startDate`: Filter by start date
- `endDate`: Filter by end date
- `doctorId`: Filter by doctor ID
- `nurseId`: Filter by nurse ID

### GET /visits/patient/:patientId
Get all visits for a patient.

### GET /visits/patient/:patientId/latest
Get latest visit for a patient.

### GET /visits/patient/:patientId/history
Get complete patient history (patient info + all visits).

---

## Medication/Prescription Management

### POST /medications
Add medication history for a visit.

**Request Body:**
```json
{
  "patientId": "patient_id",
  "visitId": "visit_id",
  "diagnosis": "Upper Respiratory Tract Infection",
  "medications": [
    {
      "medicineName": "Paracetamol",
      "dosage": "500mg",
      "frequency": "TDS",
      "duration": "5 days",
      "route": "Oral",
      "instructions": "Take after meals",
      "timing": "Morning-Afternoon-Night"
    }
  ],
  "notes": "Follow up if symptoms persist"
}
```

### GET /medications/patient/:patientId
Get all prescriptions for a patient.

### GET /medications/patient/:patientId/recent
Get recent prescriptions (last 5).

### GET /medications/visit/:visitId
Get prescriptions for a specific visit.

### PUT /medications/:id
Update medication history.

### DELETE /medications/:id
Delete medication history.

---

## Visit Status Flow

```
pending
  ↓ (Nurse starts pre-consultation)
with-nurse
  ↓ (Nurse completes pre-consultation)
ready-for-doctor
  ↓ (Doctor starts consultation)
with-doctor
  ↓ (Doctor finalizes visit)
completed

Any status can be → cancelled
```

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error message description",
  "error": "Detailed error (development mode only)"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request / Validation Error
- `401` - Unauthorized (no token or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Hospital Settings

Hospital settings control workflow behavior:

```json
{
  "settings": {
    "timezone": "Asia/Kolkata",
    "currency": "INR",
    "dateFormat": "DD/MM/YYYY",
    "allowNurseEdit": false,          // Allow doctors to edit nurse data
    "requireNursePreConsultation": true  // Require nurse pre-consultation
  }
}
```

---

## Example: Complete Workflow

### 1. Create Hospital (Super Admin)
```bash
POST /api/admin/hospitals
```

### 2. Admin Creates Users
```bash
POST /api/hospitals/{hospitalId}/users
# Create doctors, nurses
```

### 3. Register Patient
```bash
POST /api/patients/register
```

### 4. Create Visit
```bash
POST /api/visits
# Status: pending
```

### 5. Nurse Pre-Consultation
```bash
# Nurse sees visit in queue
GET /api/visits/queue/nurse

# Nurse starts pre-consultation
POST /api/visits/{visitId}/start-pre-consultation

# Nurse enters vitals and history
PUT /api/visits/{visitId}/pre-consultation

# Nurse completes pre-consultation
POST /api/visits/{visitId}/complete-pre-consultation
# Status: ready-for-doctor
```

### 6. Doctor Consultation
```bash
# Doctor sees visit in queue
GET /api/visits/queue/doctor

# Doctor starts consultation
POST /api/visits/{visitId}/start-consultation

# Doctor enters examination and diagnosis
PUT /api/visits/{visitId}/consultation

# Doctor finalizes visit
POST /api/visits/{visitId}/finalize
# Status: completed
```

### 7. Add Prescription
```bash
POST /api/medications
```

---

## Notes

- All dates are in ISO 8601 format (UTC)
- Phone numbers must be unique within a hospital
- Patients, visits, and medications are scoped to hospitals
- Super Admin can access all hospitals
- Hospital Admin can only manage their own hospital
- Doctors and Nurses can only access data from their hospital
