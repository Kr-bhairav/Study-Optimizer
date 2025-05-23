# 🚀 SmartStudy - Deployment Guide

## 📋 Pre-Deployment Checklist

### ✅ **Environment Configuration**
- [ ] Configure production environment variables
- [ ] Set up production database (MongoDB)
- [ ] Configure domain names and SSL certificates
- [ ] Set up OpenAI API key (optional)

### ✅ **Security**
- [ ] Generate strong JWT secret
- [ ] Configure CORS for production domains
- [ ] Set up secure database credentials
- [ ] Enable HTTPS

## 🔧 **Environment Setup**

### **Frontend (.env.production)**
```env
VITE_API_BASE_URL=https://your-backend-domain.com/api
VITE_OPENAI_API_KEY=your_production_openai_api_key_here
VITE_AI_SERVICE_URL=https://your-ai-service-domain.com
VITE_USE_PYTHON_AI=false
```

### **Backend (.env.production)**
```env
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smartstudy
JWT_SECRET=your_super_secure_jwt_secret_key_here_minimum_32_characters
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## 🏗️ **Build Process**

### **Frontend Build**
```bash
cd frontend
npm install
npm run build
```

### **Backend Setup**
```bash
cd backend
npm install
npm start
```

## 🌐 **Deployment Options**

### **Option 1: Vercel + Railway**
- **Frontend**: Deploy to Vercel
- **Backend**: Deploy to Railway
- **Database**: MongoDB Atlas

### **Option 2: Netlify + Heroku**
- **Frontend**: Deploy to Netlify
- **Backend**: Deploy to Heroku
- **Database**: MongoDB Atlas

### **Option 3: VPS/Cloud Server**
- **Server**: DigitalOcean, AWS, or similar
- **Web Server**: Nginx
- **Process Manager**: PM2
- **Database**: MongoDB Atlas or self-hosted

## 🔒 **Security Considerations**

1. **Environment Variables**: Never commit .env files
2. **JWT Secret**: Use a strong, unique secret
3. **Database**: Use strong credentials and whitelist IPs
4. **HTTPS**: Always use SSL in production
5. **CORS**: Configure for specific domains only

## 📊 **Monitoring**

- Set up error logging
- Monitor API response times
- Track user analytics
- Monitor database performance

## 🚨 **Troubleshooting**

### **Common Issues**
1. **CORS Errors**: Check FRONTEND_URL in backend .env
2. **API Connection**: Verify VITE_API_BASE_URL in frontend .env
3. **Database Connection**: Check MongoDB URI and network access
4. **Build Errors**: Ensure all dependencies are installed

### **Debug Mode**
- Set NODE_ENV=development for detailed error logs
- Check browser console for frontend errors
- Monitor server logs for backend issues
