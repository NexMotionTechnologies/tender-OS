# NexMotion Tender Management System – Technical Architecture

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           EXTERNAL DATA SOURCES                         │
├─────────────────────────────────────────────────────────────────────────┤
│  E-Tenders      GIBB Portal    Tzaneen Muni    Polokwane Muni   Other   │
│ etenders.gov.za gibb.org.za   tzaneen.gov.za  polokwane.gov.za Portals │
└──────────┬───────────────────────────────────────────────────────────────┘
           │
           │ HTTP Scraping (Daily 06:00 SAST)
           │
        ┌──▼──────────────────────────────────────────────┐
        │   GOOGLE CLOUD RUN (Python Scraper)            │
        │  ┌──────────────────────────────────────────┐  │
        │  │ BeautifulSoup + requests                │  │
        │  │ Extract: title, deadline, budget, etc.  │  │
        │  │ Duplicate detection                     │  │
        │  │ Schedule: Cloud Scheduler (cron)        │  │
        │  └──────────────────────────────────────────┘  │
        └──┬──────────────────────────────────────────────┘
           │ Write new tenders
           │
        ┌──▼──────────────────────────────────────────────┐
        │     FIRESTORE DATABASE (Real-Time)             │
        │  ┌──────────────────────────────────────────┐  │
        │  │ /tenders       (indexed by deadline)   │  │
        │  │ /users         (team roles)             │  │
        │  │ /tasks         (checklist items)        │  │
        │  │ /analytics     (monthly metrics)        │  │
        │  └──────────────────────────────────────────┘  │
        └──┬──────────────────────────────────────────────┘
           │
           │ Async Analysis Job
           │
        ┌──▼──────────────────────────────────────────────┐
        │   CLAUDE API (AI Requirement Analysis)         │
        │  ┌──────────────────────────────────────────┐  │
        │  │ Model: claude-opus-4-6                 │  │
        │  │ Extract: requirements, fit score, risks │  │
        │  │ Timeout: 30 seconds, retry on 429      │  │
        │  └──────────────────────────────────────────┘  │
        └──┬──────────────────────────────────────────────┘
           │ Store analysis results
           │
           └──► FIRESTORE (update tender.analysis field)
                │
                │
                ├─► FRONTEND DASHBOARD (React) ◄──┐
                │                                   │
        ┌───────┴──────────────────────────────────┼───────┐
        │  FRONTEND LAYER (Vercel + React)         │       │
        │  ┌──────────────────────────────────────┐│       │
        │  │ Dashboard (Metrics, Pipeline)       ││       │
        │  │ Tender List (Table, filters)        ││       │
        │  │ Tender Detail (Analysis, checklist) ││       │
        │  │ Kanban Board (Drag-drop status)     ││       │
        │  │ Team Assignments (Tasks)            ││       │
        │  │ Analytics (Reports, exports)        ││       │
        │  │                                      ││       │
        │  │ Auth: Google OAuth 2.0              ││       │
        │  │ State: Zustand (local)              ││       │
        │  │ Styling: Tailwind CSS               ││       │
        │  │ API: Firebase SDK (realtime)        ││       │
        │  └──────────────────────────────────────┘│       │
        │                                           │       │
        └───────────────────────────────────────────┘       │
                                                            │
                Notifications ◄──────────────────────────────┘
                                                            │
        ┌──────────────────────────────────────────────────┴──────┐
        │   CLOUD FUNCTIONS (Alert Scheduler)                     │
        │  ┌──────────────────────────────────────────────────┐   │
        │  │ Trigger: hourly via Cloud Scheduler             │   │
        │  │ Check: tenders with deadline < 7 days          │   │
        │  │ Send: email alerts (7-day, 3-day, 1-day)       │   │
        │  │ Service: SendGrid API                           │   │
        │  └──────────────────────────────────────────────────┘   │
        └────────────────────┬─────────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   SENDGRID API   │
                    │  (Email Alerts)  │
                    └──────────────────┘
```

---

## Data Flow Diagram (Tender Lifecycle)

```
1. DISCOVERY
   ┌─────────────────────────────────────┐
   │ E-Tenders + Other Sources (daily)   │
   └────────────┬────────────────────────┘
                │
                ├─ Extract: title, deadline, budget, municipality
                ├─ Deduplicate: check if already in database
                └─ Store in Firestore: status = "identified"

