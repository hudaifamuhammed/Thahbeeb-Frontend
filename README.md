# Arts Fest 2024 - College Arts Festival Web Application

A comprehensive web application for managing and showcasing a college arts festival with both admin and user interfaces.

## Features

### Admin Dashboard
- **Secure Authentication**: Firebase Authentication for admin login
- **Team Management**: Create teams, manage captain details, upload Excel files with member lists
- **News Management**: Publish and manage news articles and announcements
- **Item Sheet Management**: Manage competitions with details like name, category, type, venue, and date
- **Gallery Management**: Upload and manage photos and videos with captions
- **Scoreboard Management**: Update scores with automatic calculation of team totals and highlighting toppers

### User Website
- **Landing Page**: Clean, modern homepage with key information
- **Live Scoreboard**: Real-time team and individual score tracking
- **News Feed**: Latest announcements and updates
- **Competition Schedule**: Browse all competitions with filtering options
- **Gallery**: View and download photos and videos from the festival

## Technology Stack

- **Frontend**: React.js with Vite
- **Styling**: Tailwind CSS
- **Backend**: Firebase
  - Firestore (Database)
  - Authentication
  - Storage (File uploads)
  - Hosting
- **Icons**: Lucide React
- **Routing**: React Router DOM

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase project

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd arts-fest-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase:
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Authentication, Firestore, and Storage
   - Copy your Firebase configuration
   - Update `src/firebase/config.js` with your Firebase config

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

### Firebase Configuration

Update the Firebase configuration in `src/firebase/config.js`:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### Firebase Collections

The application uses the following Firestore collections:
- `teams` - Team information and member details
- `news` - News articles and announcements
- `items` - Competition details and schedules
- `gallery` - Photos and videos with metadata
- `scores` - Individual and team scores
- `users` - User authentication data

## Project Structure

```
src/
├── components/
│   ├── admin/
│   │   ├── AdminDashboard.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Login.jsx
│   │   ├── Sidebar.jsx
│   │   ├── TeamManagement.jsx
│   │   ├── NewsManagement.jsx
│   │   ├── ItemSheetManagement.jsx
│   │   ├── GalleryManagement.jsx
│   │   └── ScoreboardManagement.jsx
│   ├── user/
│   │   ├── UserWebsite.jsx
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── Home.jsx
│   │   ├── Scoreboard.jsx
│   │   ├── News.jsx
│   │   ├── ItemSheet.jsx
│   │   └── Gallery.jsx
│   └── common/
│       └── LoadingSpinner.jsx
├── firebase/
│   ├── config.js
│   ├── auth.js
│   ├── firestore.js
│   └── storage.js
├── App.jsx
├── main.jsx
└── index.css
```

## Deployment

### Vercel Deployment

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

### Firebase Hosting

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Build the project:
```bash
npm run build
```

3. Initialize Firebase hosting:
```bash
firebase init hosting
```

4. Deploy:
```bash
firebase deploy
```

## Usage

### Admin Access
- Navigate to `/admin/login`
- Use admin credentials to access the dashboard
- Manage teams, news, competitions, gallery, and scores

### User Access
- Navigate to the root URL `/`
- Browse competitions, view scores, read news, and explore gallery
- All features are publicly accessible

## Features in Detail

### Real-time Updates
- Scoreboard updates in real-time using Firebase listeners
- News feed automatically updates when new articles are published
- Gallery updates when new media is uploaded

### Responsive Design
- Mobile-first approach with Tailwind CSS
- Responsive navigation and layouts
- Optimized for all device sizes

### File Management
- Image and video uploads to Firebase Storage
- Excel file uploads for team member management
- Download functionality for gallery items

### Search and Filtering
- Search functionality across all content types
- Category and type filtering
- Sort options for better organization

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.