# Job Application Agent

## One-time Setup (15 minutes)

### 1. Deploy to Vercel
- Fork this repo or push to GitHub
- Go to vercel.com → New Project → Import repo
- Add these Environment Variables in Vercel dashboard:
  APOLLO_API_KEY         → your Apollo.io API key (Settings → API Keys)
  ANTHROPIC_API_KEY      → console.anthropic.com
  GAMMA_API_KEY          → Gamma app → Settings → Integrations → API
  GMAIL_CLIENT_ID        → Google Cloud Console (see step 3)
  GMAIL_CLIENT_SECRET    → Google Cloud Console (see step 3)
  LOOM_LINK              → your Loom video URL
  VERCEL_URL             → yourapp.vercel.app (without https://)

### 2. Gmail Setup (Google Cloud Console)
- Go to console.cloud.google.com
- Create new project → Enable Gmail API
- OAuth consent screen → External → Add your email as test user
- Credentials → Create OAuth 2.0 Client ID → Web Application
- Add Authorized redirect URI: https://yourapp.vercel.app/api/gmail-callback
- Copy Client ID and Client Secret → paste in Vercel env vars

### 3. Settings in the App
- Open your Vercel URL
- Go to Settings tab
- Paste your Resume Google Drive link (make it "Anyone with link can view")
- Click "Connect Gmail" → complete OAuth popup once
- Green dot = you're connected

### 4. Run Your First Pipeline
- Go to Pipeline tab
- Type a company name (e.g. "OpenAI")
- Click Run Pipeline
- Watch all 4 steps complete (~60 seconds)
- Go to Review tab → approve/edit emails → Send

## Usage
python-free. No terminal. Just a browser.