2. ANALYSIS (Async, within 5 min)
   ┌──────────────────────────────────┐
   │ Claude API (Tender Content)       │
   └────────────┬─────────────────────┘
                │
                ├─ Extract requirements (tech stack, compliance, timeline)
                ├─ Calculate fit score (0–100)
                ├─ Identify risks (timeline, skills gap, etc.)
                └─ Store in Firestore: tender.analysis = {...}

3. SHORTLISTING (Manual, User Decision)
   ┌──────────────────────────────────┐
   │ User reviews analysis in dashboard│
   │ Clicks "Shortlist" (Kanban drag) │
   └────────────┬─────────────────────┘
                │
                └─ Update Firestore: status = "shortlisted"

4. BID PREPARATION
   ┌──────────────────────────────────┐
   │ User clicks "Prepare Bid"         │
   └────────────┬─────────────────────┘
                │
                ├─ Auto-generate compliance checklist
                ├─ Assign tasks (Casious → tech, Bokang → compliance)
                ├─ Send email notifications
                ├─ Store in Firestore: status = "preparing"
                └─ Create /tasks documents (checklist items)

5. DOCUMENT COLLECTION & COMPLETION
   ┌──────────────────────────────────┐
   │ Team uploads documents            │
   │ Marks checklist items complete   │
   └────────────┬─────────────────────┘
                │
                ├─ Firestore: upload files to Cloud Storage
                ├─ Update task: completed = true
                ├─ Monitor: all tasks complete → auto-flag "Ready for Submission"
                └─ Alert: send reminder emails if approaching deadline

6. SUBMISSION
   ┌──────────────────────────────────┐
   │ Casious sends bid to municipality │
   │ Marks tender "Submitted"          │
   └────────────┬─────────────────────┘
                │
                ├─ Firestore: status = "submitted"
                ├─ Record: submission_timestamp, bid_value
                ├─ Update analytics: revenue pipeline += bid_value
                └─ Move Kanban card to "Submitted" column

7. OUTCOME TRACKING
   ┌──────────────────────────────────┐
   │ After evaluation period           │
   │ Mark as "Won" or "Lost"          │
   └────────────┬─────────────────────┘
                │
                ├─ Firestore: status = "won" | "lost"
                ├─ Record: deal_value, win_reason, loss_reason
                ├─ Update analytics: /analytics/{YYYY-MM}
                └─ Kanban card moves to "Won" or "Lost" column
