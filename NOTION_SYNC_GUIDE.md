# Notion Sync Troubleshooting Guide

## Why "Sync from Notion" Might Not Be Working

The "Sync from Notion" button depends on several prerequisites being met:

### **Prerequisites (in order):**

1. ✅ **Notion Connector Setup in Scalekit**
   - Go to your Scalekit dashboard
   - Navigate to **Connections** → **Create Connection** → **Notion**
   - Configure the Notion app integration

2. ✅ **Clinician is Connected to Notion**
   - On the MediSync Dashboard, you should see the "Notion connect" banner
   - Click **"Connect Notion"** to authenticate
   - This authorizes MediSync to access your Notion workspace
   - You should see status: "NOTION CONNECTED" (green dot)

3. ✅ **Notion Pages/Database Exists**
   - Pages saved from the Session Notes page should exist in Notion
   - OR you should have a manually created Notion database with notes

4. ✅ **VectorAI DB is Running**
   - The background database must be accessible
   - Check: "VECTORAI DB CONNECTED" status badge

## How "Sync from Notion" Works

When you click "Sync from Notion":

1. **Fetches all workspace content** — Uses Scalekit's `notion_data_fetch` tool
2. **Queries each database** — Retrieves all rows from Notion databases
3. **Extracts titles** — Pulls the Name/Title field from each item
4. **Classifies notes** — Determines note type (observation, plan, reflection, etc.)
5. **Stores in VectorAI** — Saves as embeddings for semantic search

## Troubleshooting Checklist

- [ ] **Notion Connector created** in Scalekit dashboard
  - Without this, the notion tools won't work
  - Check: Scalekit → Connections → Notion

- [ ] **Notion Connected** (green NOTION CONNECTED badge visible)
  - Click the "Notion not connected" banner to authenticate
  - Watch for popup to appear

- [ ] **Authentication complete**
  - After connecting, you should see "NOTION CONNECTED" status
  - If banner stays, try refreshing the page

- [ ] **VectorAI running**
  - Should show "VECTORAI DB CONNECTED" status
  - If not: `docker run -d -p 6573:6573 -p 6574:6574 -p 6575:6575 actian/vectorai-db`

- [ ] **Notes exist in Notion**
  - Manually add a test page to your Notion workspace
  - Or save notes via the Session Notes page first

- [ ] **Check server logs**
  - Look for error messages in server console
  - Common error: "connection not found" = Notion connector not set up in Scalekit

## What Happens After Sync

Once "Sync from Notion" succeeds:

- ✅ Notion pages are imported into VectorAI as vector embeddings
- ✅ Notes become searchable by client name and content
- ✅ Pre-session briefs will pull from synced Notion pages
- ✅ Semantic search works across all synced notes

## Common Error Messages & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| "connection not found" | Notion connector not in Scalekit | Set up Notion connection in Scalekit dashboard |
| "No Notion pages found" | Notion authenticated but no pages | Add test pages to Notion workspace |
| "VectorAI unreachable" | DB not running | Start VectorAI: `docker run...` |
| "Permission denied" | Scalekit auth failed | Re-authenticate by clicking "Connect Notion" |

## Test Flow

1. Go to Dashboard
2. See "Notion not connected" message
3. Click "Connect Notion" → Authenticate with Scalekit/Notion
4. See "NOTION CONNECTED" status
5. Click "Sync from Notion" button
6. Wait for sync to complete
7. Check pre-session brief for pulled notes

## If Still Not Working

1. **Check Scalekit setup:**
   ```
   - Dashboard → Settings → API Credentials (have them?)
   - Connections → Notion (is it created?)
   - Notion App → Scalekit (authorized?)
   ```

2. **Check Notion workspace:**
   - Do you have pages/databases?
   - Can you access Notion directly?

3. **Check VectorAI:**
   - Is it running? (Check logs)
   - Port 6574 accessible?

4. **Check browser console:**
   - Open DevTools → Console
   - Look for error messages
   - Report the exact error
