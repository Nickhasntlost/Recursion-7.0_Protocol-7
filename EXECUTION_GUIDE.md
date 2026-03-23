# 🚀 Execution Guide - ASSEMBLE Event Booking System

This guide provides step-by-step instructions to set up and run the ASSEMBLE event booking platform.

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Running the Application](#running-the-application)
4. [Testing the Features](#testing-the-features)
5. [Building for Production](#building-for-production)
6. [Deployment](#deployment)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
1. **Node.js** (v16.0.0 or higher)
   - Download from: https://nodejs.org/
   - Verify installation:
     ```bash
     node --version
     ```
   - Should output: `v16.x.x` or higher

2. **npm** (comes with Node.js)
   - Verify installation:
     ```bash
     npm --version
     ```
   - Should output: `8.x.x` or higher

3. **Code Editor** (Optional but recommended)
   - Visual Studio Code: https://code.visualstudio.com/
   - Or any other code editor of your choice

### System Requirements
- **Operating System**: Windows 10/11, macOS, or Linux
- **RAM**: Minimum 4GB
- **Disk Space**: At least 500MB free space
- **Internet Connection**: Required for initial setup

---

## Installation

### Step 1: Open Terminal/Command Prompt

**Windows:**
- Press `Win + R`, type `cmd`, press Enter
- Or search for "Command Prompt" in Start Menu

**macOS/Linux:**
- Press `Cmd + Space`, type "Terminal", press Enter
- Or find Terminal in Applications

### Step 2: Navigate to Project Directory

```bash
cd "C:\Users\Keshav suthar\Downloads\stitch_assemble_home_page\stitch_assemble_home_page\frontend"
```

**Note**: Adjust the path based on where you've downloaded the project.

### Step 3: Install Dependencies

```bash
npm install
```

This command will:
- Download all required packages
- Install React, Vite, Tailwind CSS, and other dependencies
- Create a `node_modules` folder
- Take approximately 2-5 minutes depending on your internet speed

**Expected Output:**
```
added 321 packages, and audited 322 packages in 2m
found 0 vulnerabilities
```

### Step 4: Verify Installation

Check if all dependencies are installed:
```bash
npm list --depth=0
```

You should see packages like:
- react@18.2.0
- react-dom@18.2.0
- react-router-dom@6.20.0
- vite@5.0.8
- tailwindcss@3.3.6

---

## Running the Application

### Step 1: Start Development Server

```bash
npm run dev
```

**Expected Output:**
```
  VITE v5.0.8  ready in 523 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### Step 2: Open Browser

The application should automatically open in your default browser at:
```
http://localhost:3000
```

If it doesn't open automatically:
1. Open your browser manually
2. Navigate to `http://localhost:3000`

### Step 3: Verify Application is Running

You should see:
- ✅ The ASSEMBLE home page with floating event cards
- ✅ Navigation bar at the top
- ✅ Event categories section
- ✅ Trending events grid

---

## Testing the Features

### 1. Browse Events

**Home Page:**
- Click on floating event cards to navigate to that category
- Scroll down to see "Browse by Category" section
- Click on category buttons (Dining, Open Mic, Cinema, etc.)

**Category Page:**
- Filter events by price range
- Toggle between "Available Only" and "All Events"
- Click on any event card to view details

### 2. Book an Event

**Event Detail Page:**
1. Select a ticket tier (Standard, Premium, or VIP)
2. Adjust quantity using +/- buttons
3. Click "Book Now" at the bottom
4. You'll be redirected to seat selection

**Seat Selection:**
1. Click on available seats (grey squares)
2. Selected seats turn lime green
3. Click "Continue to Checkout"

**Checkout:**
1. Fill in guest information (First Name, Last Name, Email)
2. Try promo code: `CURATOR15` for 15% discount
3. Select payment method
4. Click "Confirm & Pay"
5. Wait for payment processing

**Confirmation:**
1. See your booking confirmation
2. QR code for event entry
3. Download ticket or add to calendar

### 3. View Bookings

1. Click "My Bookings" in the navigation
2. See all your confirmed bookings
3. View ticket details
4. Cancel bookings if needed

### 4. Waitlist Features

For sold-out events:
1. Click "Join Waitlist" button
2. See your position in the queue
3. Receive notifications when seats become available

### 5. Authentication

**Sign Up:**
1. Click "Sign Up" in navigation
2. Choose user type (Event Attendee or Event Organizer)
3. Fill in details or use OAuth (Google/GitHub)
4. Create account

**Sign In:**
1. Click "Login" in navigation
2. Enter credentials or use OAuth
3. Access personalized features

### 6. Organizer Dashboard

(For Event Organizer accounts)
1. Navigate to Organizer Dashboard
2. View "My Events" tab
3. Click "Create Event" to add new events
4. Monitor bookings and analytics
5. Edit or cancel events

---

## Building for Production

### Step 1: Create Production Build

```bash
npm run build
```

**Expected Output:**
```
vite v5.0.8 building for production...
✓ 1234 modules transformed.
dist/index.html                   1.23 kB │ gzip:  0.67 kB
dist/assets/index-a1b2c3d4.css   45.67 kB │ gzip: 12.34 kB
dist/assets/index-e5f6g7h8.js   234.56 kB │ gzip: 78.90 kB
✓ built in 12.34s
```

### Step 2: Verify Build

The `dist` folder should contain:
- `index.html`
- `assets/` folder with CSS and JS files
- Optimized and minified code

### Step 3: Preview Production Build

```bash
npm run preview
```

Opens at: `http://localhost:4173`

---

## Deployment

### Option 1: Netlify (Recommended)

1. **Create Account**: https://netlify.com
2. **Deploy**:
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli

   # Login
   netlify login

   # Deploy
   netlify deploy --prod
   ```

### Option 2: Vercel

1. **Create Account**: https://vercel.com
2. **Deploy**:
   ```bash
   # Install Vercel CLI
   npm install -g vercel

   # Login
   vercel login

   # Deploy
   vercel --prod
   ```

### Option 3: GitHub Pages

1. **Install gh-pages**:
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add to package.json**:
   ```json
   {
     "homepage": "https://yourusername.github.io/assemble",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **Deploy**:
   ```bash
   npm run deploy
   ```

---

## Troubleshooting

### Issue 1: Port 3000 Already in Use

**Error:**
```
Port 3000 is in use
```

**Solutions:**

**Option A - Use Different Port:**
```bash
# Windows
set PORT=3001 && npm run dev

# macOS/Linux
PORT=3001 npm run dev
```

**Option B - Kill Process:**
```bash
# Windows
npx kill-port 3000

# macOS/Linux
lsof -ti:3000 | xargs kill
```

### Issue 2: npm install Fails

**Error:**
```
npm ERR! code ENOENT
```

**Solutions:**

1. **Clear npm cache:**
   ```bash
   npm cache clean --force
   ```

2. **Delete and reinstall:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Update npm:**
   ```bash
   npm install -g npm@latest
   ```

### Issue 3: Module Not Found

**Error:**
```
Cannot find module 'react'
```

**Solution:**
```bash
npm install react react-dom react-router-dom
```

### Issue 4: Tailwind CSS Not Working

**Error:**
Styles not applying

**Solutions:**

1. **Verify tailwind.config.js exists**
2. **Check index.css has:**
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```
3. **Restart dev server:**
   ```bash
   Ctrl+C (stop server)
   npm run dev (restart)
   ```

### Issue 5: White Screen/Blank Page

**Solutions:**

1. **Check console for errors:**
   - Press F12 in browser
   - Look for error messages

2. **Verify all files exist:**
   ```bash
   ls src/
   # Should show: main.jsx, App.jsx, index.css
   ```

3. **Clear browser cache:**
   - Press Ctrl+Shift+Delete
   - Clear cache and reload

### Issue 6: Images Not Loading

**Error:**
Image URLs return 404

**Solution:**
- Mock images use URLs from Google/Unsplash
- Ensure internet connection is active
- Replace with local images if needed

---

## Quick Reference Commands

| Command | Purpose |
|---------|---------|
| `npm install` | Install dependencies |
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## Performance Tips

1. **Use production build** for better performance
2. **Enable caching** in browser for faster loads
3. **Optimize images** before uploading
4. **Use CDN** for static assets in production
5. **Enable compression** on server

---

## Support & Resources

- **React Documentation**: https://react.dev
- **Vite Documentation**: https://vitejs.dev
- **Tailwind CSS Docs**: https://tailwindcss.com/docs
- **React Router Docs**: https://reactrouter.com

---

## Next Steps

After successful setup:

1. ✅ Explore all features
2. ✅ Test different user flows
3. ✅ Customize mock data
4. ✅ Add backend integration
5. ✅ Deploy to production

---

**Need Help?**

If you encounter issues not covered in this guide:
1. Check browser console (F12) for errors
2. Review error messages carefully
3. Ensure all dependencies are installed
4. Restart development server
5. Clear browser cache

---

**Congratulations! 🎉**

You've successfully set up the ASSEMBLE event booking system. Happy coding!
