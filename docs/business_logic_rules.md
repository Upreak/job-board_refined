
# Business Logic & Backend Rules

## 1. Job Board Domain

### A. Job Creation & Validation Rules
1.  **Salary Validation:** `max_salary` must be greater than or equal to `min_salary`. Negative values are rejected.
2.  **Location formatting:** Job Locations must be validated against a standard ISO city/country list to ensure searchability.
3.  **Expiry Logic:**
    - Jobs status 'Sourcing' auto-expires to 'Closed' after 45 days unless renewed.
    - 'Draft' jobs are deleted after 90 days of inactivity.
4.  **Slug Generation:** 
    - `slug_url` must be unique. Pattern: `[job-title]-[client-name]-[random-4-char]`.
    - If a duplicate exists, append a numeric suffix.

### B. Application Constraints
1.  **Duplicate Application Prevention:**
    - A Candidate cannot apply to the *same* `job_id` twice within 6 months.
    - Check composite key: `(candidate_email, job_id)`.
    - **Error:** Return `409 Conflict` - "You have already applied for this position."
2.  **Internal Candidate Check:**
    - If `candidate_email` exists in the system but for a different job, link the existing profile to the new application instead of creating a duplicate record.
3.  **Cooldown Period:**
    - If a candidate was `Rejected` by a Client, they cannot apply to *other* roles for the same Client for 30 days (optional config per client).

---

## 2. Recruitment Process (ATS)

### A. Status Transition Rules (State Machine)
The `status` field for Candidates cannot jump arbitrarily.
- **Allowed Transitions:**
  - `New` -> `Screening` OR `Rejected`
  - `Screening` -> `Interview` OR `Rejected`
  - `Interview` -> `Offer` OR `Rejected`
  - `Offer` -> `Joined` OR `Declined`
- **Restricted Transitions:**
  - Cannot move from `Rejected` to `Offer` directly (Must go to `Screening` for re-evaluation).

### B. Access Control (RBAC)
1.  **Data Visibility:**
    - **Admin:** View ALL data.
    - **Recruiter:** View only Candidates linked to Jobs where `job.assigned_recruiter_id == current_user.id`.
    - **Sales:** View only Jobs/Clients they own. Cannot view Candidate PII (Email/Phone) unless candidate is in 'Interview' stage.
2.  **Modification Rights:**
    - Only `Admins` can delete Job Posts.
    - Recruiters cannot edit `max_salary` on a Job Post (Sales/Account Manager privilege).

### C. Resume Parsing Limits
1.  **Rate Limiting:**
    - Max 50 resume parses per recruiter per hour.
    - **Error:** `429 Too Many Requests`.
2.  **File Validation:**
    - Max size: 5MB.
    - Allowed Types: `.pdf`, `.docx`, `.doc`.
    - **Security:** Files must be scanned for malware before being stored in S3.

---

## 3. Search & Matching Logic

### A. Search Query Processing
1.  **Keyword Normalization:** "ReactJS", "React.js", "React" -> treated as single token "REACT".
2.  **Location Radius:**
    - Exact match gets 100% weight.
    - Within 50km gets 80% weight.
    - Different location but `ready_to_relocate=true` gets 50% weight.

### B. AI Match Scoring
1.  **Weighted Formula:**
    - Skills Match: 60%
    - Experience Match: 20% (Target +/- 2 years is ideal).
    - Location/Relocation: 10%
    - Budget Fit: 10%
2.  **Threshold:**
    - Candidates with score < 40 are auto-tagged `Low Relevance` but NOT rejected automatically (Human in loop).

---

## 4. Standardized Error Handling

### HTTP Status Codes
| Code | Meaning | Use Case |
|:---|:---|:---|
| `400` | Bad Request | Validation failure (e.g., Missing email, Salary min > max). |
| `401` | Unauthorized | Missing or invalid JWT token. |
| `403` | Forbidden | Authenticated, but role doesn't permit action (e.g., Recruiter trying to delete Client). |
| `404` | Not Found | Resource ID does not exist. |
| `409` | Conflict | Duplicate Entry (Email exists, Application exists). |
| `422` | Unprocessable | Logical error (e.g., Moving candidate from 'New' directly to 'Joined'). |
| `429` | Rate Limited | Too many AI calls or API requests. |
| `500` | Server Error | Unhandled exception or Database connection failure. |

### API Response Structure (JSON)
```json
// Success
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "total": 50 }
}

// Error
{
  "success": false,
  "error": {
    "code": "DUPLICATE_APPLICATION",
    "message": "Candidate has already applied for this job.",
    "details": { "jobId": "123", "lastApplied": "2023-10-01" }
  }
}
```
