# Database Schema Specification

## 1. Users & Authentication
**Table: users**
- `id` (UUID, PK): Unique identifier
- `email` (VARCHAR, Unique): User email
- `password_hash` (VARCHAR): Bcrypt hash
- `role` (ENUM): 'ADMIN', 'RECRUITER', 'SALES', 'CANDIDATE'
- `name` (VARCHAR): Full display name
- `avatar_url` (VARCHAR): Link to profile image
- `created_at` (TIMESTAMP): Record creation time

## 2. Recruitment Module (ATS)
**Table: jobs**
- `id` (UUID, PK)
- `client_id` (UUID, FK -> clients.id): The client company
- `title` (VARCHAR): Job role title
- `status` (ENUM): 'Draft', 'Sourcing', 'Interview', 'Closed'
- `min_salary` (INT)
- `max_salary` (INT)
- `required_skills` (JSONB): Array of strings e.g. ["React", "Node"]
- `job_summary` (TEXT): Full HTML/Markdown description
- `created_by` (UUID, FK -> users.id)

**Table: candidates**
- `id` (UUID, PK)
- `job_id` (UUID, FK -> jobs.id): The job applied for
- `full_name` (VARCHAR)
- `email` (VARCHAR)
- `resume_url` (VARCHAR): S3/Blob storage link
- `match_score` (INT): 0-100 AI score
- `status` (ENUM): 'New', 'Screening', 'Interview', 'Offer', 'Rejected'
- `automation_status` (VARCHAR): 'New', 'Contacting', 'Live Chat'
- `ai_summary` (TEXT): Generated brief
- `chat_history` (JSONB): Array of message objects

## 3. Sales Module (CRM)
**Table: leads**
- `id` (UUID, PK)
- `company_name` (VARCHAR)
- `contact_person` (VARCHAR)
- `status` (ENUM): 'New', 'Contacted', 'Qualified', 'Converted', 'Lost'
- `value` (DECIMAL): Estimated deal value
- `next_follow_up` (DATE)
- `source` (VARCHAR): e.g. "LinkedIn", "Cold Call"

**Table: clients**
- `id` (UUID, PK)
- `name` (VARCHAR)
- `address` (TEXT)
- `corporate_details` (JSONB): { gst, pan, cin }
- `assigned_recruiter_id` (UUID, FK -> users.id)

## 4. Interactions & Logs
**Table: activities**
- `id` (UUID, PK)
- `entity_id` (UUID): Can be Lead ID or Candidate ID
- `entity_type` (ENUM): 'LEAD', 'CANDIDATE'
- `type` (ENUM): 'Call', 'Email', 'Meeting', 'Note'
- `description` (TEXT)
- `performed_by` (UUID, FK -> users.id)
- `date` (TIMESTAMP)
