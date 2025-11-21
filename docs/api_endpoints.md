# API Endpoint Specification

## 1. Sales Module (CRM)
Base URL: `/api/v1/sales`

| Method | Endpoint | Description | Payload |
|:---|:---|:---|:---|
| GET | `/leads` | Fetch all leads | Query: `?status=New&owner=me` |
| POST | `/leads` | Create new lead | `{ companyName, contactPerson, value, ... }` |
| PATCH | `/leads/:id/status` | Move pipeline stage | `{ status: "Qualified" }` |
| POST | `/leads/:id/activity` | Log interaction | `{ type: "Call", description: "..." }` |
| POST | `/clients/convert` | Lead -> Client | `{ leadId: "...", assignedRecruiter: "..." }` |

## 2. Recruiter Module (ATS)
Base URL: `/api/v1/ats`

| Method | Endpoint | Description | Payload |
|:---|:---|:---|:---|
| GET | `/jobs` | List jobs | Query: `?status=Sourcing` |
| POST | `/jobs` | Post new job | `{ title, skills, salary... }` |
| GET | `/jobs/:id/candidates` | Get applicants | - |
| POST | `/candidates/parse` | Upload & Parse Resume | `FormData: { file: binary }` |
| PUT | `/candidates/:id` | Update status | `{ status: "Interview", remarks: "..." }` |
| POST | `/candidates/manual-search` | Search DB | `{ query: "React Dev" }` |

## 3. Candidate Portal
Base URL: `/api/v1/portal`

| Method | Endpoint | Description | Payload |
|:---|:---|:---|:---|
| GET | `/jobs/public` | Public Job Board | Query: `?location=Bangalore` |
| POST | `/applications` | Submit Application | `{ jobId, candidateProfile }` |
| POST | `/profile/resume` | Parse Resume (Self) | `FormData: { file: binary }` |

## 4. Analytics (Dashboard)
Base URL: `/api/v1/analytics`

| Method | Endpoint | Description | Payload |
|:---|:---|:---|:---|
| GET | `/kpi/sales` | Sales Metrics | - |
| GET | `/kpi/recruitment` | Hiring Metrics | - |
| GET | `/feed` | Global Activity Feed | - |
