# 📚 Smart Study Optimizer

A modern, intelligent study management platform with AI-powered features to optimize your learning experience.

## ✨ Features

- 📅 **Study Session Management** - Create, track, and manage study sessions
- 🤖 **AI Assistant** - Get personalized study advice and generate study plans
- 📊 **Analytics Dashboard** - Visualize your study progress with charts
- 🔔 **Smart Reminders** - Spaced repetition reminders for optimal learning
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- 🌙 **Dark Mode** - Toggle between light and dark themes
- 📈 **Progress Tracking** - Monitor your learning journey

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- MongoDB
- Python 3.8+ (for AI service)

### Installation

#### Backend Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/smart-study-optimizer.git
cd smart-study-optimizer

# Install backend dependencies
cd backend
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your configuration

# Start the backend server
npm run dev
```

#### Frontend Setup
```bash
# Navigate to frontend directory
cd ../frontend

# Install frontend dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your configuration

# Start the frontend development server
npm run dev
```

#### AI Service Setup (Optional)
```bash
# Navigate to AI service directory
cd ../ai-service

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the AI service
python app.py
```

## 🔧 Configuration

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_AI_SERVICE_URL=http://localhost:5001
VITE_USE_PYTHON_AI=true
```

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/smartstudy
JWT_SECRET=your_jwt_secret_here
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-email-password
```

## 📦 Tech Stack

### Frontend
- **React** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Beautiful charts and analytics
- **Axios** - HTTP client for API calls
- **React Router** - Client-side routing

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication
- **Nodemailer** - Email notifications

### AI Service
- **Python** - Programming language
- **Flask** - Web framework
- **OpenAI API** - AI capabilities (optional)

## 🏗️ Project Structure

```
smart-study-optimizer/
├── frontend/                # React frontend
│   ├── public/              # Static files
│   ├── src/                 # Source code
│   │   ├── components/      # React components
│   │   ├── contexts/        # React contexts
│   │   ├── services/        # API services
│   │   └── styles/          # CSS and Tailwind
│   ├── .env                 # Environment variables
│   └── package.json         # Dependencies
│
├── backend/                 # Node.js backend
│   ├── controllers/         # Request handlers
│   ├── models/              # Database models
│   ├── routes/              # API routes
│   ├── services/            # Business logic
│   ├── .env                 # Environment variables
│   └── package.json         # Dependencies
│
└── ai-service/              # Python AI service
    ├── app.py               # Main application
    ├── requirements.txt     # Python dependencies
    └── services/            # AI service modules
```

## 🚀 Deployment

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

## 🔒 Security

- JWT authentication
- Environment-based configuration
- Secure password handling
- CORS protection

## 📊 Analytics

The platform includes comprehensive analytics to track:
- Study time distribution
- Subject focus areas
- Progress over time
- Spaced repetition effectiveness
- Learning patterns

## 🤖 AI Features

- **Intelligent Chat**: Context-aware study advice
- **Smart Study Plans**: Personalized weekly schedules
- **Dynamic Quizzes**: Topic-specific questions with explanations
- **Pattern Analysis**: AI insights from study data

## 🌙 Dark Mode

Toggle between light and dark themes for comfortable studying in any environment.

## 📱 Responsive Design

Fully responsive design that works seamlessly on:
- Desktop computers
- Tablets
- Mobile phones

## 🔧 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👏 Acknowledgements

- OpenAI for AI capabilities
- The React and Node.js communities
- All contributors who have helped shape this project
