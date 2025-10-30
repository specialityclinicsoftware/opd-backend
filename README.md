# Medical OPD Management System - Backend

A comprehensive backend system for managing outpatient department (OPD) records, patient information, and visit history.

## Features

- Patient registration and management
- Complete visit record tracking with diagnosis
- **Medication prescription tracking** - Record medications with dosage, frequency, duration
- **Medication history** - View all prescribed medications across visits
- Medical history storage (chief complaints, past/family/marital history)
- Vitals monitoring (pulse, BP, SpO2, temperature)
- Physical examination records (general + systemic)
- Investigation results tracking
- Visit history retrieval
- RESTful API design

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Development**: Nodemon for hot reload

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Installation

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration:
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/med-opd
NODE_ENV=development
LOG_LEVEL=info
```

4. Make sure MongoDB is running on your system

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

## API Endpoints

### Health Check
```
GET /health
```

### Patient Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/patients/register` | Register a new patient |
| GET | `/api/patients` | Get all patients |
| GET | `/api/patients/search?phoneNumber={phone}` | Search patient by phone |
| GET | `/api/patients/:id` | Get patient by ID |
| PUT | `/api/patients/:id` | Update patient information |
| DELETE | `/api/patients/:id` | Delete a patient |

### Visit Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/visits` | Create a new visit record |
| GET | `/api/visits/patient/:patientId` | Get all visits for a patient |
| GET | `/api/visits/patient/:patientId/latest` | Get latest visit for a patient |
| GET | `/api/visits/patient/:patientId/history` | Get complete patient history |
| GET | `/api/visits/:id` | Get specific visit by ID |
| PUT | `/api/visits/:id` | Update a visit record |
| DELETE | `/api/visits/:id` | Delete a visit record |

### Medication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/medications` | Add medication history for a visit |
| GET | `/api/medications/patient/:patientId` | Get all medications for a patient |
| GET | `/api/medications/patient/:patientId/recent?limit=5` | Get recent prescriptions |
| GET | `/api/medications/visit/:visitId` | Get medications for specific visit |
| GET | `/api/medications/search?medicineName=name` | Search by medicine name |
| GET | `/api/medications/:id` | Get medication history by ID |
| PUT | `/api/medications/:id` | Update medication history |
| DELETE | `/api/medications/:id` | Delete medication history |

## API Usage Examples

### Register a Patient
```bash
curl -X POST http://localhost:3001/api/patients/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "phoneNumber": "9876543210",
    "age": 45,
    "gender": "Male",
    "address": "123 Main Street, City"
  }'
```

### Create a Visit Record
```bash
curl -X POST http://localhost:3001/api/visits \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "patient_id_here",
    "consultingDoctor": "Dr. Smith",
    "vitals": {
      "pulseRate": 72,
      "bloodPressure": {
        "systolic": 120,
        "diastolic": 80
      },
      "spO2": 98,
      "temperature": 37
    },
    "chiefComplaints": "Fever and headache",
    "diagnosis": "Viral fever",
    "treatment": "Rest and hydration",
    "reviewDate": "2024-02-01"
  }'
```

### Add Medications for a Visit
```bash
curl -X POST http://localhost:3001/api/medications \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "patient_id_here",
    "visitId": "visit_id_from_previous_step",
    "consultingDoctor": "Dr. Smith",
    "diagnosis": "Viral fever",
    "medications": [
      {
        "medicineName": "Paracetamol",
        "dosage": "500mg",
        "frequency": "TDS",
        "duration": "5 days",
        "route": "Oral",
        "instructions": "Take after meals",
        "timing": "Morning-Afternoon-Night"
      },
      {
        "medicineName": "Ibuprofen",
        "dosage": "400mg",
        "frequency": "BD",
        "duration": "3 days",
        "route": "Oral",
        "instructions": "Take with water"
      }
    ]
  }'
```

### Get Patient History
```bash
curl http://localhost:3001/api/visits/patient/:patientId/history
```

### Get Medication History
```bash
curl http://localhost:3001/api/medications/patient/:patientId
```

## Data Models

### Patient Schema
```typescript
{
  name: string (required)
  phoneNumber: string (required, unique)
  age?: number
  gender?: 'Male' | 'Female' | 'Other'
  address?: string
  registrationDate: Date
}
```