```

---

## Firebase Firestore Schema (Detailed)

### Collection: `/tenders`

```javascript
{
  id: "tender_2026_06_001",  // Auto-generated
  
  // Basic Info
  title: "IT Services – Tzaneen Municipality",
  link: "https://etenders.gov.za/view/tender/12345",
  source: "etenders_gov_za",  // "etenders_gov_za" | "gibb_portal" | "tzaneen" | etc.
  
  // Location & Categorization
  municipality: "Tzaneen",
  province: "Limpopo",
  category: "Software Development",  // "Software Dev" | "Cloud Hosting" | "Mobile App" | etc.
  
  // Financial & Timeline
  budget: {
    min: 800000,
    max: 1200000,
    currency: "ZAR"
  },
  deadline: "2026-07-15T17:00:00Z",  // ISO 8601
  datePosted: "2026-06-20T09:00:00Z",
  
  // Status Tracking
  status: "identified",  // "identified" | "shortlisted" | "preparing" | "submitted" | "won" | "lost"
  statusHistory: [
    { status: "identified", changedAt: "2026-06-20T09:00:00Z", changedBy: "system" },
    { status: "shortlisted", changedAt: "2026-06-22T14:30:00Z", changedBy: "casious@..." }
  ],
  
  // AI Analysis (from Claude API)
  analysis: {
    extractedRequirements: [
      "React web platform for citizen reporting",
      "AWS-based cloud hosting",
      "POPIA compliance for citizen data",
      "5-year track record in software delivery",
      "BEE Level 1 certification required"
    ],
    capabilityMatch: [
      {
        requirement: "React web platform",
        fitLevel: "expert",  // "expert" | "competent" | "beginner" | "none"
        score: 95
      },
      {
        requirement: "AWS hosting",
        fitLevel: "competent",
        score: 80
      }
    ],
    fitScore: 87,  // 0–100
    recommendation: "Pursue",  // "Pursue" | "Maybe" | "Skip"
    risks: [
      "Tight timeline (11 days to bid)",
      "No prior work in Tzaneen (minor)",
      "Need to verify current BEE cert"
    ],
    reasoning: "Strong technical fit; main risk is timeline. BEE cert needs refresh.",
    analyzedAt: "2026-06-20T09:05:00Z",
    model: "claude-opus-4-6"
  },
  
  // Bid Preparation Tracking
  bid: {
    status: "draft",  // "draft" | "in_progress" | "ready" | "submitted"
    initiatedAt: "2026-06-22T14:30:00Z",
    submittedAt: null,
    submissionMethod: null,  // "email" | "portal" | "courier" | null
    submissionTimestamp: null,
    bidValue: null,  // ZAR, set when submitted
    internalNotes: "Team agreed on 10-day timeline for prep. Allocate 80 hours.",
    
    checklist: [
      {
        id: "task_001",
        item: "Tax Clearance Certificate",
        description: "Current tax clearance from SARS (valid for 12 months)",
        assignedTo: "mookamedi@nexmotiontechnologies.co.za",
        dueDate: "2026-07-05T17:00:00Z",
        completed: false,
        completedAt: null,
        priority: "high",
        status: "pending"  // "pending" | "in_progress" | "completed" | "overdue"
      },
      {
        id: "task_002",
        item: "BBBEE Level Verification",
        description: "Confirm current BEE level from DTI registry (tender requires Level 1)",
        assignedTo: "kgabale@nexmotiontechnologies.co.za",
        dueDate: "2026-07-03T17:00:00Z",
        completed: false,
        completedAt: null,
        priority: "critical",
        status: "pending"
      }
      // ... more checklist items
    ],
    
    documents: {
      taxClearance: {
        fileName: "SARS_Tax_Clearance_2026_06.pdf",
        storageRef: "gs://nexmotion-tender.appspot.com/tenders/tender_001/tax_clearance.pdf",
        uploadedAt: "2026-07-04T10:30:00Z",
        uploadedBy: "mookamedi@nexmotiontechnologies.co.za",
        expiryDate: "2027-06-04"
      },
      bbeeCert: {
        fileName: "BBBEE_Certificate_2024.pdf",
        storageRef: "gs://nexmotion-tender.appspot.com/tenders/tender_001/bbbee_cert.pdf",
        uploadedAt: "2026-07-03T15:00:00Z",
        uploadedBy: "kgabale@nexmotiontechnologies.co.za",
        expiryDate: "2027-12-31"
      }
      // ... more documents
    }
  },
  
  // Team Assignment & Collaboration
  assignedTo: [
    "mookamedi@nexmotiontechnologies.co.za",
    "kgabale@nexmotiontechnologies.co.za"
  ],
  comments: [
    {
      id: "comment_001",
      author: "mookamedi@nexmotiontechnologies.co.za",
      text: "Risk on timeline is real. Can we do it in 10 days?",
      timestamp: "2026-06-25T11:23:00Z"
    },
    {
      id: "comment_002",
      author: "kgabale@nexmotiontechnologies.co.za",
      text: "Yes, if we prioritize. Allocating 80 hours internally.",
      timestamp: "2026-06-25T14:45:00Z"
    }
  ],
  
  // Outcome Tracking (after deadline)
  outcome: {
    result: null,  // "won" | "lost" | null (not yet decided)
    winValue: null,  // Contract value if won
    contractStartDate: null,
    lossReason: null,  // "price" | "approach" | "capability" | "other" | null
    feedback: null,  // Municipality feedback (if available)
    recordedAt: null
  },
  
  // Metadata
  createdAt: "2026-06-20T09:00:00Z",
  updatedAt: "2026-06-25T14:45:00Z",
  createdBy: "system",
  
  // Search/Indexing
  tags: ["ICT", "Limpopo", "React", "urgent"],
  searchText: "IT Services Tzaneen..."  // Concatenated for full-text search
}
```

### Collection: `/users`

```javascript
{
  id: "mookamedi@nexmotiontechnologies.co.za",  // Google user ID
  
  email: "mookamedi@nexmotiontechnologies.co.za",
  displayName: "Casious Segeale Mookamedi",
  photoUrl: "https://...",
  role: "CTO",  // "CEO" | "PM" | "Viewer"
  
  permissions: {
    canEditTenders: true,
    canAssignTasks: true,
    canSubmitBids: true,
    canViewAnalytics: true,
    canExportData: true
  },
  
  preferences: {
    timezone: "Africa/Johannesburg",
    alertsEnabled: true,
    alertEmailFrequency: "immediate",  // "immediate" | "daily" | "weekly"
    darkMode: false,
    language: "en-ZA"
  },
  
  notifications: {
    assignedTenders: 3,
    overdueTasks: 1,
    upcomingDeadlines: 2
  },
  
  createdAt: "2026-06-01T10:00:00Z",
  lastLogin: "2026-06-30T08:30:00Z"
}
```

### Collection: `/tasks`

```javascript
{
  id: "task_2026_06_001_tax_clearance",
  
  tenderId: "tender_2026_06_001",
  tenderTitle: "IT Services – Tzaneen Municipality",
  
  item: "Tax Clearance Certificate",
  description: "Obtain current SARS Tax Clearance Certificate (valid 12 months)",
  
  assignedTo: "mookamedi@nexmotiontechnologies.co.za",
  assignedBy: "kgabale@nexmotiontechnologies.co.za",
  assignedAt: "2026-06-22T14:30:00Z",
  
  dueDate: "2026-07-05T17:00:00Z",
  daysUntilDue: 5,  // Calculated field (recomputed hourly)
  priority: "high",  // "critical" | "high" | "medium" | "low"
  
  status: "pending",  // "pending" | "in_progress" | "completed" | "overdue"
  completed: false,
  completedAt: null,
  completedBy: null,
  
  createdAt: "2026-06-22T14:30:00Z",
  updatedAt: "2026-06-22T14:30:00Z",
  
  alertSent: {
    "5_days": true,
    "1_day": false,
    "on_due_date": false
  }
}
```

### Collection: `/analytics` (Monthly Aggregations)

```javascript
{
  id: "2026-06",  // YYYY-MM
  
  month: "June",
  year: 2026,
  startDate: "2026-06-01T00:00:00Z",
  endDate: "2026-06-30T23:59:59Z",
  
  counts: {
    opportunitiesIdentified: 45,
    shortlistedCount: 8,
    preparingCount: 3,
    submittedCount: 2,
    wonCount: 0,
    lostCount: 1,
    stillOpen: 4  // Submitted, not yet decided
  },
  
  financials: {
    totalValueIdentified: 8500000,  // ZAR
    totalValueShortlisted: 2800000,
    totalValueSubmitted: 1650000,
    totalValueWon: 0,
    totalValueLost: 450000,
    averageDealSize: 825000  // totalValueSubmitted / submittedCount
  },
  
  rates: {
    submissionRate: 25,  // % (submitted / identified)
    shortlistRate: 18,   // % (shortlisted / identified)
    winRate: 0,          // % (won / submitted)
    lossRate: 50         // % (lost / submitted)
  },
  
  byCategory: {
    "Software Dev": {
      count: 15,
      submitted: 1,
      won: 0,
      value: 850000
    },
    "Cloud Hosting": {
      count: 12,
      submitted: 1,
      won: 0,
      value: 600000
    }
    // ... more categories
  },
  
  byMunicipality: {
    "Tzaneen": {
      count: 10,
      submitted: 2,
      won: 0,
      value: 1650000
    },
    "Polokwane": {
      count: 8,
      submitted: 0,
      won: 0,
      value: 0
    }
    // ... more municipalities
  },
  
  computedAt: "2026-06-30T23:59:59Z",
  nextComputation: "2026-07-31T23:59:59Z"
}
```

---

## Firestore Indexing Strategy

### Composite Indexes (Required for Performance)

```
Collection: tenders
  Index 1: province + deadline (for dashboard filtering)
  Index 2: status + deadline (for Kanban board)
  Index 3: municipality + status (for regional pipeline view)
  Index 4: analysis.fitScore + deadline (for opportunity scoring)

