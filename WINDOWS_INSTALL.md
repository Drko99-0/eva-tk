# 🪟 Windows Installation Guide for eva-tk

Complete guide for setting up and using eva-tk on Windows.

## 📋 Prerequisites

### 1. Install Node.js

**Download Node.js (LTS version recommended):**
- Visit: https://nodejs.org/
- Download the Windows Installer (.msi)
- Run the installer and follow the prompts
- Accept the default options

**Verify installation:**
```cmd
node --version
npm --version
```

You should see version numbers like:
```
v20.11.0
10.2.4
```

### 2. Install Git (Optional but recommended)

**Download Git:**
- Visit: https://git-scm.com/download/win
- Download and run the installer
- Use default options

**Verify installation:**
```cmd
git --version
```

## 🚀 Installing eva-tk

### Option 1: Clone from GitHub (Recommended)

```cmd
# Navigate to your preferred directory
cd C:\Users\YourUsername\Documents

# Clone the repository
git clone https://github.com/Drko99-0/eva-tk.git

# Navigate into the directory
cd eva-tk

# Install dependencies
npm install

# Build the project
npm run build
```

### Option 2: Download ZIP

1. Download the ZIP from GitHub
2. Extract to a folder (e.g., `C:\Users\YourUsername\Documents\eva-tk`)
3. Open Command Prompt or PowerShell
4. Navigate to the folder:
   ```cmd
   cd C:\Users\YourUsername\Documents\eva-tk
   ```
5. Install and build:
   ```cmd
   npm install
   npm run build
   ```

## 🎯 Quick Start

### Find Your Chrome Profile

First, identify which Chrome profile has the eva-tk token:

```cmd
npm run dev -- profiles
```

This will show something like:
```
🔍 Detected Chrome Profiles:

  ✓ Active Default
     C:\Users\Idat\AppData\Local\Google\Chrome\User Data\Default\Local Storage\leveldb

  ✓ Active Profile 2
     C:\Users\Idat\AppData\Local\Google\Chrome\User Data\Profile 2\Local Storage\leveldb

Total: 2 profiles, 2 active
```

### Start Monitoring

**Monitor all profiles (recommended):**
```cmd
npm run monitor
```

**Monitor specific profile:**
```cmd
npm run dev -- monitor "Profile 2"
```

### What to Expect

When monitoring starts, you'll see:
```
🚀 eva-tk Token Monitor

🔍 Monitoring profile: Profile 2
📂 Path: C:\Users\Idat\AppData\Local\...\leveldb
⏱️  Check interval: 500ms
💾 Auto-save: enabled

⏳ Waiting for eva-tk token...

Press Ctrl+C to stop monitoring
```

When a token is captured:
```
🎯 TOKEN CAPTURED!

📅 Time: 1/20/2025, 3:45:12 PM
👤 Profile: Profile 2
🔑 Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

📋 Decoded Information:
   User: ln6121081
   ID Alumno: 1761191
   ID Usuario: 474647
   Sede: LN
   Carrera: IDAT
   Expires: 1/22/2025, 11:30:00 AM

💾 Token saved automatically
```

## 📁 Where Are Tokens Saved?

Tokens are saved in the `tokens` folder inside your eva-tk directory:

```
C:\Users\YourUsername\Documents\eva-tk\tokens\
  ├── captured-tokens.json    # History of all tokens
  └── latest-token.txt        # Most recent token
```

### View Latest Token

```cmd
npm run dev -- show-latest
```

### View All Captured Tokens

```cmd
npm run dev -- history
```

## 🔧 Common Commands

### Monitor Commands

```cmd
# Monitor all profiles
npm run monitor

# Monitor specific profile
npm run dev -- monitor "Profile 2"

# Monitor with verbose output
npm run dev -- monitor --verbose

# Monitor with 1-second interval
npm run dev -- monitor --interval 1000

# Monitor without auto-saving
npm run dev -- monitor --no-save
```

### Extract Commands

```cmd
# Try to extract token now (one-time)
npm run extract

# Try all profiles
npm run dev -- extract --all

# Extract and save
npm run dev -- extract --save
```

### Utility Commands

```cmd
# List Chrome profiles
npm run dev -- profiles

# Decode a token
npm run dev -- decode eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Show latest captured token
npm run dev -- show-latest

# Show capture history
npm run dev -- history
```

## 🐛 Troubleshooting

### "No Chrome profiles found"

**Check Chrome installation:**
```cmd
# Verify this path exists
dir "%LOCALAPPDATA%\Google\Chrome\User Data"
```

**If path doesn't exist:**
- Make sure Chrome is installed
- Log into Chrome at least once
- Sync Chrome if using multiple devices

### "Token not found"

