# 🛫 AI Air Ticket Chatbot

An intelligent flight search chatbot powered by OpenAI's GPT models and real-time flight data. The application provides a conversational interface for users to search and compare flight options with natural language queries.

![AI Air Ticket Chatbot Demo](https://img.shields.io/badge/Status-Active-brightgreen)
![Node.js](https://img.shields.io/badge/Node.js-22.18.0+-green)
![Next.js](https://img.shields.io/badge/Next.js-15.4.6-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue)

## 🎬 Demo

https://github.com/user-attachments/assets/c4a86de1-e39e-4665-9344-f1877e30ac12

*Watch the AI chatbot in action - from natural language queries to real-time flight results with streaming responses and intelligent tool calling.*

## ✨ Features

- 🤖 **AI-Powered Conversations**: Natural language flight search using OpenAI GPT models
- 🔄 **Real-time Streaming**: Live streaming responses with typing indicators
- 🛠️ **Function Calling**: Intelligent tool usage for flight data retrieval
- 📱 **Modern UI**: Clean, responsive interface built with Next.js and Tailwind CSS
- 🎯 **Smart Defaults**: Automatic parameter filling for incomplete queries
- 📊 **Flight Comparison**: Detailed flight information with pricing and schedules
- 🌐 **RESTful API**: Well-structured backend with Express.js

## 🏗️ Architecture

```
air-ticket-checker/
├── be/                 # Backend (Express.js + TypeScript)
│   ├── src/
│   │   ├── api/        # API routes and OpenAI integration
│   │   ├── schema/     # Zod validation schemas
│   │   ├── utils/      # Utility functions
│   │   └── server.ts   # Express server entry point
│   └── package.json
├── fe/                 # Frontend (Next.js + TypeScript)
│   ├── app/           # Next.js app directory
│   ├── components/    # React components
│   ├── lib/          # Utility functions
│   ├── types/        # TypeScript type definitions
│   └── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 22.18.0 or higher
- npm or yarn
- OpenAI API key
- RapidAPI key (for flight data)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/air-ticket-checker.git
cd air-ticket-checker
```

### 2. Backend Setup

```bash
cd be
nvm use
npm install
```

Create a `.env` file in the `be` directory:

```env
OPEN_AI_API_KEY=your_openai_api_key_here
OPEN_AI_MODEL=gpt-4o-mini
RAPID_API_KEY=your_rapidapi_key_here
PORT=8100
```

Start the backend server:

```bash
npm run dev
```

The backend will be available at `http://localhost:8100`

### 3. Frontend Setup

```bash
cd fe
nvm use
npm install
```

Start the frontend development server:

```bash
npm run dev
```

The frontend will be available at `http://localhost:8200`

## 🔧 Configuration

### Backend Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPEN_AI_API_KEY` | OpenAI API key for GPT models | Yes |
| `OPEN_AI_MODEL` | OpenAI model to use (e.g., gpt-4o-mini) | Yes |
| `RAPID_API_KEY` | RapidAPI key for flight data | Yes |
| `PORT` | Backend server port | No (default: 3000) |

### Frontend Configuration

The frontend automatically connects to the backend at `http://localhost:8100`. Update the API endpoints in the frontend code if you change the backend port.

## 🛠️ Tech Stack

### Backend
- **Framework**: Express.js
- **Language**: TypeScript
- **AI Integration**: OpenAI GPT API with Function Calling
- **Validation**: Zod schemas
- **HTTP Client**: Axios
- **Development**: tsx, nodemon

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI, shadcn/ui
- **Markdown**: react-markdown
- **HTTP Client**: Axios + Fetch API (for streaming)

## 🎯 API Endpoints

### Backend Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/chat` | POST | Non-streaming chat completion |
| `/chat-stream` | POST | Streaming chat completion with SSE |

### Example Chat Request

```json
{
  "newMessage": {
    "role": "user",
    "content": "Find flights from Sydney to Melbourne tomorrow"
  },
  "history": []
}
```

## 🤖 AI Features

### Function Calling

The chatbot uses OpenAI's function calling feature to intelligently invoke flight search tools:

```typescript
{
  "name": "getFlightInfo",
  "description": "Get information about flights",
  "parameters": {
    "from": "Departure airport",
    "to": "Arrival airport", 
    "startDate": "Departure date (YYYY-MM-DD)",
    "travelClass": "ECONOMY | BUSINESS | FIRST",
    "adults": "Number of adults",
    // ... more parameters
  }
}
```

### Smart Defaults

The AI automatically fills missing parameters:
- **Departure**: Defaults to "Sydney"
- **Travel Class**: Defaults to "ECONOMY" 
- **Passengers**: Defaults to 1 adult
- **Currency**: Defaults to "AUD"
- **Country**: Defaults to "AU"

## 🎨 UI Components

### Chat Interface
- **Message Bubbles**: Styled with Tailwind CSS and markdown support
- **Loading States**: Animated dots for typing and tool execution
- **Streaming**: Real-time text streaming with smooth animations
- **Responsive**: Mobile-friendly design

### Key Components
- `ChatMessage`: Base message component with avatar
- `AIMessage`/`UserMessage`: Specialized message components
- `DotLoader`: Animated loading indicator
- `ToolLoader`: Tool execution indicator

## 🔄 Streaming Implementation

The application uses Server-Sent Events (SSE) for real-time streaming:

1. **Client**: Sends request to `/chat-stream`
2. **Server**: Streams OpenAI responses chunk by chunk
3. **Tool Calls**: Handles function calling mid-stream
4. **Client**: Updates UI in real-time with typing effects

## 📊 Flight Data

Flight information is retrieved from RapidAPI's Google Flights service, providing:
- **Real-time pricing**
- **Multiple airlines**
- **Flight schedules**
- **Duration and stops**
- **Carbon emissions data**

---

Made with ❤️ and ☕ by Jade
