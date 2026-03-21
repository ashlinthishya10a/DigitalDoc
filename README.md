# DigitalFlow Document Approval System

DigitalFlow is a full-stack academic workflow platform for department document approval. It uses React for students, Angular for admin/faculty/HOD, Express for APIs, and MongoDB with the database name `digitalflow`.

## Monorepo

```text
backend/
student-portal/
staff-portal/
docs/
```

## Environment Setup

### 1. Backend

Create `.env` from [backend/.env.example](/c:/Users/ADMIN/DigialApproval/backend/.env.example).

Important:

- the database name is `digitalflow`
- set a strong `JWT_SECRET`
- for MongoDB Atlas, use a `mongodb+srv://.../digitalflow?...` URI

### 2. Student Portal

Create `.env` from [student-portal/.env.example](/c:/Users/ADMIN/DigialApproval/student-portal/.env.example).

### 3. Staff Portal

Development API URL is in [staff-portal/src/environments/environment.ts](/c:/Users/ADMIN/DigialApproval/staff-portal/src/environments/environment.ts).

Production API URL is in [staff-portal/src/environments/environment.prod.ts](/c:/Users/ADMIN/DigialApproval/staff-portal/src/environments/environment.prod.ts).

Replace:

- `http://localhost:5000/api` for local development
- `https://your-backend-domain/api` for production

## Install Dependencies

Use `npm.cmd` in PowerShell environments that block `npm.ps1`.

```powershell
npm.cmd --prefix backend install
npm.cmd --prefix student-portal install
npm.cmd --prefix staff-portal install
```

## MongoDB Atlas Setup

When you are ready to move from local MongoDB to Atlas:

1. Create a MongoDB Atlas cluster
2. Create a database user
3. Allow your IP in Network Access
4. Copy the driver connection string
5. Replace the `MONGODB_URI` line in [backend/.env](/c:/Users/ADMIN/DigialApproval/backend/.env)

Atlas template:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/digitalflow?retryWrites=true&w=majority
```

You can also copy from [backend/.env.atlas.example](/c:/Users/ADMIN/DigialApproval/backend/.env.atlas.example).

## Local MongoDB Setup

Install MongoDB Community Server locally, then make sure the MongoDB service is running.

Default local connection used by this project:

```env
mongodb://127.0.0.1:27017/digitalflow
```

If MongoDB is installed as a Windows service, you can usually start it from Command Prompt with:

```cmd
net start MongoDB
```

If that service name does not exist, open `services.msc` and start the MongoDB service manually.

## Seed Demo Data

This creates a complete demo setup with admin, faculty, HOD, three students, and requests in multiple workflow states inside your local `digitalflow` database.

```powershell
npm.cmd --prefix backend run seed:demo
```

Demo credentials:

- Admin: `admin@digitalflow.edu` / `Admin@123`
- Faculty: `FAC1001` / `Faculty@123`
- HOD: `HOD2001` / `Hod@123`
- Student: `23CSE001` / `Student@123`
- Student: `23CSE002` / `Student@123`
- Student: `23CSE003` / `Student@123`

## Run Locally

Open 3 terminals.

### Terminal 1

```powershell
npm.cmd --prefix backend run dev
```

### Terminal 2

```powershell
npm.cmd --prefix student-portal run dev
```

### Terminal 3

```powershell
npm.cmd --prefix staff-portal start
```

Local URLs:

- Backend: `http://localhost:5000/api/health`
- Student portal: `http://localhost:5173`
- Staff portal: `http://localhost:4200`

## Functional Testing Checklist

### Admin Flow

1. Open `http://localhost:4200/login`
2. Login as admin using `admin@digitalflow.edu` / `Admin@123`
3. Open the enrollments page
4. Verify pre-enrolled records are visible
5. Add a new student enrollment manually
6. Add a new faculty or HOD enrollment manually
7. Assign advisor and HOD to a student enrollment
8. Confirm the dashboard cards show enrollment and request counts

### Staff Signup Validation

1. Go to `http://localhost:4200/signup`
2. Try signing up with a non-enrolled employee ID
3. Confirm signup is rejected
4. Sign up with an enrolled faculty or HOD ID if you created one in admin
5. Confirm login works after signup

### Student Signup and Login Validation

1. Open `http://localhost:5173/signup`
2. Try a random roll number that is not enrolled
3. Confirm signup is rejected
4. Sign in with demo student `23CSE001` / `Student@123`
5. Confirm dashboard loads with request counts

### Student New Request Flow

1. Login as `23CSE002` or create a fresh student
2. Open `New Request`
3. Enter title, type, and content
4. Upload a file if needed
5. Drag both signature placeholders to different positions in the preview
6. Submit the request
7. Open `My Requests`
8. Confirm the request appears with `Under Faculty Review`

### Faculty Review Flow

1. Login at `http://localhost:4200/login` as `FAC1001` / `Faculty@123`
2. Open dashboard or faculty queue
3. Confirm only assigned student requests appear
4. Add remarks and approve one request
5. Add remarks and reject another request if you want to test rejection
6. Confirm approved requests move to HOD review

### HOD Review Flow

1. Login at `http://localhost:4200/login` as `HOD2001` / `Hod@123`
2. Open HOD queue
3. Confirm faculty-approved requests appear
4. Open `Signature Profile`
5. Upload a signature image or draw a signature and save it
6. Approve a request
7. Confirm it moves to `Completed`

### Student Status Tracking and Download

1. Login to the same student account whose request was approved
2. Open `My Requests`
3. Confirm status history is visible through `View History`
4. Confirm final status becomes `Completed / Signed`
5. Click `Download`
6. Open the downloaded HTML file and verify faculty/HOD signatures are inserted in the saved placeholder positions

## Production Build

```powershell
npm.cmd --prefix student-portal run build
npm.cmd --prefix staff-portal run build -- --configuration production
npm.cmd --prefix backend run build
```

## Deployment

- Database: MongoDB Atlas or MongoDB Community Server with `digitalflow`
- Backend: Render, Railway, VPS
- Student React app: Vercel or Netlify
- Staff Angular app: Vercel, Netlify, or static hosting
- For production file storage, replace local uploads with S3, Cloudinary, or Azure Blob
- Switching between local MongoDB and MongoDB Atlas only requires changing `MONGODB_URI`