**Make sure you're logged in:**
1. Open Chrome
2. Go to the website that creates the eva-tk token
3. Log in to your account
4. Leave the browser open
5. Run the monitor in another terminal

**Try all profiles:**
```cmd
npm run dev -- extract --all
```

### "Failed to read LevelDB"

**Chrome is locking the database:**

**Option 1: Use monitor mode (works with locked files)**
```cmd
npm run monitor
```

**Option 2: Close Chrome completely**
1. Close all Chrome windows
2. Check Task Manager (Ctrl+Shift+Esc)
3. End all Chrome processes
4. Try extract again:
   ```cmd
   npm run extract
   ```

### "npm is not recognized"

**Node.js not installed or not in PATH:**
1. Reinstall Node.js from https://nodejs.org/
2. During installation, check "Add to PATH"
3. Restart your terminal/CMD
4. Verify: `node --version`

### "Cannot find module"

**Dependencies not installed:**
```cmd
# Delete node_modules and reinstall
rmdir /s node_modules
npm install
npm run build
```

### Profile names keep changing

**Chrome profile names can change (Profile 1, Profile 2, etc.)**

**Solution: Use --all flag**
```cmd
npm run dev -- monitor --all
```

This monitors ALL profiles automatically.

## 💡 Tips and Best Practices

### 1. Keep Monitor Running

Start the monitor BEFORE logging into the website:
```cmd
npm run monitor
```

Then log in - the token will be captured immediately.

### 2. Use Verbose Mode for Debugging

```cmd
npm run dev -- monitor --verbose
```

Shows all file changes and checks.

### 3. Monitor All Profiles

If you're not sure which profile:
```cmd
npm run dev -- monitor --all
```

### 4. Check Token Expiration

```cmd
npm run dev -- show-latest
```

Shows when the token expires.

### 5. Copy Token Easily

Tokens are in `tokens\latest-token.txt`

Open in Notepad:
```cmd
notepad tokens\latest-token.txt
```

## 🔐 Security Best Practices

### DO NOT Share Your Tokens!

Tokens are like passwords. They give access to your account.

**Never:**
- Post tokens online
- Share tokens in chat/email
- Commit tokens to git
- Store tokens in public places

**The `tokens/` folder is git-ignored by default** - tokens won't be committed.

### Secure Your Tokens

```cmd
# The tokens folder
C:\Users\YourUsername\Documents\eva-tk\tokens\
```

Make sure only you have access to this folder.

## 📱 Running on Startup (Optional)

### Create a Batch File

Create `start-eva-tk.bat`:
```batch
@echo off
cd C:\Users\YourUsername\Documents\eva-tk
npm run monitor
pause
```

### Create Desktop Shortcut

1. Right-click on `start-eva-tk.bat`
2. Send to → Desktop (create shortcut)
3. Double-click shortcut to start monitoring

## 🆘 Getting Help

### Check Logs

Most errors are shown in the terminal. Look for:
- ❌ Error messages
- ⚠️ Warnings
- Path issues

### Common Error Messages

**"ENOENT: no such file or directory"**
- Path doesn't exist
- Check profile name with `npm run dev -- profiles`

**"EBUSY: resource busy or locked"**
- Chrome has the database locked
- Use monitor mode instead of extract

**"Cannot read properties of undefined"**
- Dependencies not built
- Run `npm run build`

### Still Having Issues?

1. Check this guide again
2. Verify Node.js is installed: `node --version`
3. Verify dependencies: `npm install`
4. Rebuild: `npm run build`
5. Try monitor mode: `npm run monitor`

## 🚀 Advanced Usage

### Custom Check Interval

```cmd
# Check every 100ms (faster, more CPU)
npm run dev -- monitor --interval 100

# Check every 2 seconds (slower, less CPU)
npm run dev -- monitor --interval 2000
```

### Monitor Specific Path

Edit `src/core/chrome-profile-detector.ts` to add custom paths.

### Export Token to File

After capture, copy from:
```cmd
type tokens\latest-token.txt
```

## 📚 Next Steps

1. **Familiarize yourself with commands**
   - Try `npm run dev -- profiles`
   - Try `npm run dev -- extract --all`
   - Try `npm run monitor`

2. **Set up monitoring workflow**
   - Start monitor before logging in
   - Let it capture the token
   - Stop with Ctrl+C

3. **Use the captured token**
   - Find it in `tokens\latest-token.txt`
   - Use for your application/automation

---

**Windows-specific tips:**
- Use Command Prompt or PowerShell (not Git Bash for best compatibility)
- Paths use backslashes: `C:\Users\...`
- Use quotes for paths with spaces: `"Profile 2"`

**Happy token capturing!** 🎯