### Visit Schema
```typescript
{
  patientId: ObjectId (required)
  visitDate: Date
  consultingDoctor: string (required)
  vitals?: {
    pulseRate?: number
    bloodPressure?: { systolic: number, diastolic: number }
    spO2?: number
    temperature?: number
  }
  chiefComplaints?: string
  pastHistory?: string
  familyHistory?: string
  maritalHistory?: string
  generalExamination?: {
    pallor: boolean
    icterus: boolean
    clubbing: boolean
    cyanosis: boolean
    lymphadenopathy: boolean
  }
  systemicExamination?: {
    cvs?: string
    rs?: string
    pa?: string
    cns?: string
  }
  diagnosis?: string
  treatment?: string
  investigation?: string
  advice?: string
  reviewDate?: Date
  bloodInvestigations?: Array<{
    testName: string
    value: string
    unit?: string
    referenceRange?: string
    testDate?: Date
  }>
}
```

### MedicationHistory Schema (Separate Collection)
```typescript
{
  patientId: ObjectId (required, ref: Patient)
  visitId: ObjectId (required, ref: Visit)
  prescribedDate: Date (required)
  consultingDoctor: string (required)
  diagnosis?: string
  medications: Array<{
    medicineName: string (required)
    dosage: string (required)
    frequency: string (required)
    duration: string (required)
    route?: string
    instructions?: string
    timing?: string
  }>
  notes?: string
  createdAt: Date
  updatedAt: Date
}
```

## Project Structure

```
med-backend/
├── src/
│   ├── config/
│   │   ├── database.ts               # Database connection
│   │   └── logger.ts                 # Winston logger configuration
│   ├── controllers/                  # HTTP request/response handlers
│   │   ├── patient-controller.ts
│   │   ├── visit-controller.ts
│   │   └── medication-controller.ts
│   ├── services/                     # Business logic layer
│   │   ├── patient-service.ts
│   │   ├── visit-service.ts
│   │   └── medication-service.ts
│   ├── models/                       # Mongoose schemas
│   │   ├── patient.ts
│   │   ├── visit.ts
│   │   └── medication-history.ts
│   ├── routes/                       # API route definitions
│   │   ├── patient-routes.ts
│   │   ├── visit-routes.ts
│   │   └── medication-routes.ts
│   ├── utils/                        # Utility functions
│   │   ├── response-handler.ts
│   │   └── error-handler.ts
│   ├── types/
│   │   └── index.ts                  # TypeScript interfaces
│   └── index.ts                      # Main application file
├── logs/                             # Log files (auto-generated)
├── .env
├── .env.example
├── .gitignore
├── API_EXAMPLES.md
├── ARCHITECTURE.md
├── MEDICATION_REFACTORED.md
├── package.json
├── tsconfig.json
└── README.md
```

## Architecture

The project follows a **layered architecture** for better separation of concerns:

### 1. **Controllers** (`src/controllers/`)
- Handle HTTP requests and responses
- Validate request parameters
- Delegate business logic to services
- Use utility functions for consistent responses

### 2. **Services** (`src/services/`)
- Contain all business logic
- Interact with database models
- Perform data validation and transformation
- Return data or throw errors
- Uses **functional approach** (exported functions, not classes)
- Each function has try-catch for error handling
- Integrated with Winston logger for debugging

### 3. **Models** (`src/models/`)
- Define MongoDB schemas using Mongoose
- Handle data validation at database level
- Define indexes for performance

### 4. **Routes** (`src/routes/`)
- Define API endpoints
- Map routes to controller functions

### 5. **Utils** (`src/utils/`)
- Reusable helper functions
- Response formatting utilities
- Error handling utilities

## Development

The project uses:
- **TypeScript** for type safety and better developer experience
- **Mongoose** for MongoDB object modeling and validation
- **Express** for RESTful API framework
- **Layered Architecture** for separation of concerns
- **Service Layer** for business logic isolation
- **Proper error handling** with centralized error utilities
- **Indexed queries** for database performance
- **Winston Logger** for structured logging

## Logging

The application uses **Winston** for comprehensive logging:

### Log Levels
- `error` - Error messages (saved to `logs/error.log`)
- `warn` - Warning messages
- `info` - Informational messages (default)
- `http` - HTTP request logs
- `debug` - Debug information

### Log Files
- `logs/error.log` - Contains only error logs
- `logs/combined.log` - Contains all logs
- Console output - Enabled in development mode with colored output

### Configuration
Set the log level in your `.env` file:
```env
LOG_LEVEL=info  # Options: error, warn, info, http, debug
```

### Features
- Structured JSON logging for production
- Colorized console output for development
- Automatic log file rotation (5MB max, 5 files kept)
- Request/response logging with duration tracking
- Error stack traces included in logs

## Future Enhancements

- Input validation with Joi or Zod
- Authentication and authorization
- Role-based access control (doctors, admins, etc.)
- PDF report generation
- Email notifications for appointments
- Data backup and export features
- Analytics dashboard
- Prescription management
- Appointment scheduling

## License

ISC
