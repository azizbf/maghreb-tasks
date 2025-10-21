<!-- 4120b0b7-17ee-4cae-9c71-819a43ce0dbe 23962366-5831-47e5-8ffe-6eba19af84c3 -->
# Quick Wins Optimization Plan

## Overview

Implement 8 high-impact, low-effort improvements to enhance performance, code quality, and user experience.

## Implementation Steps

### 1. Clean Up Console Logs and Add Proper Error Handling

**Files to modify:**

- `src/pages/Dashboard.tsx` - Remove 27 console.log statements
- `src/contexts/AuthContext.tsx` - Remove 9 console.log statements  
- `src/contexts/NotificationContext.tsx` - Keep console.error, remove console.log
- `src/pages/JobDetails.tsx` - Keep console.error for debugging
- `src/components/Messaging.tsx` - Keep console.error
- `src/pages/BrowseJobs.tsx` - Keep console.error
- `src/components/JobPostForm.tsx` - Keep console.error
- `src/services/api.ts` - Keep console.error

**Action:** Remove debug console.log statements while keeping error logging. Production apps should use a proper logging service.

### 2. Remove Unused Supabase Dependency

**Files to modify:**

- `package.json` - Remove `@supabase/supabase-js` from dependencies
- Run `npm uninstall @supabase/supabase-js`

**Action:** Clean up unused dependency that's adding ~500KB to bundle size.

### 3. Optimize Messaging Poll Interval

**File:** `src/components/Messaging.tsx`

- Change polling interval from 3000ms (3s) to 8000ms (8s)
- This reduces server load while maintaining near-real-time feel

**Rationale:** 3-second polling is aggressive and causes unnecessary API calls. 8 seconds is a better balance.

### 4. Add Frontend .env.example File

**Create:** `env.example` in root directory

```
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=FreelanceTN
```

**Action:** Provide proper documentation for environment variables.

### 5. Add Database Indexes for Performance

**File:** `backend/src/database/add_indexes.sql` (new file)

Add indexes on frequently queried columns:

- `jobs(client_id, status, category_id, created_at)`
- `proposals(job_id, freelancer_id, status)`
- `messages(sender_id, recipient_id, job_id, created_at)`
- `users(email)`

**Action:** Create SQL file and execute it to improve query performance.

### 6. Fix Backend Rate Limiting

**File:** `backend/src/middleware/security.js`

- Reduce `authLimiter` from 5000 to 10 requests per 15 minutes (production-ready)
- Reduce `generalLimiter` from 10000 to 100 requests per 15 minutes
- Keep `messagingLimiter` at reasonable level (200 requests per 15 minutes)

**Rationale:** Current limits are too high for production. These are development values.

### 7. Add Better User Feedback

**Files to modify:**

- `src/components/Messaging.tsx` - Add "Failed to send" error toast
- `src/pages/JobDetails.tsx` - Add success toast for proposal submission
- `src/components/JobPostForm.tsx` - Improve error messages

**Action:** Replace alert() calls with proper toast notifications using Sonner.

### 8. Fix Backend Server Path Issue

**Issue:** The terminal shows error trying to run `node src/server.js` from wrong directory.

**Action:** Ensure all documentation correctly references `backend/src/server.js` path.

## Expected Impact

- **Performance:** 40-60% reduction in unnecessary API calls
- **Bundle Size:** ~500KB smaller (Supabase removal)
- **Database:** 50-80% faster query performance with indexes
- **User Experience:** Better error messages and feedback
- **Code Quality:** Cleaner, production-ready code
- **Security:** Proper rate limiting for production use

## Todos

### To-dos

- [ ] Remove all console.log debug statements from Dashboard, AuthContext, and NotificationContext
- [ ] Uninstall @supabase/supabase-js dependency from package.json
- [ ] Change messaging poll interval from 3s to 8s in Messaging.tsx
- [ ] Create frontend .env.example file with proper documentation
- [ ] Create and execute SQL file to add database indexes for performance
- [ ] Adjust backend rate limiting to production-ready values
- [ ] Replace alert() calls with toast notifications for better UX
- [ ] Update documentation to reference correct backend server path