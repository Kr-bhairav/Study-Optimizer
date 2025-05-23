# 🚀 SmartStudy - Vercel Deployment Guide

## 📋 **Prerequisites**

1. **GitHub Account** - Your code should be in a GitHub repository
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **MongoDB Atlas** - For your database (free tier available)

## 🗄️ **Step 1: Set Up MongoDB Atlas (Database)**

### **1.1 Create MongoDB Atlas Account**
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Click "Try Free" and create an account
3. Create a new project called "SmartStudy"

### **1.2 Create Database Cluster**
1. Click "Build a Database"
2. Choose "M0 Sandbox" (Free tier)
3. Select a cloud provider and region near you
4. Name your cluster (e.g., "smartstudy-cluster")
5. Click "Create Cluster"

### **1.3 Configure Database Access**
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create username and password (save these!)
5. Set privileges to "Read and write to any database"
6. Click "Add User"

### **1.4 Configure Network Access**
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for now)
4. Click "Confirm"

### **1.5 Get Connection String**
1. Go to "Database" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string (looks like: `mongodb+srv://username:<password>@cluster...`)
5. Replace `<password>` with your actual password

## 🌐 **Step 2: Deploy Backend (Railway - Free Option)**

### **2.1 Set Up Railway**
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project"
4. Choose "Deploy from GitHub repo"
5. Connect your GitHub account and select your repository
6. Choose the `backend` folder

### **2.2 Configure Backend Environment Variables**
In Railway dashboard, add these environment variables:

```
NODE_ENV=production
PORT=5000
MONGODB_URI=your_mongodb_connection_string_here
JWT_SECRET=your_super_secure_jwt_secret_here_minimum_32_characters
FRONTEND_URL=https://smartstudy.vercel.app
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### **2.3 Deploy Backend**
1. Railway will automatically deploy your backend
2. Note the URL (e.g., `https://smartstudy-backend.railway.app`)
3. Test the API by visiting `https://your-backend.railway.app/api`

## 🎨 **Step 3: Deploy Frontend to Vercel**

### **3.1 Push Code to GitHub**
```bash
# In your project root directory
git init
git add .
git commit -m "Initial commit - SmartStudy"
git branch -M main
git remote add origin https://github.com/yourusername/smartstudy.git
git push -u origin main
```

### **3.2 Connect Vercel to GitHub**
1. Go to [vercel.com](https://vercel.com)
2. Sign up/login with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. Select the repository you just created

### **3.3 Configure Vercel Project Settings**
1. **Root Directory**: Set to `frontend`
2. **Framework Preset**: Vite
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Install Command**: `npm install`

### **3.4 Add Environment Variables in Vercel**
In Vercel dashboard, add these variables:

```
VITE_API_BASE_URL=https://your-backend.railway.app/api
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_AI_SERVICE_URL=https://your-ai-service.railway.app
VITE_USE_PYTHON_AI=false
```

### **3.5 Deploy Frontend**
1. Click "Deploy" in Vercel
2. Wait for deployment to complete
3. Your app will be available at `https://smartstudy.vercel.app`

## ✅ **Step 4: Final Configuration**

### **4.1 Update Backend CORS**
Update your Railway backend environment variables:
```
FRONTEND_URL=https://smartstudy.vercel.app
```

### **4.2 Test Your Deployment**
1. Visit your Vercel URL
2. Try registering a new account
3. Login and test basic features
4. Create a study session
5. Test the dashboard

## 🎉 **Congratulations!**

Your SmartStudy app is now live at:
- **Frontend**: `https://smartstudy.vercel.app`
- **Backend API**: `https://your-backend.railway.app/api`
