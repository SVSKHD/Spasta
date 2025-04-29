# TaskFlow - Comprehensive Task & Life Management System

A modern, feature-rich application built with Vue 3, TypeScript, and Firebase, designed to help you manage tasks, track fitness, monitor expenses, and more.

## Features

### 🎯 Task Management

- Kanban board with customizable columns
- Drag and drop task organization
- Priority levels (High, Medium, Low)
- Time tracking with detailed logs
- Progress tracking
- Recurring tasks support
- Due dates and reminders
- Task categories with custom colors
- Rich task descriptions
- Estimated vs actual time tracking

### 📅 Calendar View

- Monthly calendar overview
- Visual task distribution
- Drag and drop task scheduling
- Recurring task visualization
- Color-coded priorities
- Quick task preview

### 💪 Fitness Tracker

- Workout logging
- Exercise details (sets, reps, weight)
- Progress tracking
- Workout history
- Custom workout types
- Duration tracking
- Notes and feedback
- Exercise categorization

### 💰 Expense Management

- Transaction logging
- Category-based organization
- Recurring expenses
- Expense analysis
- Total spending tracking
- Category-wise breakdown
- Date-based filtering
- Currency formatting

### 📈 Trading Journal

- Trade entry logging
- Profit/Loss tracking
- Win rate calculation
- Strategy documentation
- Mistake analysis
- Lessons learned
- Symbol-wise performance
- Trade history

### 💬 Team Chat

- Real-time messaging
- User identification
- Emoji support
- Message timestamps
- Chat history
- User presence
- Message formatting

### 🎨 User Interface

- Dark/Light mode
- Responsive design
- Smooth animations
- Drag and drop interactions
- Toast notifications
- Loading states
- Error handling
- Mobile-friendly

### 🔐 Authentication

- Email authentication
- User profiles
- Secure data access
- Protected routes
- Session management

### 🎉 Extra Features

- Confetti celebrations
- Sound effects
- Activity tracking
- Inactivity detection
- Rest reminders
- Progress animations
- Data persistence
- Real-time updates

## Technical Stack

- **Frontend**: Vue 3, TypeScript
- **State Management**: Pinia
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Build Tool**: Vite
- **UI Components**: HeadlessUI
- **Animations**: Vue Transitions
- **Icons**: Emoji-based
- **Date Handling**: date-fns
- **Effects**: canvas-confetti

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Visit `http://localhost:5173`

## Environment Setup

Create a `.env` file with your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Project Structure

```
src/
  ├── components/     # Vue components
  ├── layouts/       # Layout components
  ├── pages/         # Route pages
  ├── store/         # Pinia stores
  ├── utils/         # Utility functions
  ├── lib/           # Library configurations
  ├── router/        # Vue Router setup
  └── style.css      # Global styles
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - feel free to use this project for personal or commercial purposes.
