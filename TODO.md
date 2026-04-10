# PulseDesk SuperAdmin Login Fix - Safe Production Steps

Status: Awaiting user confirmation for safe local run.

## Safe Steps (No code changes):
- [ ] 1. Terminal: `cd server && npm install`
- [x] 2. `node seed.js` (Safe: checks if superadmin exists)
- [x] 3. `npm start` (Backend localhost:5000, uses prod .env MONGO_URI)
- [ ] 4. New terminal: `npm run dev` (Frontend localhost:3000 auto -> localhost:5000)
- [ ] 5. Test: http://localhost:3000/login with super@admin.com / SuperPassword123!
- [ ] 6. For Vercel prod: Deploy backend with CORS update (diff provided later)

**Credentials Confirmed:** Email: `super@admin.com` Password: `SuperPassword123!`

**Next:** Run `cd server; node seed.js` in PowerShell. Share output. CORS diff ready for prod.
