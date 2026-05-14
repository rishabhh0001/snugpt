# SnuGPT - AI Assistant for SNU

## Deployment Instructions

### Frontend (Vercel)
This project is fully ready for Vercel hosting.
1. Push this repository to GitHub.
2. Go to Vercel and import the repository.
3. **IMPORTANT**: In the Vercel project settings, set the **Root Directory** to `frontend`.
4. Add the following Environment Variable in Vercel:
   - `NEXT_PUBLIC_BACKEND_URL`: The production URL of your backend (e.g., `https://your-backend-railway.app`)
5. Deploy!

### Backend (Railway / Render / Fly.io)
1. Deploy the `backend` folder as a Python service.
2. Set the Environment Variable:
   - `NVIDIA_API_KEY`: Your key from build.nvidia.com
3. Set the start command to: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

## Local Development

### Backend
```bash
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Run server
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
