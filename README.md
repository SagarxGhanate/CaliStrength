<div align="center">
  <img src="vite-project/src/assets/Logo/Dark%20theme%20logo.png" alt="CaliStrength Logo" width="230" />
  
  # 🤸‍♂️ CaliStrength | Frontend Application
  
  **An intelligent, pure-calisthenics fitness platform driven by AI & Computer Vision.**
  
  [![Hosted on Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://cali-strength.vercel.app)
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)]()
  [![MediaPipe](https://img.shields.io/badge/MediaPipe-00B4A0?style=for-the-badge&logo=mediapipe&logoColor=white)]()
  [![Groq AI](https://img.shields.io/badge/Groq_AI-F36F21?style=for-the-badge&logo=groq&logoColor=white)]()

  [Live Demo](https://cali-strength.vercel.app) • [Backend API Repository](https://github.com/sagarxghanate/calistrength-api) 
</div>

<br />

## 📖 Overview

CaliStrength is a modern, responsive fitness application uniquely dedicated to **calisthenics and bodyweight mastery**. Built with **React**, the frontend features a highly dynamic UI, real-time computer vision tracking, and custom AI coaching to ensure users master their bodyweight safely and effectively.

## 💻 Tech Stack

- **Core Framework:** React.js (Vite)
- **Computer Vision:** Google MediaPipe (Client-side form analysis)
- **AI & Logic:** Groq API integration
- **Authentication:** Firebase (Google & Email Auth)
- **Hosting / CI-CD:** Vercel

## ✨ Key Features & Engineering

- **📷 AI Form Analyzer (MediaPipe + Groq):** Leverages Google's MediaPipe vision models directly in the browser to track user form in real-time, instantly analyzed by Groq AI to correct posture and prevent injury.
- **🧠 Smart Injury Handling:** Adaptive, context-aware logic that modifies daily workout recommendations dynamically if a user reports strain, fatigue, or injury.
- **🎯 Hyper-Personalized Plans:** Proprietary algorithms that generate custom bodyweight routines specific to an individual user's current metrics, strength goals, and skill level.
- **📈 Progressive Overload Engine:** A 15-day smart-split logic that dynamically scales calisthenics intensity for beginners as they grow stronger.

## 🏗️ System Architecture

The client application is designed to be completely decoupled from the FastAPI backend:
1. **Hosting & CI/CD:** Auto-deployed to **Vercel** directly from GitHub pushes for continuous delivery.
2. **Client-Side ML:** MediaPipe runs directly in the client's browser, ensuring zero latency on video frames while offloading heavy AI logic to the Groq API.
3. **Data Fetching:** Interacts seamlessly with the FastAPI backend layer, keeping the React frontend lightweight and fast.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sagarxghanate/calistrength-frontend.git
   cd calistrength-frontend
