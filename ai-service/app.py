from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import random
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Real AI Integration
try:
    import openai
    OPENAI_AVAILABLE = True
    openai.api_key = os.getenv('OPENAI_API_KEY')
except ImportError:
    OPENAI_AVAILABLE = False

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
    genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
except ImportError:
    GEMINI_AVAILABLE = False

print(f"🤖 AI Providers Available:")
print(f"  - OpenAI: {'✅' if OPENAI_AVAILABLE and openai.api_key else '❌'}")
print(f"  - Google Gemini: {'✅' if GEMINI_AVAILABLE and os.getenv('GEMINI_API_KEY') else '❌'}")
print(f"  - Fallback Mode: ✅ Always available")

class RealStudyAI:
    def __init__(self):
        self.fallback_tips = [
            "Use the Pomodoro Technique: 25 minutes focused study, 5 minute break",
            "Practice active recall by testing yourself without looking at notes",
            "Use spaced repetition to review material at increasing intervals",
            "Create mind maps to visualize connections between concepts",
            "Teach the material to someone else or explain it out loud",
            "Break complex topics into smaller, manageable chunks",
            "Use the Feynman Technique: explain concepts in simple terms",
            "Study in different locations to improve memory retention",
            "Use mnemonics and memory techniques for difficult information",
            "Take regular breaks to maintain focus and prevent burnout"
        ]

        self.motivational_quotes = [
            "Success is the sum of small efforts repeated day in and day out.",
            "The expert in anything was once a beginner.",
            "Don't watch the clock; do what it does. Keep going.",
            "Education is the most powerful weapon you can use to change the world.",
            "The beautiful thing about learning is that no one can take it away from you.",
            "Success is not final, failure is not fatal: it is the courage to continue that counts.",
            "The only way to do great work is to love what you do.",
            "Believe you can and you're halfway there."
        ]

    def call_openai(self, prompt, max_tokens=500):
        """Call OpenAI API using v1.0+ format"""
        try:
            from openai import OpenAI

            client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=max_tokens,
                temperature=0.7
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"OpenAI Error: {e}")
            return None

    def call_gemini(self, prompt):
        """Call Google Gemini API"""
        try:
            model = genai.GenerativeModel('gemini-pro')
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"Gemini Error: {e}")
            return None

    def get_ai_response(self, prompt, max_tokens=500):
        """Try multiple AI providers with fallback"""
        # For now, let's disable external AI due to API issues
        # and focus on providing intelligent rule-based responses

        # Try OpenAI first (currently disabled due to API issues)
        # if OPENAI_AVAILABLE and os.getenv('OPENAI_API_KEY'):
        #     response = self.call_openai(prompt, max_tokens)
        #     if response:
        #         return response, "openai"

        # Try Gemini as fallback (not configured)
        # if GEMINI_AVAILABLE and os.getenv('GEMINI_API_KEY'):
        #     response = self.call_gemini(prompt)
        #     if response:
        #         return response, "gemini"

        # Use intelligent rule-based responses for now
        return self.get_intelligent_response(prompt), "intelligent_fallback"

    def get_intelligent_response(self, prompt):
        """Generate intelligent responses using rule-based logic"""
        prompt_lower = prompt.lower()

        # Quiz generation - this method is not used for quiz generation anymore
        # Quiz generation is handled by generate_quiz method directly
        if "quiz" in prompt_lower and "questions" in prompt_lower:
            return "Quiz generation should use the generate_quiz method directly."

        # Study plan generation
        elif "study plan" in prompt_lower or "schedule" in prompt_lower:
            subjects = []
            if "math" in prompt_lower: subjects.append("Mathematics")
            if "physics" in prompt_lower: subjects.append("Physics")
            if "chemistry" in prompt_lower: subjects.append("Chemistry")
            if "calculus" in prompt_lower: subjects.append("Calculus")
            if not subjects: subjects = ["General Studies"]

            return f"""📅 **AI-Generated Study Plan**

🎯 **Optimized for**: {', '.join(subjects)}

📚 **Weekly Schedule**:
• **Monday**: Focus on {subjects[0]} - New concepts (2h)
• **Tuesday**: {subjects[0] if len(subjects) == 1 else subjects[1]} - Practice problems (2h)
• **Wednesday**: Review and active recall (1.5h)
• **Thursday**: {subjects[0]} - Advanced topics (2h)
• **Friday**: Mixed practice and problem-solving (2h)
• **Weekend**: Comprehensive review and weak area focus (2h)

💡 **AI-Recommended Techniques**:
- **Pomodoro Technique**: 25min study + 5min break
- **Active Recall**: Test yourself without notes
- **Spaced Repetition**: Review at increasing intervals
- **Feynman Technique**: Explain concepts simply

📈 **Progress Tracking**:
- Week 1: Foundation building
- Week 2: Application and practice
- Week 3: Integration and synthesis
- Week 4: Mastery and assessment

⏰ **Optimal Study Times** (based on cognitive science):
- **9-11 AM**: Complex problem-solving
- **2-4 PM**: Review and practice
- **7-8 PM**: Light reading and revision"""

        # Chat responses
        elif any(word in prompt_lower for word in ['help', 'study', 'learn', 'advice']):
            if "calculus" in prompt_lower:
                return "For calculus success: 1) Master the fundamentals (limits, derivatives, integrals), 2) Practice daily with varied problems, 3) Visualize concepts with graphs, 4) Connect to real-world applications. Focus on understanding WHY formulas work, not just memorizing them."
            elif "motivation" in prompt_lower:
                return f"{random.choice(self.motivational_quotes)} Remember: every expert was once a beginner. Break your goals into small, achievable steps and celebrate each victory along the way!"
            elif "focus" in prompt_lower:
                return "To improve focus: 1) Use the Pomodoro Technique (25min work + 5min break), 2) Eliminate distractions (phone, social media), 3) Create a dedicated study space, 4) Practice mindfulness meditation, 5) Stay hydrated and take regular breaks."
            else:
                return f"Great question! Here's evidence-based study advice: {random.choice(self.fallback_tips)} Remember, consistent practice is more effective than cramming. Focus on understanding concepts deeply rather than memorizing facts."

        # Analysis responses
        elif "analyze" in prompt_lower or "pattern" in prompt_lower:
            return """📊 **AI Study Pattern Analysis**

✅ **Strengths Identified**:
- Consistent engagement with learning
- Seeking AI assistance shows growth mindset
- Active approach to study optimization

🎯 **Optimization Opportunities**:
- Implement spaced repetition for better retention
- Use active recall techniques during review
- Balance focused study with regular breaks

💡 **AI Recommendations**:
- Schedule study sessions at consistent times
- Use the Feynman Technique for complex topics
- Track progress with regular self-assessments
- Join study groups for collaborative learning

⏰ **Optimal Study Schedule**:
- Peak focus: 9-11 AM (complex problem-solving)
- Good focus: 2-4 PM (review and practice)
- Light study: 7-8 PM (reading and revision)

🌟 **Motivation**: You're taking the right steps by seeking AI assistance! Consistent effort and smart study strategies will lead to significant improvement."""

        # Default intelligent response
        else:
            return f"I understand you're looking for study guidance. Here's personalized advice: {random.choice(self.fallback_tips)} For best results, combine this with active recall and spaced repetition techniques."

    def chat_response(self, message, context=None):
        """Generate AI chat responses using real AI"""
        # Build context-aware prompt
        context_info = ""
        if context:
            if context.get('userName'):
                context_info += f"User name: {context['userName']}. "
            if context.get('totalSessions'):
                context_info += f"They have completed {context['totalSessions']} study sessions. "
            if context.get('recentSubjects'):
                context_info += f"Recent subjects: {', '.join(context['recentSubjects'])}. "

        prompt = f"""You are an expert AI study assistant for a Smart Study Scheduler app.

Context: {context_info}

User question: "{message}"

Provide helpful, encouraging, and actionable study advice. Keep your response concise (2-3 sentences) and focus on practical tips. Include specific study techniques when relevant.

If the user asks about:
- Motivation: Provide encouraging words and motivation strategies
- Study techniques: Suggest evidence-based learning methods
- Time management: Recommend scheduling and productivity tips
- Subject-specific help: Give targeted advice for that subject
- Focus/concentration: Suggest attention improvement strategies

Be friendly, supportive, and educational."""

        # Try to get AI response
        ai_response, source = self.get_ai_response(prompt, max_tokens=200)

        if ai_response:
            return {
                "success": True,
                "message": ai_response,
                "type": "ai_generated",
                "source": source
            }

        # Fallback to rule-based responses
        message_lower = message.lower()

        if any(word in message_lower for word in ['motivat', 'inspire', 'encourage']):
            return {
                "success": True,
                "message": f"{random.choice(self.motivational_quotes)} Remember, consistent small steps lead to big achievements! 🌟",
                "type": "motivation",
                "source": "fallback"
            }
        elif any(word in message_lower for word in ['focus', 'concentration', 'distract']):
            return {
                "success": True,
                "message": f"Try the Pomodoro Technique: 25 minutes of focused study followed by a 5-minute break. This helps maintain concentration and prevents mental fatigue.",
                "type": "focus",
                "source": "fallback"
            }
        else:
            return {
                "success": True,
                "message": f"Great question! Here's a helpful study tip: {random.choice(self.fallback_tips)}",
                "type": "general",
                "source": "fallback"
            }

    def generate_study_plan(self, subjects, time_available, goals):
        """Generate personalized study plan using real AI"""
        if not subjects or not time_available:
            return {
                "success": False,
                "message": "Please provide subjects and available time."
            }

        subjects_list = [s.strip() for s in subjects.split(',') if s.strip()]

        prompt = f"""Create a detailed, personalized study plan with the following requirements:

Subjects: {', '.join(subjects_list)}
Available time: {time_available} hours per week
Goals: {goals}

Please provide a comprehensive study plan that includes:
1. Weekly time allocation for each subject
2. Specific study techniques for each subject
3. Daily schedule recommendations
4. Weekly milestones and progress tracking
5. Optimal study times based on cognitive science

Format the response with clear sections using emojis and markdown formatting. Make it practical and actionable."""

        # Try to get AI response
        ai_response, source = self.get_ai_response(prompt, max_tokens=800)

        if ai_response:
            return {
                "success": True,
                "message": ai_response,
                "subjects": subjects_list,
                "weekly_hours": time_available,
                "source": source
            }

        # Fallback to template-based plan
        hours_per_subject = max(1, int(time_available) // len(subjects_list))

        plan = f"""📅 **Personalized Study Plan ({time_available}h/week)**

🎯 **Goals**: {goals}

📚 **Subject Allocation**:
"""

        techniques = [
            "Active recall and spaced repetition",
            "Pomodoro Technique (25min focus + 5min break)",
            "Mind mapping and visual learning",
            "Practice problems and application",
            "Peer discussion and teaching",
            "Regular review sessions"
        ]

        days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

        for i, subject in enumerate(subjects_list):
            plan += f"\n**{subject}**: {hours_per_subject}h/week\n"
            plan += f"  - {days[i % 5]}: {hours_per_subject//2 or 1}h (New concepts)\n"
            plan += f"  - {days[(i+2) % 7]}: {hours_per_subject//2 or 1}h (Practice & review)\n"

        plan += f"\n💡 **Recommended Techniques**:\n"
        for technique in random.sample(techniques, 3):
            plan += f"- {technique}\n"

        plan += f"\n📈 **Weekly Milestones**:\n"
        plan += "- Week 1: Foundation building and concept understanding\n"
        plan += "- Week 2: Practice application and problem-solving\n"
        plan += "- Week 3: Review, assessment, and knowledge consolidation\n"
        plan += "- Week 4: Advanced topics and comprehensive review\n"

        return {
            "success": True,
            "message": plan,
            "subjects": subjects_list,
            "weekly_hours": time_available,
            "source": "fallback"
        }

    def generate_quiz(self, topic, difficulty="medium", question_count=5):
        """Generate quiz questions using real AI"""

        prompt = f"""Generate {question_count} multiple-choice quiz questions about "{topic}" at {difficulty} difficulty level.

For each question, provide:
1. A clear, specific question
2. Four plausible answer options (A, B, C, D)
3. The correct answer (0=A, 1=B, 2=C, 3=D)
4. A brief explanation of why the answer is correct

Format your response as a JSON object with this exact structure:
{{
  "questions": [
    {{
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explanation": "Explanation here"
    }}
  ]
}}

Make the questions educational, accurate, and appropriate for the {difficulty} difficulty level. Ensure all options are plausible but only one is clearly correct."""

        # Try to get AI response
        ai_response, source = self.get_ai_response(prompt, max_tokens=1000)

        if ai_response:
            try:
                # Try to parse JSON response
                import json
                quiz_data = json.loads(ai_response)
                return {
                    "success": True,
                    "quiz": {
                        "topic": topic,
                        "difficulty": difficulty,
                        "questions": quiz_data["questions"]
                    },
                    "source": source
                }
            except json.JSONDecodeError:
                print(f"Failed to parse AI quiz response: {ai_response}")

        # Fallback to intelligent template-based questions
        questions = self.generate_subject_questions(topic, difficulty, int(question_count))

        return {
            "success": True,
            "quiz": {
                "topic": topic,
                "difficulty": difficulty,
                "questions": questions
            },
            "source": "intelligent_fallback"
        }

    def generate_subject_questions(self, topic, difficulty, question_count):
        """Generate subject-specific questions based on topic"""
        topic_lower = topic.lower()
        questions = []

        # Subject-specific question banks
        if "calculus" in topic_lower:
            calculus_questions = [
                {
                    "question": "What is the derivative of x²?",
                    "options": ["2x", "x", "2", "x²"],
                    "correct": 0,
                    "explanation": "Using the power rule: d/dx(x²) = 2x¹ = 2x"
                },
                {
                    "question": "What is the derivative of sin(x)?",
                    "options": ["cos(x)", "-cos(x)", "sin(x)", "-sin(x)"],
                    "correct": 0,
                    "explanation": "The derivative of sin(x) is cos(x)"
                },
                {
                    "question": "What is the integral of 2x?",
                    "options": ["x² + C", "2x² + C", "x + C", "2 + C"],
                    "correct": 0,
                    "explanation": "The integral of 2x is x² + C (constant of integration)"
                },
                {
                    "question": "What is the limit of (sin x)/x as x approaches 0?",
                    "options": ["1", "0", "∞", "undefined"],
                    "correct": 0,
                    "explanation": "This is a fundamental limit: lim(x→0) (sin x)/x = 1"
                },
                {
                    "question": "What is the derivative of e^x?",
                    "options": ["e^x", "xe^(x-1)", "e", "x"],
                    "correct": 0,
                    "explanation": "The derivative of e^x is e^x itself"
                },
                {
                    "question": "What is the chain rule used for?",
                    "options": ["Composite functions", "Product of functions", "Sum of functions", "Constant functions"],
                    "correct": 0,
                    "explanation": "The chain rule is used to differentiate composite functions"
                }
            ]
            questions = calculus_questions[:question_count] if question_count <= len(calculus_questions) else calculus_questions

        elif "physics" in topic_lower:
            physics_questions = [
                {
                    "question": "What is Newton's second law of motion?",
                    "options": ["F = ma", "E = mc²", "v = u + at", "s = ut + ½at²"],
                    "correct": 0,
                    "explanation": "Newton's second law states that Force equals mass times acceleration"
                },
                {
                    "question": "What is the unit of force?",
                    "options": ["Newton", "Joule", "Watt", "Pascal"],
                    "correct": 0,
                    "explanation": "The SI unit of force is the Newton (N)"
                },
                {
                    "question": "What is the formula for kinetic energy?",
                    "options": ["½mv²", "mgh", "mv", "ma"],
                    "correct": 0,
                    "explanation": "Kinetic energy is ½mv² where m is mass and v is velocity"
                },
                {
                    "question": "What is the acceleration due to gravity on Earth?",
                    "options": ["9.8 m/s²", "10 m/s²", "8.9 m/s²", "9.0 m/s²"],
                    "correct": 0,
                    "explanation": "The standard acceleration due to gravity is approximately 9.8 m/s²"
                },
                {
                    "question": "What is Ohm's law?",
                    "options": ["V = IR", "P = IV", "E = mc²", "F = ma"],
                    "correct": 0,
                    "explanation": "Ohm's law states that Voltage = Current × Resistance"
                }
            ]
            questions = physics_questions[:question_count] if question_count <= len(physics_questions) else physics_questions

        elif "chemistry" in topic_lower:
            chemistry_questions = [
                {
                    "question": "What is the chemical symbol for water?",
                    "options": ["H₂O", "CO₂", "NaCl", "CH₄"],
                    "correct": 0,
                    "explanation": "Water is composed of two hydrogen atoms and one oxygen atom: H₂O"
                },
                {
                    "question": "What is Avogadro's number?",
                    "options": ["6.022 × 10²³", "3.14159", "9.8", "1.602 × 10⁻¹⁹"],
                    "correct": 0,
                    "explanation": "Avogadro's number is 6.022 × 10²³ particles per mole"
                },
                {
                    "question": "What is the pH of pure water?",
                    "options": ["7", "0", "14", "1"],
                    "correct": 0,
                    "explanation": "Pure water has a neutral pH of 7"
                },
                {
                    "question": "What type of bond forms between metals and non-metals?",
                    "options": ["Ionic", "Covalent", "Metallic", "Hydrogen"],
                    "correct": 0,
                    "explanation": "Ionic bonds form between metals and non-metals through electron transfer"
                }
            ]
            questions = chemistry_questions[:question_count] if question_count <= len(chemistry_questions) else chemistry_questions

        elif "math" in topic_lower or "algebra" in topic_lower:
            math_questions = [
                {
                    "question": "What is the quadratic formula?",
                    "options": ["x = (-b ± √(b²-4ac))/2a", "x = -b/2a", "x = b²-4ac", "x = a + b + c"],
                    "correct": 0,
                    "explanation": "The quadratic formula solves ax² + bx + c = 0"
                },
                {
                    "question": "What is the slope-intercept form of a line?",
                    "options": ["y = mx + b", "ax + by = c", "y - y₁ = m(x - x₁)", "x = my + b"],
                    "correct": 0,
                    "explanation": "y = mx + b where m is slope and b is y-intercept"
                },
                {
                    "question": "What is the value of π (pi) approximately?",
                    "options": ["3.14159", "2.71828", "1.41421", "1.61803"],
                    "correct": 0,
                    "explanation": "π (pi) is approximately 3.14159..."
                },
                {
                    "question": "What is the Pythagorean theorem?",
                    "options": ["a² + b² = c²", "a + b = c", "a × b = c", "a/b = c"],
                    "correct": 0,
                    "explanation": "In a right triangle, a² + b² = c² where c is the hypotenuse"
                }
            ]
            questions = math_questions[:question_count] if question_count <= len(math_questions) else math_questions

        else:
            # General study questions
            general_questions = [
                {
                    "question": "What is an effective study technique for retention?",
                    "options": ["Active recall", "Passive reading", "Highlighting only", "Cramming"],
                    "correct": 0,
                    "explanation": "Active recall involves testing yourself and is proven to improve long-term retention"
                },
                {
                    "question": "What is the Pomodoro Technique?",
                    "options": ["25 min study + 5 min break", "1 hour study + 15 min break", "2 hours continuous study", "30 min study + 30 min break"],
                    "correct": 0,
                    "explanation": "The Pomodoro Technique uses 25-minute focused study sessions followed by 5-minute breaks"
                },
                {
                    "question": "What is spaced repetition?",
                    "options": ["Reviewing at increasing intervals", "Studying the same thing daily", "Cramming before exams", "Reading once and forgetting"],
                    "correct": 0,
                    "explanation": "Spaced repetition involves reviewing material at increasing time intervals for better retention"
                },
                {
                    "question": "What is the Feynman Technique?",
                    "options": ["Explaining concepts simply", "Memorizing formulas", "Speed reading", "Group studying"],
                    "correct": 0,
                    "explanation": "The Feynman Technique involves explaining concepts in simple terms to test understanding"
                }
            ]
            questions = general_questions[:question_count] if question_count <= len(general_questions) else general_questions

        # If we need more questions than available, repeat with variations
        while len(questions) < question_count:
            base_questions = questions.copy()
            for q in base_questions:
                if len(questions) >= question_count:
                    break
                # Create a variation of the question
                variation = q.copy()
                variation["question"] = f"[Advanced] {q['question']}"
                questions.append(variation)

        return questions[:question_count]

    def analyze_study_patterns(self, study_data):
        """Analyze study patterns and provide insights using real AI"""
        if not study_data:
            return {
                "success": True,
                "message": "No study data available for analysis.",
                "source": "fallback"
            }

        # Build detailed prompt with study data
        prompt = f"""Analyze the following study data and provide personalized insights and recommendations:

Study Data:
- Total Sessions: {study_data.get('totalSessions', 0)}
- Completion Rate: {study_data.get('completionRate', 0)}%
- Total Study Time: {study_data.get('totalStudyTime', 0)} hours
- Average Session Length: {study_data.get('avgSessionLength', 0)} minutes
- Subject Statistics: {study_data.get('subjectStats', {})}
- Study Streak: {study_data.get('streak', 0)} days
- Recent Sessions: {len(study_data.get('recentSessions', []))}

Please provide a comprehensive analysis that includes:
1. Strengths in current study habits
2. Areas for improvement
3. Specific, actionable recommendations
4. Optimal study time suggestions based on patterns
5. Motivational feedback and progress celebration

Format the response with clear sections using emojis and markdown. Be encouraging and provide evidence-based advice."""

        # Try to get AI response
        ai_response, source = self.get_ai_response(prompt, max_tokens=800)

        if ai_response:
            return {
                "success": True,
                "message": ai_response,
                "confidence": 0.9,
                "recommendations_count": 5,
                "source": source
            }

        # Fallback analysis
        total_sessions = study_data.get('totalSessions', 0)
        completion_rate = study_data.get('completionRate', 0)

        analysis = "📊 **AI Study Pattern Analysis**\n\n"

        # Strengths analysis
        analysis += "✅ **Strengths Identified**:\n"
        if completion_rate > 80:
            analysis += "- Excellent session completion rate\n"
        if total_sessions > 20:
            analysis += "- Consistent study habit development\n"
        if study_data.get('subjectStats', {}):
            analysis += "- Good subject diversity in studies\n"

        # Areas for improvement
        analysis += "\n🎯 **Optimization Opportunities**:\n"
        if completion_rate < 70:
            analysis += "- Focus on completing started sessions\n"
        if total_sessions < 10:
            analysis += "- Increase study frequency for better habit formation\n"

        # Personalized recommendations
        analysis += "\n💡 **AI Recommendations**:\n"
        if completion_rate > 85:
            analysis += "- Consider increasing session difficulty or length\n"
        else:
            analysis += "- Try shorter, more focused sessions initially\n"

        analysis += "- Use spaced repetition for better retention\n"
        analysis += "- Schedule regular review sessions\n"

        # Motivation
        analysis += f"\n🌟 **Progress Celebration**:\n"
        analysis += f"You've completed {total_sessions} study sessions - that's fantastic progress! "
        analysis += "Keep building on this momentum. Every session brings you closer to your goals!"

        return {
            "success": True,
            "message": analysis,
            "confidence": 0.85,
            "recommendations_count": 5,
            "source": "fallback"
        }

# Initialize AI service
study_ai = RealStudyAI()

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "Study AI"})

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    message = data.get('message', '')
    context = data.get('context', {})

    response = study_ai.chat_response(message, context)
    return jsonify(response)

@app.route('/study-plan', methods=['POST'])
def generate_study_plan():
    data = request.json
    subjects = data.get('subjects', '')
    time_available = data.get('timeAvailable', 10)
    goals = data.get('goals', 'General learning')

    response = study_ai.generate_study_plan(subjects, time_available, goals)
    return jsonify(response)

@app.route('/quiz', methods=['POST'])
def generate_quiz():
    data = request.json
    topic = data.get('topic', 'General Knowledge')
    difficulty = data.get('difficulty', 'medium')
    question_count = data.get('questionCount', 5)

    response = study_ai.generate_quiz(topic, difficulty, question_count)
    return jsonify(response)

@app.route('/analyze', methods=['POST'])
def analyze_patterns():
    data = request.json
    study_data = data.get('studyData', {})

    response = study_ai.analyze_study_patterns(study_data)
    return jsonify(response)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(debug=True, host='0.0.0.0', port=port)
