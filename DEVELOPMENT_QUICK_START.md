# NexMotion Tender Management System – Development Quick Start Guide

**Project Status**: Ready for Development  
**SRS Version**: 1.0  
**Date**: 30 June 2026  
**Repository**: [Your GitHub URL]

---

## 📋 What You're Building

An internal government tender management platform that:
- 🔍 **Discovers** tenders automatically from 5+ government sources daily
- 🤖 **Analyzes** tenders using Claude AI (requirement extraction + fit scoring)
- 📊 **Visualizes** pipeline on a Kanban board (Identified → Won/Lost)
- ✅ **Automates** bid preparation checklists + team assignments
- 🔔 **Alerts** on critical deadlines (7-day, 3-day, 24-hour warnings)
- 📈 **Tracks** win/loss patterns for continuous improvement

**Business Goal**: Win R500K–R1M in government contracts within 12 months.

---

## 📦 Deliverables Included

### 1. **NexMotion_Tender_Management_SRS_v1.0.docx**
   - **11 sections**, 50+ functional requirements
   - Complete architecture, use cases, data model, acceptance criteria
   - **Read this first** – it's your contract with the business

### 2. **tender_management_lovable_prompt.md**
   - Detailed Lovable build instructions
   - UI mockups, component structure, state management
   - **Use this** to start building in Lovable.ai

### 3. **tender_scrapers_and_ai_platforms.md**
   - Free tender sources (E-Tenders, GIBB, municipal portals)
   - Python scraper code template (ready to copy-paste)
   - Claude API integration guide
   - Cost breakdown: R1,450/month (Year 1)

---

## 🚀 Development Roadmap

### **Phase 1: MVP (Weeks 1–4) – Foundation**

**Week 1–2: Backend Infrastructure**
- [ ] Set up Python scraper for E-Tenders + GIBB + Tzaneen municipality
- [ ] Deploy scraper to Google Cloud Run (free tier)
- [ ] Set up Firestore database schema (from SRS Section 8)
- [ ] Configure Cloud Scheduler (daily 6 AM trigger)
- [ ] Set up Firebase project + Google OAuth

**Week 2–3: Frontend Skeleton (Lovable)**
- [ ] Create React app in Lovable
- [ ] Build Dashboard page (basic metrics: opportunities, deadlines)
- [ ] Build Tender List page (sortable table)
- [ ] Build Tender Detail page (view tender + analysis)
- [ ] Implement basic Kanban board (Identified → Shortlisted → Preparing → Submitted → Won/Lost)
- [ ] Set up Google OAuth login

**Week 3–4: AI Integration + Polish**
- [ ] Integrate Claude API for tender analysis
- [ ] Test with manual 5–10 tenders
- [ ] Add error handling + retry logic
- [ ] Go live with MVP dashboard
- [ ] Gather feedback from Casious + Bokang

**MVP Acceptance Criteria** (from SRS Section 10):
- ✅ System scrapes 5 sources daily without errors
- ✅ Minimum 10 new tenders discovered per day
- ✅ Dashboard loads < 2 seconds
- ✅ Kanban drag-drop works smoothly
- ✅ Claude analysis auto-generates per tender

---

### **Phase 2: Enhancement (Weeks 5–8) – Full Bid Lifecycle**

**Week 5–6: Bid Preparation**
- [ ] Auto-generate compliance checklist per tender
- [ ] Implement team assignment system (Casious → tech tasks, Bokang → compliance)
- [ ] Add task tracking (checkbox, due dates, completion status)
- [ ] Build Bid Documents vault (upload + version control)
- [ ] Email notifications when tasks assigned

**Week 6–7: Alerts & Automation**
- [ ] Implement deadline alerts (7-day, 3-day, 1-day emails)
- [ ] SendGrid/Resend integration
- [ ] Dashboard warning badges for approaching deadlines
- [ ] Auto-flag tenders < 7 days to deadline (red status)

**Week 7–8: Reporting & Analytics**
- [ ] Win/loss tracking (capture deal value, outcome reason)
- [ ] Monthly analytics report (submission rate, win rate, revenue)
- [ ] CSV export for pipeline snapshots
- [ ] Dashboard revenue forecasting (sum of submitted bid values)

**Phase 2 Acceptance Criteria**:
- ✅ Compliance checklist auto-generates with ≥ 8 items
- ✅ Email alerts sent on schedule (no missed deadlines)
- ✅ Monthly analytics report generates correctly
- ✅ Team can upload bid documents + track status

---

### **Phase 3: Scale (Weeks 9+) – Polish & Expansion**

**Week 9+:**
- [ ] Expand scraping to Free State municipalities (Bloemfontein, etc.)
- [ ] Mobile-responsive design (test on iPad, Android phone)
- [ ] Performance optimization (< 1 second Kanban interactions)
- [ ] API documentation for future integrations (CRM, HR systems)
- [ ] User documentation + training for team

