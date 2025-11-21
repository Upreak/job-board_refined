# Module Workflows & Error Handling

## 1. Sales: Lead to Client Conversion
**Flow:**
1. **Lead Entry:** Sales Rep enters "Acme Corp" as a `New` lead.
2. **Nurturing:** Rep logs calls. If no activity for 7 days, `nextFollowUp` triggers "Overdue" alert.
3. **Qualification:** Status updated to `Qualified`. Value estimated at ₹12,00,000.
4. **Conversion:**
   - Rep clicks "Convert to Client".
   - **System Check:** Checks if Client Name already exists.
   - **Action:** Moves data to `clients` table. Sets Lead status `Converted`.
   - **Trigger:** Notifies Admin to assign a Recruiter.

**Error Handling:**
- *Duplicate Entry:* Show warning "Client already exists".
- *Missing Data:* Prevent conversion if `corporateDetails` (GST/PAN) are missing.

## 2. Recruiter: Resume Parsing & AI Matching
**Flow:**
1. **Upload:** Recruiter uploads 50 PDFs for "Senior React Dev".
2. **Queue:** Files sent to parsing queue (background job).
3. **AI Analysis (Gemini):**
   - Extracts: Name, Email, Phone, Skills, Experience.
   - **Matching:** Compares extracted skills vs Job Description.
   - **Scoring:** Assigns `matchScore` (0-100).
4. **Review:** Recruiter sees sorted list. High matches (>80%) flagged green.

**Error Handling:**
- *Parse Failure:* If PDF text is unreadable, flag as `Parse Error`. Allow manual entry.
- *API Timeout:* Retry mechanism (Exponential backoff) for AI service.

## 3. Candidate: Application Journey
**Flow:**
1. **Discovery:** Candidate searches "React" on public board.
2. **Apply:** Clicks Apply -> Uploads Resume.
3. **Auto-Fill:** Portal parses resume to pre-fill the application form.
4. **Submission:** Candidate reviews and submits.
5. **Feedback:** System sends confirmation email. Status tracking enabled in dashboard.

**Error Handling:**
- *File Type:* Reject non-PDF/DOCX files.
- *Size Limit:* Reject >5MB files.