Collection: tasks
  Index 1: assignedTo + dueDate (for user task list)
  Index 2: tenderId + completed (for checklist progress)
  Index 3: priority + status (for overdue task alerts)
```

### Security Rules (Firestore)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Authenticated users only
    match /tenders/{document=**} {
      allow read, write: if request.auth != null 
        && request.auth.email in ['mookamedi@nexmotiontechnologies.co.za', 
                                   'kgabale@nexmotiontechnologies.co.za',
                                   'info@nexmotiontechnologies.co.za'];
    }
    
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    match /tasks/{taskId} {
      allow read: if request.auth != null 
        && resource.data.assignedTo == request.auth.email;
      allow write: if request.auth != null 
        && (resource.data.assignedTo == request.auth.email 
         || resource.data.assignedBy == request.auth.email);
    }
    
    match /analytics/{analyticsId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null 
        && request.auth.email == 'system@nexmotiontechnologies.co.za';
    }
  }
}
```

---

## API Layer (React → Firestore)

### Core Hooks (Zustand Store)

```typescript
// store/tenderStore.ts
import { create } from 'zustand';
import { db } from '../firebase';
import { collection, query, where, getDocs, setDoc, updateDoc } from 'firebase/firestore';

export const useTenderStore = create((set) => ({
  tenders: [],
  selectedTender: null,
  loading: false,
  
  // Fetch all tenders for current user
  fetchTenders: async (filters = {}) => {
    set({ loading: true });
    try {
      const q = query(
        collection(db, 'tenders'),
        filters.status && where('status', '==', filters.status),
        filters.municipality && where('municipality', '==', filters.municipality)
      );
      const docs = await getDocs(q);
      set({ tenders: docs.docs.map(doc => ({ id: doc.id, ...doc.data() })), loading: false });
    } catch (err) {
      console.error('Error fetching tenders:', err);
      set({ loading: false });
    }
  },
  
  // Update tender status (e.g., Kanban drag-drop)
  updateTenderStatus: async (tenderId, newStatus) => {
    try {
      const ref = doc(db, 'tenders', tenderId);
      await updateDoc(ref, {
        status: newStatus,
        updatedAt: new Date(),
        statusHistory: arrayUnion({
          status: newStatus,
          changedAt: new Date(),
          changedBy: auth.currentUser.email
        })
      });
      // Update local state
      set((state) => ({
        tenders: state.tenders.map(t => 
          t.id === tenderId ? { ...t, status: newStatus } : t
        )
      }));
    } catch (err) {
      console.error('Error updating tender:', err);
    }
  },
  
  // ... more methods (createTender, deleteTender, addComment, etc.)
}));
```