---

## 💻 Tech Stack (Locked-In)

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | React + TypeScript (Lovable) | Rapid prototyping, familiar to team |
| **State** | Zustand | Lightweight, local state management |
| **Styling** | Tailwind CSS | Utility-first, consistent design |
| **Database** | Firebase Firestore | Serverless, real-time updates, free tier |
| **Backend** | Google Cloud Run (Python) | Scheduled scraper, no server ops |
| **AI Analysis** | Claude API (claude-opus-4-6) | Excellent at document analysis |
| **Authentication** | Google OAuth 2.0 | Team uses Google Workspace |
| **Alerts** | SendGrid or Resend | 99% email delivery SLA |
| **Hosting** | Vercel (frontend) + Cloud Run (backend) | Auto-scaling, minimal ops |

---

## 📊 Repository Structure (Recommended)

```
nexmotion-tender-management/
├── README.md                    (project overview)
├── SRS_v1.0.md                  (copy of SRS content)
├── DEVELOPMENT.md               (this file)
│
├── frontend/                    (Lovable-generated React)
│   ├── src/
│   │   ├── components/          (Kanban, Dashboard, TenderDetail, etc.)
│   │   ├── pages/              (Home, Dashboard, Tenders, Pipeline)
│   │   ├── store/              (Zustand: tenders, users, filters)
│   │   ├── api/                (Firebase SDK calls)
│   │   ├── hooks/              (custom React hooks)
│   │   └── utils/              (helpers, constants)
│   ├── package.json
│   └── .env.example            (VITE_FIREBASE_*, VITE_CLAUDE_API_KEY)
│
├── backend/                     (Python scraper + Cloud Functions)
│   ├── scraper/
│   │   ├── main.py             (entry point)
│   │   ├── sources/            (etenders, gibb, municipalities)
│   │   ├── analyzer.py         (Claude API integration)
│   │   └── firestore_client.py
│   ├── functions/              (Cloud Functions for alerts, cleanup)
│   ├── requirements.txt
│   ├── Dockerfile              (for Cloud Run)
│   └── deploy.sh               (gcloud CLI deployment)
│
├── docs/
│   ├── DATABASE_SCHEMA.md       (Firestore collections)
│   ├── API_DOCUMENTATION.md     (Claude prompt, Firebase queries)
│   ├── DEPLOYMENT_GUIDE.md      (Cloud Run, Vercel, GitHub Actions)
│   └── USER_GUIDE.md            (for Casious, Bokang, PM)
│
├── tests/
│   ├── unit/                    (component, hook tests)
│   ├── integration/             (API, scraper tests)
│   └── e2e/                     (user workflows – Cypress)
│
├── .github/
│   └── workflows/
│       ├── frontend-deploy.yml  (Vercel on push to main)
│       ├── scraper-deploy.yml   (Cloud Run on push to backend/)
│       └── tests.yml            (run tests on PR)
│
└── .env.example                 (Firebase, Claude API keys template)
```

---

## 🔑 Key Configuration Files

### `.env.example` (copy to `.env`, fill in real values)
```
# Frontend (React)
VITE_FIREBASE_PROJECT_ID=nexmotion-tender-dev
VITE_FIREBASE_API_KEY=AIzaXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=nexmotion-tender-dev.firebaseapp.com
VITE_GOOGLE_OAUTH_CLIENT_ID=XXXXX.apps.googleusercontent.com

# Backend (Python Scraper)
GOOGLE_CLOUD_PROJECT=nexmotion-tender-dev
CLAUDE_API_KEY=sk-ant-XXXXXX  # Store in Secret Manager, not .env
SENDGRID_API_KEY=SG.XXXXX    # Store in Secret Manager
```

### `firestore.rules` (Firebase Security Rules)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Authenticated users can read/write their own data
    match /tenders/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid in get(/databases/$(database)/documents/users/$(request.auth.uid)).data.allowedUsers;
    }
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

---

## 🧪 Testing Strategy

### Unit Tests (React Components)
- Dashboard metrics calculation
- Kanban status updates
- Fit score display logic

### Integration Tests (Firebase + API)
- Tender ingestion end-to-end
- Claude API analysis flow
- Email alert triggering

### E2E Tests (User Workflows)
- **Workflow 1**: Discover tender → shortlist → bid prep
- **Workflow 2**: Deadline alerts → submission tracking
- **Workflow 3**: Analytics report generation

**Tools**: Jest (unit), Cypress (E2E)

---

## 🚢 Deployment Checklist

### Pre-Deployment
- [ ] Code reviewed by both CTOs
- [ ] All tests passing (unit, integration, E2E)
- [ ] SRS acceptance criteria verified
- [ ] Security review (no API keys in code/git)
- [ ] POPIA compliance check (no sensitive data exported)

