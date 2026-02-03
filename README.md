# StudyBuddy - AI-Powered Study Notes & Quiz Platform

## 🔗 Live Demo
[https://ashfaaqkt.com/StudyBuddy-MiniProject-Entri-MERN/](https://ashfaaqkt.com/StudyBuddy-MiniProject-Entri-MERN/)

> [!IMPORTANT]  
> **Security Notice:** For security reasons and to protect the API key, the **Gemini AI features (Quiz Generation & Summarization) are disabled in the live demo**. To experience the full AI functionality, please **download/clone the files from this repository** and run the project on your **localhost** using your own API key as described in the Setup Instructions below.

## 📖 Description
StudyBuddy is a comprehensive AI-powered study platform developed as a **Mini Project for the MERN Full Stack program at Entri Elevate**. It is designed to help students organize their learning efficiently by allowing users to manage study notes, generate automated quizzes from their content, and track performance through interactive analytics.

## ✨ Features
- **Note Management**: Create, edit, and organize rich-text study notes with a modern interface.
- **AI Quiz Generation**: Automatically transform your study notes into multiple-choice quizzes to test your knowledge.
- **AI Study Tools**: Use AI to summarize long notes and highlight key concepts instantly.
- **Performance Analytics**: Track your quiz scores and study progress with visual charts and insights.
- **Responsive design for all devices**: Seamless experience across mobile, tablet, and desktop.
- **AI Integration**: Powered by Google Gemini API for intelligent content processing and quiz creation.

## 🎯 Project Goals
This project was developed as a **Mini Project for Entri Elevate**, aiming to bridge the gap between theoretical learning and practical application. I aimed to master React state management, complex UI patterns using Tailwind CSS, and the practical implementation of AI APIs to create a tool that provides real value to students.

## 🛠 Technologies Used

**Frontend:** React.js
**Styling:** CSS3 / Tailwind CSS (Glassmorphism & Cyber-Workstation theme)
**APIs:** Google Gemini API (gemini-2.0-flash)
**Libraries:** React Router, Recharts, React Icons, React Hook Form, Axios, date-fns, React Quill
**AI Tools:** Google Gemini API
**Deployment:** GitHub Pages

## 🤖 AI Integration 
**Description:**
- **What AI tool/API you used:** I integrated the Google Gemini API (specifically the `gemini-2.0-flash` model) to handle intelligent tasks.
- **How it enhances the user experience:** It automates the tedious task of creating study materials. Users can convert their notes into quizzes or summaries with a single click, providing immediate feedback and reinforcement of their learning.
- **Any challenges faced during integration:** One major challenge was ensuring the AI consistently returned data in a valid JSON format for the quiz generation. This was solved by using strict prompt engineering and robust error handling to fallback to mock data when necessary.

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation Steps
1. Clone the repository
```bash
git clone https://github.com/ashfaaqkt/StudyBuddy-MiniProject-Entri-MERN.git
```
Navigate to project directory
```bash
cd StudyBuddy-MiniProject-Entri-MERN
```
2. Install dependencies
```bash
npm install
```
3. Create `.env` file (if using APIs)
```env
VITE_GEMINI_API_KEY=your_api_key_here
```
4. Start development server
```bash
npm run dev
```
5. Open [http://localhost:5173](http://localhost:5173) in your browser

## 📱 Responsive Design
This application is fully responsive and tested on:
- **Mobile devices** (375px and up)
- **Tablets** (768px and up)
- **Desktop** (1024px and up)

## 📸 Screenshots
The screenshots for this project can be found in the **Screen shot** folder.

## 🎨 Design Choices
- **Glassmorphism**: Implemented a sleek, translucent UI for the header and sidebars to give a premium, modern workstation feel.
- **Dark Theme with Accents**: Used a deep slate and indigo color palette to reduce eye strain and provide a "Cyber-Workstation" aesthetic.
- **Interactive Components**: Used animations and transitions to provide better user feedback during note creation and quiz transitions.

## 🐛 Known Issues
- AI generation may occasionally experience delays or fallbacks due to API rate limits on the free tier.
- Some advanced formatting in notes might be simplified during the AI summary process.

## 🔮 Future Enhancements
- **Multi-user Authentication**: Allowing users to save their notes and progress across different devices.
- **PDF/Image Export**: Ability to download study notes and quiz results as high-quality documents.
- **Peer Comparison**: Optional feature to compare study progress with a global leaderboard.

## 👤 Author
**Ashfaaq Feroz Muhammad**
GitHub: [ashfaaqkt](https://github.com/ashfaaqkt)

## 📄 License
This project is open source and available under the MIT License.

## 🙏 Acknowledgments
- Thanks to the **Entri Elevate** team for providing the project roadmap and support during my MERN Full Stack journey.
- API providers: **Google Gemini API**.
- Icons from **React Icons**.
- Styling powered by **Tailwind CSS**.

