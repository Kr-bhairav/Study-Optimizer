# 📚 SmartStudy - Frontend

A modern, responsive React application for intelligent study session management with AI-powered features.

## ✨ Features

- 📅 **Study Session Management** - Create, track, and manage study sessions
- 🤖 **AI Assistant** - Get personalized study advice and generate study plans
- 📊 **Analytics Dashboard** - Visualize your study progress with charts
- 🔔 **Smart Reminders** - Spaced repetition reminders for optimal learning
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- 🌙 **Dark Mode** - Toggle between light and dark themes
- 📈 **Progress Tracking** - Monitor your learning journey

## 🚀 Quick Start

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

## 🔧 Configuration

Create a `.env` file with your configuration:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_AI_SERVICE_URL=http://localhost:5001
VITE_USE_PYTHON_AI=true
```

## 📦 Tech Stack

- **React 19** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Beautiful charts and analytics
- **Axios** - HTTP client for API calls
- **React Router** - Client-side routing

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── AI/             # AI assistant features
│   ├── Analytics/      # Charts and analytics
│   ├── Auth/           # Login and registration
│   ├── Calendar/       # Calendar view
│   ├── Dashboard/      # Main dashboard
│   ├── Layout/         # Header, sidebar, navigation
│   ├── Reminders/      # Spaced repetition reminders
│   ├── Settings/       # User settings
│   ├── StudySessions/  # Study session management
│   └── UI/             # Reusable UI components
├── contexts/           # React contexts (theme, etc.)
├── services/           # API services and utilities
└── styles/             # Global styles and Tailwind config
```