### Deployment Steps
```bash
# 1. Frontend to Vercel (via GitHub Actions on push)
git push origin main
# Vercel auto-deploys to https://nexmotion-tender.vercel.app

# 2. Backend scraper to Cloud Run (via GitHub Actions on push to backend/)
git push origin main  # (backend/ path trigger)
# gcloud run deploy scrape-tenders --source . --platform managed

# 3. Verify scraper runs daily
gcloud scheduler jobs describe daily-tender-scrape
```

### Post-Deployment
- [ ] Test login with Google OAuth
- [ ] Verify scraper ran (check Firestore for new tenders)
- [ ] Check dashboard loads successfully
- [ ] Verify email alerts work (test 7-day alert manually)
- [ ] Confirm Kanban board is responsive

---

## 📞 Support & Communication

### Daily Standup (Async)
- Slack: `#tender-management-dev`
- Update: What did you build? Any blockers?

### Weekly Review (Friday 2 PM SAST)
- Casious + Bokang + Dev team
- Demo feature, discuss next week's priorities

### Escalation Path
- **Blocker on scraper?** → Casious (technical lead)
- **Blocker on compliance checklist?** → Bokang (business lead)
- **Infrastructure issue?** → Google Cloud support or Claude

---

## 💡 Developer Notes

### Common Pitfalls to Avoid

1. **Hardcoding API Keys**: Use Google Cloud Secret Manager or `.env` files (never git)
2. **Scraper Fragility**: Add error handling + retries for each source (HTML structure changes)
3. **Real-Time Updates**: Use Firestore listeners (not polling) for instant Kanban updates
4. **Email Delivery**: Test email alerts in staging first (SendGrid rate limits)
5. **POPIA Compliance**: Don't store tender content that's not public; apply DPA if processing personal data

### Claude API Best Practices

- Prompt includes NexMotion's full capability list (from prompt template)
- Batch analyses for efficiency (collect 5 tenders, analyze together if possible)
- Cache responses to avoid re-analyzing same tender
- Handle 429 rate limits with exponential backoff

### Firestore Best Practices

- **Indexes**: Create composite indexes for queries (dashboard metrics)
- **Security**: Use `.rules` file to enforce role-based access
- **Costs**: Monitor reads/writes (free tier: 25K reads/day, 25K writes/day)
- **Backups**: Enable daily automatic backups (default setting)

---

## 📈 Success Metrics (12-Month Target)

| Metric | Target |
|--------|--------|
| Tenders identified | 500+ |
| Bid submission rate | 15%+ (75 bids submitted) |
| Win rate | 10–15% (7–10 wins) |
| Average deal size | R50K–R100K |
| Total revenue from tenders | R500K–R1M |
| System uptime | 99.5% |
| Dashboard load time | < 2 seconds (95th percentile) |
| Deadline missed | 0 |

---

## 🎯 Next Steps (This Week)

1. **Review SRS** (Casious + Bokang) – any missing requirements?
2. **Set up repository** – GitHub, add team as collaborators
3. **Create Google Cloud project** – Firebase, Secret Manager
4. **Start Lovable frontend** – use `tender_management_lovable_prompt.md`
5. **Deploy Python scraper** – use `tender_scrapers_and_ai_platforms.md`
6. **First integration test** – E-Tenders source, manual tender ingestion

---

## 📚 Document Map

| Document | Purpose | Audience |
|----------|---------|----------|
| **SRS_v1.0.docx** | Formal specification, acceptance criteria | Dev team, stakeholders |
| **tender_management_lovable_prompt.md** | Build instructions, UI/UX, component structure | Frontend developer |
| **tender_scrapers_and_ai_platforms.md** | Scraper code, Claude API, free sources | Backend developer |
| **DEVELOPMENT.md** (this file) | Quick start, roadmap, deployment | All developers |
| **DATABASE_SCHEMA.md** (TBD) | Firestore collections, indexes, queries | Backend, full-stack |
| **DEPLOYMENT_GUIDE.md** (TBD) | Cloud Run, Vercel, GitHub Actions setup | DevOps, whoever deploys |

---

## 📝 License & Ownership

- **Project**: NexMotion Tender Management System
- **Copyright**: NexMotion Technologies (Pty) Ltd, 2026
- **Classification**: Internal – Do Not Distribute
- **Maintainers**: Casious Segeale Mookamedi, Bokang Kgabale

---

**Questions?** Reach out to:
- **CTO (Technical)**: casious@nexmotiontechnologies.co.za
- **CTO (Compliance)**: kgabale@nexmotiontechnologies.co.za
- **DevOps/Infrastructure**: (to be assigned)

**Last Updated**: 30 June 2026  
**Version**: 1.0  
**Status**: Ready for Development
