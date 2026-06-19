# Incredible India

## Overview
Incredible India is a comprehensive travel platform that allows users to discover destinations, plan trips, book local guides, and ensure their safety during travel. It features an intelligent, floating AI Trip Planner Assistant that can provide personalized travel recommendations. The platform also includes a robust Safety Monitoring system that automatically prompts users during active trips and sends emergency SOS emails to trusted contacts if they fail to check in.

## Architecture & Technology Stack

### Frontend
- **Core**: React, TypeScript, Vite.
- **Styling**: Tailwind CSS.
- **State Management**: React Context API (Auth, Wishlist).
- **HTTP Client**: Axios & native `fetch`.
- **Key UI Features**: Interactive maps, floating AI chatbot, responsive travel itinerary preview, and automated safety check modals.

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB Atlas (managed via Mongoose).
- **Authentication**: JSON Web Tokens (JWT) & bcrypt.
- **Email Service**: Nodemailer (for safety SOS and booking confirmations).
- **Purpose**: Manages user authentication, saves trip plans, handles guide bookings, monitors active trips via background schedulers, and acts as a secure proxy to AI providers.

### AI Integration
- **Provider**: Groq API
- **Models**: `llama-3.3-70b-versatile`
- **Purpose**: Powers the intelligent "Trip Planner Assistant" chatbot, providing instant, context-aware travel recommendations without exposing API keys on the client-side.

## Project Structure
```text
/
├── .gitignore              # Protects secrets and build artifacts
├── package.json            # Root workspace config for monorepo
├── vercel.json             # Vercel deployment and API routing configuration
├── api/                    
│   └── index.js            # Vercel Serverless Function entrypoint
├── backend/                # Express backend application
│   ├── package.json
│   ├── .env                # Backend environment variables
│   └── src/
│       ├── controllers/    # Route controllers (Auth, Chat, Trips, Guides)
│       ├── middleware/     # JWT authentication middleware
│       ├── models/         # Mongoose schemas (User, TripPlan, Booking, Guide)
│       ├── routes/         # Express API routes
│       └── index.js        # Backend entrypoint and background schedulers
└── frontend/               # Vite React frontend application
    ├── package.json
    ├── vite.config.ts      # Vite proxy configuration for local dev
    └── src/
        ├── components/     # Reusable UI components (Chatbot, Modals, Cards)
        ├── contexts/       # React Context providers
        ├── data/           # Static fallback data
        ├── types/          # TypeScript interfaces
        ├── App.tsx         # Main application component and routing logic
        └── main.tsx        # React entrypoint
```

## Setup and Installation

### Prerequisites
- Node.js (v18.0.0 or higher)
- A valid Groq API Key
- A MongoDB Atlas connection string
- A Gmail account (with App Passwords enabled) for Nodemailer

### Local Development Steps

1. **Install Dependencies**
   Navigate to the project root and install the required Node modules for both frontend and backend using NPM Workspaces.
   ```bash
   npm install
   ```

2. **Environment Configuration**
   Navigate to the `backend` folder and create a `.env` file with the following variables:
   ```env
   MONGO_URI=mongodb+srv://<username>:<password>@cluster...
   JWT_SECRET=your_super_secret_jwt_key
   PORT=5000
   GROQ_API_KEY=gsk_your_groq_api_key_here
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_app_password
   ```

3. **Start the Development Servers**
   Open two terminal windows:
   
   **Terminal 1 (Backend):**
   ```bash
   cd backend
   npm start
   ```

   **Terminal 2 (Frontend):**
   ```bash
   cd frontend
   npm run dev
   ```

4. **Access the Application**
   Open your browser and navigate to the Vite local server (usually `http://localhost:5173`). All `/api` requests will be automatically proxied to the backend.

## Deployment (Vercel)
This project is configured as an NPM Workspace Monorepo specifically designed for one-click deployment on Vercel.

1. Import the repository into Vercel.
2. Add your environment variables in the Vercel project settings.
3. Vercel will automatically build the frontend to a static site and deploy `api/index.js` as a Serverless Function to handle backend requests.

## Key Features & Workflows
- **AI Travel Assistant**: A context-aware floating chatbot powered by Groq's LLaMA 3 model that helps users plan their itineraries.
- **Safety Monitoring**: Active trip bookings trigger an automatic safety check interval. If the user fails to click "I'm Safe", an emergency SOS email is automatically sent to their trusted contact with their last known location.
- **Local Guide Marketplace**: Users can browse and book verified local guides for their destinations.
- **Monorepo Architecture**: Clean separation of React frontend and Express backend, united under a single Vercel deployment configuration using relative `/api` paths.
