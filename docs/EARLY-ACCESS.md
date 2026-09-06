# Early access and traction — 30-seat review cohort

The database enforces 30 enabled seats, including existing reservations and the founder's seat (one at rollout). Email verification happens before explicit enrolment. Sign-in alone neither claims a seat nor joins the waiting list. Simultaneous requests serialize on one database row; the database trigger also protects direct invitation inserts. Disabled accounts cannot bypass the gate by reapplying.

At capacity, verified users explicitly join a private waiting list. They can check their status or leave it; leaving deletes their waiting-list contact row. Admission never sends model requests. Existing global model quotas remain unchanged. Account-free local use is outside this cloud cohort limit and is not silently monitored.

## Owner reporting
Settings → Early-access traction opens the private aggregate report and JSON export. Access is controlled by server-only access_admins, initially seeded from the one existing invited owner. Other users cannot read the dashboard, waiting-list contacts or other users' records. No client telemetry includes prompts, documents, NPR attributes, voice recordings, IP addresses or fingerprints.

Metrics distinguish reserved seats, admitted users, waiting-list contacts, completed setup, users with a saved AI response, AI-active users over UTC day / rolling 7 / 30 days, saved responses, failures, and authenticated download clicks deduplicated per account/platform/day. Existing internal review activity is included and clearly disclosed; do not present all totals as external traction. Snapshot exports include timestamps. Deleted application content drops out of current totals, so snapshots are not an immutable longitudinal cohort dataset.

Anonymous download clicks are not collected. The dashboard also retrieves public GitHub release asset download_count totals (up to 20 releases, cached for five minutes), and separates external admitted accounts from the seeded internal owner account. GitHub is a separate platform-reported download measure; neither that nor click counts proves installation. Offline usage is not measured. Do not claim installs, retention or paying customers from these figures.

## Waiting-list moderation
The operator reviews the oldest waiting entries in Supabase. Do not increase the 30-seat cap. A freed seat should be offered to the oldest suitable waiting applicant before accepting a new entrant. The enrolment function deliberately prevents new users jumping an existing queue. No promotional emails are sent automatically. Releasing seats and promoting waiting members remain operator-controlled SQL operations; preserve the user's identity and audit the change. A full moderation UI is a follow-up.

## Acceptance
Exercise 29/30/31 capacity, duplicate enrolment, disabled accounts, waiting-list withdrawal, non-owner report denial and first-run setup. Test real email-code completion in web and desktop. No purchase, SEIS eligibility or fundraising outcome is implied by the report.
