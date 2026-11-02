# Digital Marksheet Management System (DMMS)

A modern, secure, and robust web application for managing, verifying, and distributing academic digital marksheets.

---

## 1. Project Overview

The **Digital Marksheet Management System (DMMS)** is designed to streamline academic marksheet handling for educational institutions, students, and administrators. It ensures proper verification, structured marksheet generation, and seamless record keeping while eliminating manual errors and physical paper dependency.

---

## 2. Technology Stack

### Frontend
- **Framework/Library:** React.js (JavaScript / JSX)
- **Build Tool:** Vite
- **Styling:** Tailwind CSS

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** JavaScript

### Database
- **Database:** MongoDB
- **ODM:** Mongoose

---

## 3. Architecture – Three-Tier Architecture

The backend strictly adheres to a three-tier architecture:

1. **Presentation Layer (Tier 1):**
   - Routes & Controllers
   - Receives HTTP requests, maps endpoints, delegates to services, and returns HTTP responses.
2. **Business Logic Layer (Tier 2):**
   - Services
   - Contains business logic, validations, and data processing.
3. **Data Access Layer (Tier 3):**
   - Mongoose Models & Schemas
   - Handles interactions with the MongoDB database.

### Request-Response Flow

```text
React Page / Component
       ↓
Frontend API Service
       ↓
Backend Route
       ↓
Backend Controller
       ↓
Backend Service
       ↓
Mongoose Model
       ↓
MongoDB Database
```

*(Responses return back through the layers in reverse order)*

---

## 4. Project Folder Structure

```text
digital-marksheet-management-system/
│
├── client/                     # Frontend React application
│   ├── public/                 # Static assets directly served
│   └── src/
│       ├── assets/             # Images, logos, icons
│       ├── components/         # Reusable UI components
│       ├── layouts/            # Page layouts
│       ├── pages/              # Application pages
│       ├── routes/             # Client-side routing configuration
│       ├── services/           # Frontend API communication
│       ├── context/            # React Context providers for global state
│       ├── hooks/              # Custom React hooks
│       ├── utils/              # Client utility functions
│       └── styles/             # Global styling and CSS
│
├── server/                     # Backend Node/Express application
│   ├── config/                 # Database connection and app configuration
│   ├── routes/                 # API endpoint definitions
│   ├── controllers/            # Request handlers and response formatters
│   ├── services/               # Business logic and domain validation
│   ├── models/                 # Mongoose schemas and models
│   ├── middlewares/            # Authentication, authorization, and error handling
│   ├── helpers/                # Reusable helper methods
│   └── utils/                  # General utility functions
│
├── docs/                       # Project documentation, diagrams, specifications
├── DMMS_Project_Progress.docx  # Development progress log tracking all phases
├── .gitignore                  # Git ignore rules
└── README.md                   # Project overview and instructions
```

---

## 5. Development Phases

The project is developed incrementally following defined phases:

- **Phase 0:** Project Initialization and Folder Structure Setup (*Completed*)
- Future phases will be implemented sequentially according to specifications.