### Claude API Integration (Backend)

```python
# backend/scraper/analyzer.py
import anthropic
import json

client = anthropic.Anthropic(api_key=os.getenv("CLAUDE_API_KEY"))

NEXMOTION_CAPABILITIES_PROMPT = """
NexMotion Technologies specialises in:
- React/Next.js web development (Expert)
- Node.js/Python backend (Expert)
- Firebase/AWS cloud infrastructure (Competent)
- React Native & Flutter mobile (Competent)
- AI/ML solutions – Pampiri™ platform (Competent)
- POPIA/data security compliance (Expert)
"""

def analyze_tender(tender_text: str, tender_title: str) -> dict:
    """
    Analyze tender using Claude API
    Returns: {
      extractedRequirements: [...],
      capabilityMatch: [...],
      fitScore: int,
      recommendation: str,
      risks: [...]
    }
    """
    
    prompt = f"""
You are a tender analyst for NexMotion Technologies.

{NEXMOTION_CAPABILITIES_PROMPT}

TENDER: {tender_title}
Content (first 5000 chars): {tender_text[:5000]}

Analyze and respond ONLY with valid JSON:
{{
  "extractedRequirements": [...],
  "capabilityMatch": [
    {{ "requirement": "...", "fitLevel": "expert|competent|beginner|none", "score": 95 }},
    ...
  ],
  "fitScore": 87,
  "recommendation": "Pursue|Maybe|Skip",
  "reasoning": "...",
  "risks": ["..."]
}}
"""
    
    try:
        message = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=1500,
            messages=[{"role": "user", "content": prompt}]
        )
        
        response_text = message.content[0].text
        analysis = json.loads(response_text)
        
        return analysis
    except anthropic.RateLimitError:
        # Exponential backoff
        time.sleep(2 ** retry_count)
        return analyze_tender(tender_text, tender_title)
    except Exception as e:
        logger.error(f"Claude API error: {e}")
        return None
```

