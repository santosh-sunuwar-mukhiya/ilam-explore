# Ilam Explore 🌄

A full-stack tourism platform designed to help travelers discover destinations, explore attractions, and plan trips in Ilam, Nepal.

**Live Demo:** https://ilam-explore.vercel.app/

**Backend API:** https://ilam-explore-api-4525a971224e.herokuapp.com/

**GitHub Repository:** https://github.com/santosh-sunuwar-mukhiya/ilam-explore

---

## 📌 Overview

Ilam Explore is a full-stack web application built to promote tourism in Ilam, Nepal. It provides a platform where travelers can discover tourist destinations, save their favorite places, share reviews, and organize their travel plans.

The application focuses on providing a user-friendly experience while implementing practical full-stack development concepts, including REST API development, authentication, authorization, database management, image uploads, and secure session handling.

## ✨ Features

### User Authentication & Security
- User registration and login.
- Email verification using OTP.
- JWT-based authentication.
- Secure HTTP-only refresh token cookies.
- Automatic access token renewal.
- Password reset and password change functionality.
- Protected routes and role-based authorization.

### Destination Management
- Browse tourist destinations in Ilam.
- View destination details.
- Upload and manage destination images.
- Cloudinary integration for image storage.

### Reviews & Saved Destinations
- Create and manage destination reviews.
- Save favorite destinations.
- Manage saved places.

### Trip Management
- Create and manage travel plans.
- Add destinations to trips.
- View and organize personal trips.

### User & Admin Management
- User profile management.
- Administrative content management.
- Protected administrative operations.

## 🛠️ Tech Stack

### Frontend
- React.js
- Vite
- JavaScript
- Tailwind CSS
- React Router
- Axios

### Backend
- Node.js
- Express.js
- JavaScript (ES Modules)
- MongoDB
- Mongoose
- JWT Authentication

### Third-Party Services
- Cloudinary – Image storage and management.
- Brevo SMTP – Transactional emails and OTP verification.

### Deployment
- Vercel – Frontend hosting.
- Heroku – Backend hosting.
- MongoDB Atlas – Cloud database.

## 🏗️ Application Architecture

The application follows a client-server architecture.

1. The React frontend provides the user interface and communicates with the backend through HTTP requests.
2. The Express.js backend exposes RESTful API endpoints and handles application business logic.
3. MongoDB stores application data, with Mongoose managing database models and operations.
4. JWT authentication and refresh token handling manage user authentication.
5. Cloudinary handles image storage, while Brevo SMTP handles transactional emails.

```text
                 USER
                   |
                   v
          REACT FRONTEND
             (Vite)
                   |
             HTTP / Axios
                   |
                   v
          EXPRESS.JS SERVER
             (Node.js)
                   |
          -------------------
          |        |        |
          v        v        v
       MongoDB  Cloudinary  Brevo
       Atlas    Images     SMTP
          |
          v
      Application Data
```

## 🔐 Authentication Flow

The application implements an access-token and refresh-token authentication mechanism.

- Users register and verify their email before accessing authenticated functionality.
- Access tokens are used to authorize protected API requests.
- Refresh tokens are stored in HTTP-only cookies.
- Axios interceptors handle expired access tokens and coordinate token refresh requests.
- Password reset and password change functionality provide account recovery and management.

## 📂 Project Structure

```text
ilam-explore/
│
├── frontend/
│   ├── public/
│   ├── src/
│   └── package.json
│
├── backend/
│   ├── src/
│   └── package.json
│
├── .gitignore
└── README.md
```

*The structure above shows the main project organization. Refer to the individual directories for the complete source code.*

## ⚙️ Getting Started

Follow these instructions to run the project locally.

### Prerequisites

Make sure you have installed:

- Node.js
- npm
- MongoDB database (local or MongoDB Atlas)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/santosh-sunuwar-mukhiya/ilam-explore.git

cd ilam-explore
```

### 2. Set Up the Backend

```bash
cd backend

npm install
```

Create a `.env` file in the backend directory and configure the environment variables required by the application.

### 3. Set Up the Frontend

Open another terminal:

```bash
cd frontend

npm install
```

Configure the frontend environment variables required for the backend API URL.

### 4. Run the Application

Check the `scripts` section of each `package.json` to confirm the available commands.

For example, if the development scripts are named `dev`:

**Backend:**

```bash
cd backend
npm run dev
```

**Frontend:**

```bash
cd frontend
npm run dev
```

Open the local frontend URL printed in your terminal.

## 🔑 Environment Variables

The application requires environment variables for database connectivity, authentication, email delivery, image uploads, and frontend-backend communication.

Configure the variables using the names defined in the project's backend and frontend source code.

Typical configuration categories include:

| Category | Purpose |
|---|---|
| Database | MongoDB connection URI |
| Authentication | JWT secrets and token configuration |
| Email | Brevo SMTP credentials |
| Image Storage | Cloudinary credentials |
| Frontend | Backend API base URL |
| Backend | Server port and application configuration |

**Important:** Never commit your `.env` files, API keys, database credentials, or JWT secrets to GitHub. Use `.env.example` to document the required variable names without exposing their values.

## 🔗 API

The backend exposes REST API endpoints under the `/api/v1` namespace.

Example:

```http
GET /api/v1/places
```

This endpoint provides access to the places resource.

Refer to the backend source code for the complete list of routes, request parameters, authentication requirements, and response formats.

## 🧪 Testing

The backend includes tests for application functionality such as saved destinations and trip management.

Run the available test scripts from the backend directory using the commands defined in its `package.json`.

## 🚀 Future Improvements

- Advanced destination search and filtering.
- Interactive maps and location-based discovery.
- Weather information for tourist destinations.
- Improved travel itinerary planning.
- More comprehensive automated testing.
- Performance optimization and caching.
- Enhanced accessibility and responsive UI.

## 👨‍💻 Author

**Santosh Sunuwar Mukhiya**

BSc (Hons) Computing with Artificial Intelligence

- GitHub: https://github.com/santosh-sunuwar-mukhiya

---

If you find this project interesting, feel free to explore the repository and share your feedback.

**Built to promote and explore the beauty of Ilam, Nepal.** 🇳🇵
