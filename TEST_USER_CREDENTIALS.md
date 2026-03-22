# 🧪 Test User Credentials for Mobile Login

## ✅ Test User Created Successfully!

### 📝 Login Credentials

**Email**: `test@polymath-os.dev`  
**Password**: `TestUser123!`  
**Display Name**: Test User  
**User ID**: `test_user_1774156375.846999`

---

## 🔧 Issue Fixed (2026-03-22)

**Problem**: Login was failing with "Invalid credentials" even though user existed in database.

**Root Cause**: Test user was created with bcrypt password hash, but backend uses Argon2id.

**Solution**: Updated `create_test_user.py` to use Argon2id hashing (matching `auth.py`), then recreated the test user.

**Verification**: Backend login test now passes ✅

---

## 🔐 Security Information

- **Password Policy**: Meets minimum 12-character requirement
- **Account Status**: Active (not locked)
- **Failed Attempts**: 0
- **Role**: Standard user

---

## 📱 How to Test Mobile Login UI

### Step 1: Start Backend Server
```bash
cd e:\Other\polymath-os-android\backend
.venv\Scripts\Activate.ps1
uvicorn server:app --host 0.0.0.0 --port 8001
```

### Step 2: Start Mobile App
```bash
cd e:\Other\polymath-os-android\frontend
bunx expo start --tunnel
```

### Step 3: Login Flow
1. Open Expo Go app on your mobile device or emulator
2. Scan the QR code from Expo terminal
3. You'll see the **Login Screen** (`frontend/app/login.tsx`)
4. Enter credentials:
   - Email: `test@polymath-os.dev`
   - Password: `TestUser123!`
5. Tap "Sign In" button

---

## 🎨 UI Elements to Verify

### Login Screen Components:
- [ ] Email input field with proper keyboard type
- [ ] Password input field with show/hide toggle
- [ ] "Sign In" button with loading state
- [ ] Error message display (if credentials are wrong)
- [ ] Link to register screen
- [ ] Proper spacing and typography (M3 design tokens)
- [ ] Theme colors applied correctly
- [ ] Safe area insets respected
- [ ] Keyboard avoiding view working properly

### After Successful Login:
- [ ] Auth gate in `_layout.tsx` redirects to Dashboard
- [ ] Token stored securely in expo-secure-store
- [ ] User state persisted in Zustand store
- [ ] Navigation to main app tabs works correctly

---

## 🔍 UI Audit Checklist

Based on memory: **Element-Level UI Responsiveness Audit Framework**

### Hardcoded Dimensions Check:
- [ ] No fixed pixel values (40px, 44px, 36px) in buttons/inputs
- [ ] All spacing uses `m3Spacing` tokens (8pt grid)
- [ ] Font sizes use `m3Typography` scale, not direct px values

### Pressable Implementation:
- [ ] All touchables use `Pressable` (not `TouchableOpacity`)
- [ ] Proper opacity feedback on press states

### Theme Token Compliance:
- [ ] Colors from `theme` object (M3Palette)
- [ ] No arbitrary bracketed Tailwind values
- [ ] Consistent token usage across platforms

### Responsive Layouts:
- [ ] Dynamic grid columns using `useResponsiveColumns`
- [ ] No hardcoded percentage widths ('48%', '31%')
- [ ] Container queries where applicable

---

## 🐛 Common Issues to Watch For

Based on memory: **Common Pitfalls Experience**

1. **Backend URL IP Mismatch**:
   - If you get "Axios Network Error", check `.env.development`
   - Update `EXPO_PUBLIC_BACKEND_URL` with current IPv4 address
   - Run `ipconfig` to get correct IP

2. **React Hooks Order**:
   - Ensure all hooks are above any early returns
   - No `useMemo`/`useState` after conditional `return`

3. **Missing Component Mount**:
   - If FAB doesn't work, ensure component is imported and rendered
   - Check JSX tree for modal components

---

## 📊 Expected Behavior

### Success Flow:
```
Login Screen → Enter Credentials → Loading State → 
Auth Success → Redirect to Dashboard → Show User Data
```

### Error Scenarios:
- **Invalid credentials**: Shows "Invalid email or password"
- **Account locked**: Shows lockout duration in minutes
- **Inactive account**: Shows "Account is deactivated"
- **Network error**: Check backend URL and connectivity

---

## 🔄 Reset Test User (If Needed)

To delete and recreate the test user:

```python
# Connect to MongoDB
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

async def reset_test_user():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["polymath_os"]
    await db.users.delete_one({"email": "test@polymath-os.dev"})
    print("Test user deleted. Run create_test_user.py again.")

asyncio.run(reset_test_user())
```

---

## 📸 Screenshots to Capture

For UI documentation purposes:
1. Login screen (empty state)
2. Login screen with validation errors
3. Loading state during authentication
4. Dashboard after successful login
5. Theme application across screens
6. Responsive layout on different screen sizes

---

## 🎯 Next Steps After Login Verification

1. **Verify Onboarding Flow** (if first-time user):
   - Theme selection screen
   - Welcome tutorial

2. **Test Core Features**:
   - Activity tracking
   - Journaling
   - Knowledge visualization (mesh/graph)
   - AI agent interactions

3. **Check Cross-Platform Consistency**:
   - Compare mobile UI with web version
   - Verify theme naming unification (void/black)
   - Check token consistency

---

**Created**: 2026-03-22  
**Backend**: FastAPI + MongoDB + JWT Auth  
**Mobile**: React Native + Expo SDK 54  
**Design System**: Material You (M3) + Kole Jain 6-Phase Methodology
