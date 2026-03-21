# DigitalFlow Architecture

## Layers

- `backend/`
  Express API with modular routes, controllers, models, middleware, and services.
- `student-portal/`
  React SPA for student onboarding, request submission, drag-based signature placement, status tracking, and download.
- `staff-portal/`
  Angular SPA for admin enrollment, workflow assignment, faculty review, HOD final approval, and signature profile setup.

## Data Model

- `users`
  Registered system accounts for admin, student, faculty, and HOD.
- `enrollments`
  Admin-created pre-enrollment records required before signup.
- `requests`
  Academic approval requests with signature-box coordinates and generated final document content.
- `statuslogs`
  Audit trail for workflow transitions and reviewer remarks.

## Workflow State

`submitted -> under_faculty_review -> under_hod_review -> completed`

Rejection states:

- `rejected_by_faculty`
- `rejected_by_hod`

## Production Notes

- Move `backend/uploads` to cloud object storage in production.
- Keep MongoDB Atlas pointed at the `digitalflow` database.
- Store JWT secret and frontend URLs in environment variables.
- Put both frontends behind HTTPS and configure the backend CORS allow-list accordingly.
