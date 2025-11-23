<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1UBiU57lKu0F-R_rnHuRj86fKzZgbqjwG

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

3. Run the app:
   ```bash
   npm run dev
   ```

## Deployment auf Vercel

**Schritt-für-Schritt Anleitung:**

1. **API-Key in Vercel setzen:**
   - Gehe zu deinem Vercel Dashboard: https://vercel.com/dashboard
   - Wähle dein Projekt aus
   - Gehe zu **Settings** → **Environment Variables**
   - Klicke auf **Add New**
   - Name: `GEMINI_API_KEY`
   - Value: `AIzaSyC1A3-DiLCGnoFqTBMW5AFo36-pPwJOqkg` (oder deinen neuen API-Key)
   - Wähle alle Environments (Production, Preview, Development)
   - Klicke auf **Save**

2. **Redeploy:**
   - Nach dem Setzen der Umgebungsvariable, gehe zu **Deployments**
   - Klicke auf die drei Punkte (⋯) bei dem neuesten Deployment
   - Wähle **Redeploy**
   - Oder pushe einen neuen Commit zu GitHub (Vercel deployt automatisch)

**Wichtig:** Der API-Key wird beim Build-Prozess eingebunden. Nach dem Setzen der Umgebungsvariable muss die App neu deployed werden.