---

## Deployment Configuration

### Cloud Run Dockerfile (Scraper)

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY scraper/ .

# Cloud Run expects PORT env var
ENV PORT=8080

CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 main:app
```

### Cloud Scheduler Configuration

```bash
# Deploy via gcloud CLI
gcloud scheduler jobs create pubsub daily-tender-scrape \
  --schedule="0 6 * * *" \  # 6 AM SAST every day
  --timezone="Africa/Johannesburg" \
  --topic="tender-scrape-trigger" \
  --message-body="{\"action\": \"scrape_all\"}"
```

### GitHub Actions Workflow (Frontend Deploy)

```yaml
# .github/workflows/frontend-deploy.yml
name: Deploy Frontend

on:
  push:
    branches: [main]
    paths: [frontend/**]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/action@v5
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: frontend
```

---

## Monitoring & Logging

### Key Metrics to Monitor

```
Frontend (Hostinger):
  - Page load time (target: < 2 sec)
  - Error rate (target: < 0.1%)
  - Session duration
  - User count

Backend (Cloud Run/ Host Africa):
  - Scraper execution time (target: < 15 min)
  - Tenders scraped per run (target: 10–50)
  - Claude API latency (target: < 30 sec per analysis)
  - Error rate (target: < 1%)

Firebase:
  - Firestore read/write operations (monitor costs)
  - Storage usage (GB)
  - Authentication sign-in rate

Email Alerts:
  - SendGrid delivery rate (target: > 99%)
  - Bounce rate (target: < 0.5%)
```

### Logging Strategy

```python
# Backend logging configuration
import logging
import google.cloud.logging

logging_client = google.cloud.logging.Client()
logging_client.setup_logging()

logger = logging.getLogger(__name__)

# Log all tender scrapes
logger.info("Scraped E-Tenders", extra={
  "scraped_count": 25,
  "duplicates_filtered": 3,
  "new_tenders": 22,
  "duration_seconds": 45
})

# Log Claude API calls
logger.info("Claude analysis complete", extra={
  "tender_id": "tender_001",
  "fit_score": 87,
  "latency_ms": 2500
})
```

---

## Performance Optimization Tips

### Frontend

- Use **React.memo()** for Kanban cards (prevent re-render on every Firestore update)
- Implement **virtual scrolling** for tender lists (1000+ items)
- Cache Claude analysis results (don't re-analyze same tender)
- Lazy-load Dashboard charts (use React.lazy + Suspense)

### Backend

- Batch Claude API calls (collect 5 tenders, submit batch)
- Use Firestore batch writes (faster than individual writes)
- Cache municipality/province lists (rarely change)
- Implement scraper retry backoff (exponential, max 3 retries)

### Database

- Create indexes for common filters (status, deadline, municipality)
- Use Firestore real-time listeners (not polling)
- Archive old tenders (> 1 year) to separate collection
- Use pagination (cursor-based) for large datasets

---

## Security Checklist

- [ ] API keys stored in Google Cloud Secret Manager (not in code/git)
- [ ] HTTPS/TLS enforced on all endpoints
- [ ] Google OAuth 2.0 configured with `localhost:3000` + production domain
- [ ] Firestore security rules restrict access by role
- [ ] CORS configured for Vercel domain only
- [ ] Rate limiting on Claude API (avoid runaway costs)
- [ ] Audit logging enabled (all tender status changes)
- [ ] Data retention policy: tender data indefinite, personal data 3 years (POPIA)

---

**Last Updated**: 30 June 2026  
**Version**: 1.0  
**Maintainer**: NexMotion Technologies CTO Team
