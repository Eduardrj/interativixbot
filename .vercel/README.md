# Vercel Deployment Configuration

This file lists the environment variables required for production deployment.

## Required Variables

Configure these in **Vercel Dashboard** → **Settings** → **Environment Variables**:

### Supabase (Required)
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Gemini AI (Required for Chat)
```
VITE_GEMINI_API_KEY=AIzaSy...
```

### API Configuration
```
VITE_API_URL=https://interativixbot.vercel.app
```

## How to Get These Values

### Supabase Credentials
1. Go to https://supabase.com/dashboard
2. Select your project (or create new)
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

### Gemini API Key
1. Go to https://aistudio.google.com/apikey
2. Click "Get API Key"
3. Copy the generated key → `VITE_GEMINI_API_KEY`

## Deployment Checklist

- [ ] Configure all environment variables in Vercel
- [ ] Run migrations 002-007 in Supabase SQL Editor
- [ ] Enable Supabase Authentication (Email provider)
- [ ] Configure Supabase Redirect URLs
- [ ] Test build locally: `npm run build`
- [ ] Deploy via Vercel (automatic on git push)
- [ ] Validate production URL
- [ ] Configure custom domain (optional)

## Build Configuration

Vercel should auto-detect these settings:

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install"
}
```

## Troubleshooting

### "Invalid API Key" Error
- Check if environment variables are set in Vercel
- Verify Supabase project is active
- Confirm keys are copied correctly (no extra spaces)

### Build Fails
- Run `npm run build` locally to identify TypeScript errors
- Check Node.js version (should be 18.x or 20.x)
- Verify all dependencies are in package.json

### App Loads but Shows Errors
- Open browser DevTools → Console
- Check Network tab for failed requests
- Verify Supabase RLS policies are configured
- Ensure migrations were executed in correct order

## Support

For deployment issues:
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- GitHub Issues: https://github.com/Eduardrj/interativixbot/issues
