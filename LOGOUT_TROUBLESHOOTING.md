# Logout Troubleshooting Guide

## Issue: User Cannot Logout

If you're experiencing issues where you cannot logout from your account, here are several solutions:

## 🔧 **Quick Fixes**

### 1. **Use the Logout Button**

- Click on your profile picture/name in the top-right corner of the navbar
- Click "Logout" from the dropdown menu
- You should be redirected to the login page

### 2. **Use Profile Page Logout**

- Go to `/profile` page
- Click the red "Logout" button in the top-right
- You should be redirected to the login page

### 3. **Manual Token Clear (Debug)**

- Go to `/profile` page
- Click the "Clear Token (Debug)" button
- This will force a page reload and clear your session

## 🛠️ **Advanced Solutions**

### 4. **Clear Browser Storage**

1. Open Developer Tools (F12)
2. Go to Application/Storage tab
3. Find "Local Storage" on the left
4. Click on your domain
5. Delete the "token" entry
6. Refresh the page

### 5. **Clear All Browser Data**

1. Open browser settings
2. Clear browsing data
3. Select "All time" for time range
4. Check "Cookies and other site data"
5. Click "Clear data"
6. Refresh the page

### 6. **Check Console for Errors**

1. Open Developer Tools (F12)
2. Go to Console tab
3. Look for any error messages
4. Check if the backend server is running

## 🔍 **Debugging Steps**

### Check if Backend is Running

```bash
# In the backend directory
cd backend
npm run dev
```

### Check Network Requests

1. Open Developer Tools (F12)
2. Go to Network tab
3. Try to logout
4. Check if the API call to `/api/profile` is successful

### Check Local Storage

```javascript
// In browser console
console.log('Token:', localStorage.getItem('token'));
localStorage.removeItem('token');
console.log('Token after removal:', localStorage.getItem('token'));
```

## 🚨 **Common Issues**

### Issue 1: Backend Server Not Running

**Symptoms**: User stays logged in even after clicking logout
**Solution**: Start the backend server with `npm run dev` in the backend directory

### Issue 2: Network Errors

**Symptoms**: Console shows network errors
**Solution**: Check if the backend URL is correct in `/src/app/api/profile/route.ts`

### Issue 3: Token Not Being Cleared

**Symptoms**: Token remains in localStorage
**Solution**: Use the debug button or manually clear localStorage

### Issue 4: Page Not Redirecting

**Symptoms**: User data cleared but page doesn't redirect
**Solution**: Check if there are any JavaScript errors in the console

## 📝 **Code Verification**

### AuthContext Logout Function

```typescript
const logout = () => {
  console.log('Logging out user');
  localStorage.removeItem('token');
  setUser(null);
  setLoading(false);
  router.push('/auth');
};
```

### Navbar Logout Button

```typescript
<button
  onClick={() => {
    setShowUserMenu(false);
    logout();
  }}
  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
>
  <FiLogOut className="inline w-4 h-4 mr-2" />
  Logout
</button>
```

## 🎯 **Testing Steps**

1. **Login to the application**
2. **Try logging out using the navbar dropdown**
3. **Verify you're redirected to `/auth`**
4. **Try logging out using the profile page button**
5. **Verify the token is removed from localStorage**
6. **Refresh the page and verify you're not logged in**

## 📞 **If Issues Persist**

If you're still experiencing logout issues:

1. Check the browser console for errors
2. Verify the backend server is running
3. Try clearing all browser data
4. Check if there are any conflicting browser extensions
5. Try in an incognito/private window

## 🔒 **Security Note**

The debug button should be removed in production. It's only for development and testing purposes.
