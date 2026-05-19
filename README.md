<div align="center">
  <img src="vite-project/src/assets/Logo/Dark%20theme%20logo.png" alt="CaliStrength Logo" width="240" />
  
  # 🤸‍♂️ CaliStrength | Frontend Application
  
  **An intelligent, pure-calisthenics fitness platform driven by AI.**
  
  [![Hosted on Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://cali-strength.vercel.app)
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)]()
  [![Firebase Auth](https://img.shields.io/badge/Firebase_Auth-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)]()
  [![Groq AI](https://img.shields.io/badge/Groq_AI-F36F21?style=for-the-badge&logo=groq&logoColor=white)]()

  [Live Demo](https://cali-strength.vercel.app) • [Backend API Repository](https://github.com/sagarxghanate/calistrength-api) 
</div>

<br />

## 📖 Overview

CaliStrength is a modern, responsive fitness application uniquely dedicated to **calisthenics and bodyweight mastery**. Rather than focusing on heavy weightlifting, this platform helps users master their own bodyweight through progressive skill training (like pull-ups, muscle-ups, and front levers). 

Built with **React**, the frontend features a highly dynamic UI, a custom AI Coaching widget tailored for bodyweight mechanics, and seamless state persistence to track workout streaks. 

## ✨ Key Features

- **🤸 Pure Bodyweight Focus:** Workouts, tracking, and UI elements exclusively designed around calisthenics progression and skill mastery.
- **🤖 AI Calisthenics Coach:** A custom Groq-powered AI widget providing real-time, context-aware advice on bodyweight form, static holds, and workout routines.
- **📈 Progressive Overload Engine:** A 15-day smart-split logic that dynamically scales calisthenics intensity for beginners.
- **🔐 Secure Authentication:** Enterprise-grade Google and Email/Password authentication handled securely via Firebase.
- **📱 Responsive & Premium UI:** Crafted with a modern aesthetic ensuring a flawless experience across mobile and desktop interfaces.

## 🏗️ System Architecture

The client application is designed to be completely decoupled from the FastAPI backend:
1. **Hosting & CI/CD:** Auto-deployed to **Vercel** directly from GitHub pushes for continuous delivery.
2. **Authentication Flow:** Leverages Firebase to issue secure JWTs, which are passed to our Python backend for secure data retrieval.
3. **Data Fetching:** Interacts seamlessly with the FastAPI backend layer, keeping the React frontend lightweight and fast.

## 🚀 Getting Started

### Prerequisites
*(Note: While the backend uses Python, Node.js is required here purely to run the React development environment).*
- Node.js (v18+)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sagarxghanate/calistrength-frontend.git
   cd calistrength-frontend




