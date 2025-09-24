# Deployment Guide

This guide covers deploying the Arts Fest 2024 application to both Vercel and Firebase Hosting.

## Prerequisites

- Firebase project set up with Authentication, Firestore, and Storage enabled
- Firebase configuration updated in `src/firebase/config.js`
- Node.js and npm installed

## Firebase Configuration

Before deploying, ensure your Firebase configuration is properly set up:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or select existing one
3. Enable the following services:
   - Authentication (Email/Password)
   - Firestore Database
   - Storage
4. Copy your Firebase config and update `src/firebase/config.js`

## Option 1: Vercel Deployment (Recommended)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Deploy
```bash
vercel
```

### Step 4: Configure Environment Variables (if needed)
In Vercel dashboard, add any environment variables if your Firebase config uses them.

### Step 5: Set up Custom Domain (Optional)
- Go to Vercel dashboard
- Select your project
- Go to Settings > Domains
- Add your custom domain

## Option 2: Firebase Hosting

### Step 1: Install Firebase CLI
```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase
```bash
firebase login
```

### Step 3: Initialize Firebase Hosting
```bash
firebase init hosting
```
- Select your Firebase project
- Choose `dist` as public directory
- Configure as single-page app: Yes
- Set up automatic builds: No

### Step 4: Build the Project
```bash
npm run build
```

### Step 5: Deploy
```bash
firebase deploy
```

## Post-Deployment Setup

### 1. Configure Firebase Security Rules

#### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to all collections for public users
    match /{collection}/{document} {
      allow read: if true;
    }
    
    // Allow write access only to authenticated users (admins)
    match /{collection}/{document} {
      allow write: if request.auth != null;
    }
  }
}
```

#### Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow read access to all files
    match /{allPaths=**} {
      allow read: if true;
    }
    
    // Allow write access only to authenticated users (admins)
    match /{allPaths=**} {
      allow write: if request.auth != null;
    }
  }
}
```

### 2. Set up Admin Users

1. Go to Firebase Console > Authentication
2. Add users manually or enable email/password signup
3. Create admin accounts for team management

### 3. Configure CORS (if needed)

If you encounter CORS issues, configure your Firebase project settings:
- Go to Firebase Console > Project Settings
- Add your domain to authorized domains

## Environment Variables

If you want to use environment variables for Firebase config:

1. Create `.env` file:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

2. Update `src/firebase/config.js`:
```javascript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
```

## Monitoring and Maintenance

### 1. Monitor Usage
- Check Firebase Console for usage statistics
- Monitor Firestore reads/writes
- Check Storage usage

### 2. Regular Backups
- Export Firestore data regularly
- Backup important files from Storage

### 3. Performance Optimization
- Monitor bundle size
- Optimize images before upload
- Use Firebase CDN for static assets

## Troubleshooting

### Common Issues

1. **Authentication not working**
   - Check Firebase config
   - Verify Authentication is enabled
   - Check authorized domains

2. **Database access denied**
   - Review Firestore security rules
   - Check user authentication status

3. **File uploads failing**
   - Check Storage security rules
   - Verify file size limits
   - Check CORS configuration

4. **Build errors**
   - Check all dependencies are installed
   - Verify Node.js version compatibility
   - Check for TypeScript errors

### Support

For deployment issues:
1. Check Firebase Console logs
2. Review Vercel/Firebase Hosting logs
3. Test locally with `npm run dev`
4. Check browser console for errors

## Security Considerations

1. **Never commit Firebase config with real keys to public repos**
2. **Use environment variables for production**
3. **Set up proper Firestore security rules**
4. **Enable Firebase App Check for additional security**
5. **Regularly review and update security rules**

## Scaling Considerations

1. **Firestore**: Monitor read/write limits
2. **Storage**: Consider CDN for large files
3. **Authentication**: Monitor concurrent users
4. **Hosting**: Consider caching strategies

This deployment guide should help you successfully deploy your Arts Fest 2024 application to production!
