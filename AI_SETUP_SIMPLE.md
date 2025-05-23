# 🤖 AI Setup - OpenAI Integration

## Quick Setup (2 minutes)

### Step 1: Get OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up/login
3. Click "Create new secret key"
4. Copy your API key (starts with `sk-`)

### Step 2: Add API Key to Your App
1. Create a file called `.env` in the `frontend` folder
2. Add this line to the file:
```
VITE_OPENAI_API_KEY=your_actual_api_key_here
```

### Step 3: Restart Your App
```bash
# Stop the frontend if running (Ctrl+C)
# Then restart:
cd frontend
npm run dev
```

## ✅ That's it! 

Your AI is now connected to OpenAI and will provide real, intelligent responses for:
- **Chat conversations** with study advice
- **Study plan generation** with personalized schedules  
- **Quiz creation** with custom questions
- **Pattern analysis** with insights from your data

## 🔧 Troubleshooting

**Error: "OpenAI API key not found"**
- Make sure your `.env` file is in the `frontend` folder
- Make sure the line starts with `VITE_OPENAI_API_KEY=`
- Restart the frontend server

**Error: "OpenAI API Error"**
- Check that your API key is correct
- Make sure you have credits in your OpenAI account
- Check your internet connection

## 💡 Example .env file:
```
VITE_OPENAI_API_KEY=sk-proj-abcd1234efgh5678ijkl9012mnop3456qrst7890uvwx1234yzab5678cdef9012
```

The AI will now provide intelligent, personalized responses powered by OpenAI! 🚀
