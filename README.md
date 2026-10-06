# Studio Alex Rivera — Freelance Portfolio & Client Management Platform

A production-ready full-stack digital studio portfolio and client freelance management platform built for a student freelancer targeting tech startups, high-growth modern brands, small businesses, and digital agencies.

The platform bridges the gap between an **elite visual portfolio** and an **operational client portal**, featuring Role-Based Access Control (RBAC), HTTP-only JWT cookie authentication, real-time project milestone tracking, a secure deliverables vault, and an executive administration dashboard.

---

## 🌟 Architecture & Key Features

### 1. Public Portfolio (Visitor Access)
* **Hero Experience:** Engineering digital experiences that scale, interactive geometric particle background, availability status indicator.
* **The Student Advantage Bento Grid:** Framing student status as an agile advantage (rapid adaptation, modern tech adoption, zero agency bloat, production security rigor).
* **Technical Capabilities Marquee & Interactive Grid:** Animated marquee and category-filtered skill proficiencies retrieved from `/api/skills`.
* **Services & Deliverables:** High-Converting Landing Pages, UI & Component Systems, and Full-Stack MVP Development retrieved dynamically from `/api/services`.
* **Case Study Details (`/projects/:slug`):** Dedicated deep-dive pages detailing problem statements, technical architecture, feature checklists, and process notes.
* **Contact System (`POST /api/contact`):** Rate-limited form submissions stored in MongoDB, with optional server-side SMTP email notifications.

### 2. Client Portal (Client Access — `role: 'client'`)
* **Dedicated Authentication (`/client/login`, `/client/register`):** Secure bcrypt password hashing and HTTP-only cookie sessions.
* **Dashboard Overview (`/client/dashboard`):** Real-time statistics on active projects, completed deliveries, unread messages, and pending milestones.
* **Project Workspace (`/client/projects/:id`):** 
  * Milestone progress bar (0–100%) and timeline stages (Pending, In-Progress, Completed).
  * Secure Project Files vault with one-click downloads.
  * Direct bidirectional conversation thread with the developer.
* **Strict Resource Ownership Guard:** Clients can **only** inspect projects, files, and conversations assigned to their account. Attempting to access another client's project returns `403 Forbidden`.

### 3. Admin Studio Console (Administrator Access — `role: 'admin'`)
* **Executive Overview (`/admin/dashboard`):** Aggregated metrics across active client contracts, portfolio showcases, unread messages, and completion velocity.
* **Project Management (`/admin/projects`):** Full CRUD for portfolio and client projects, milestone authoring, file attachments, and public/featured toggles.
* **Client Management (`/admin/clients`):** Create client accounts, update company profiles, assign projects, or deactivate access.
* **Service & Skill CRUD (`/admin/services`, `/admin/skills`):** Edit service descriptions and skill proficiencies that render in real-time on the public homepage.
* **Communications Hub (`/admin/messages`):** Manage inbound contact submissions (Read, Replied, Archived) and reply directly to client project threads.
* **User & Role Governance (`/admin/users`):** Audit registered users, reset passwords, and toggle roles.
* **Settings & Availability (`/admin/settings`):** Live editing of hero headlines, availability quarters (e.g., `Q4 2026`), and response times.
* **Quantitative Analytics (`/admin/analytics`):** Visual distribution charts covering project lifecycle statuses, project types, and average progress.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Tailwind CSS, Framer Motion, Lucide React, React Router 6, Vite |
| **Backend** | Node.js, Express.js, TypeScript, REST API, Zod |
| **Database** | MongoDB, Mongoose ORM |
| **Security & Auth** | JWT in HTTP-Only Cookies, bcryptjs (10 salt rounds), Helmet, CORS (`credentials: true`), express-rate-limit |
| **Deployment Ready**| Frontend: Vercel / Netlify \| Backend: Render / Railway \| Database: MongoDB Atlas |

---

## 🔒 Role-Based Access Control (RBAC) Matrix

| Resource / Action | Visitor | Client | Admin |
| :--- | :---: | :---: | :---: |
| View Public Portfolio & Case Studies | ✅ | ✅ | ✅ |
| Submit Public Contact Form | ✅ | ✅ | ✅ |
| View Client Dashboard | ❌ | ✅ (Own Data) | ✅ (All Data) |
| View Client Projects & Milestones | ❌ | ✅ (Assigned Only) | ✅ (All Projects) |
| Download Project Files | ❌ | ✅ (Assigned Only) | ✅ (All Files) |
| Exchange Project Messages | ❌ | ✅ (Assigned Only) | ✅ (All Clients) |
| Create / Edit / Delete Portfolio Projects | ❌ | ❌ | ✅ |
| Manage Services & Skills | ❌ | ❌ | ✅ |
| Manage Clients & User Roles | ❌ | ❌ | ✅ |
| Modify Studio Availability & Settings | ❌ | ❌ | ✅ |

Backend middleware strictly validates role tokens and resource ownership on every protected endpoint:
```typescript
// Example: Client Project Authorization Middleware
export const checkProjectOwnership = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const project = await Project.findById(req.params.id);
  if (req.user.role === 'admin') return next(); // Admin bypass
  if (req.user.role === 'client' && project.clientId.toString() === req.user._id.toString()) {
    return next();
  }
  return res.status(403).json({ success: false, message: "Forbidden: You don't have permission." });
};
```

---

## 📁 Repository Directory Structure

```text
portfolio/
│
├── client/                     # Frontend Application
│   ├── src/
│   │   ├── components/         # Navbar, Footer, Background, Badges
│   │   ├── sections/           # Hero, Bento, TechStack, Services, Projects, Contact
│   │   ├── pages/
│   │   │   ├── public/         # HomePage, ProjectDetailPage
│   │   │   ├── client/         # ClientLogin, Register, Dashboard, Projects, Files, Messages, Profile
│   │   │   └── admin/          # AdminLogin, Dashboard, Projects, Clients, Services, Skills, Messages, Settings
│   │   ├── layouts/            # PublicLayout, ClientLayout, AdminLayout
│   │   ├── context/            # AuthContext (JWT cookie session management)
│   │   ├── services/           # api.ts (fetch wrapper with credentials: 'include')
│   │   ├── types/              # TypeScript interfaces
│   │   ├── App.tsx             # React Router hierarchy
│   │   └── main.tsx            # Vite root entry
│   ├── tailwind.config.js      # Custom dark theme (#0B0B0F) and emerald accents (#00E676)
│   ├── vite.config.ts          # Proxy /api to backend port 5000
│   └── package.json
│
├── server/                     # Backend Application
│   ├── src/
│   │   ├── config/             # MongoDB Mongoose connection
│   │   ├── models/             # User, ClientProfile, Project, Milestone, ProjectFile, Message, Service, Skill, Settings
│   │   ├── middleware/         # authenticateUser, requireRole, checkProjectOwnership
│   │   ├── controllers/        # auth, project, client, admin, service, skill, contact, settings
│   │   ├── routes/             # RESTful API route definitions
│   │   ├── utils/              # JWT cookie tokens, seed script, automated test runner
│   │   └── server.ts           # Express server entry point with Helmet, CORS, and Cookie Parser
│   ├── .env                    # Local environment variables
│   ├── tsconfig.json
│   └── package.json
│
├── .env.example                # Environment configuration template
├── README.md                   # Complete platform documentation
└── package.json                # Root orchestration scripts
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher
* **MongoDB**: Running locally on `mongodb://127.0.0.1:27017` or a MongoDB Atlas URI

### 1. Installation
Clone the repository and install all dependencies:
```bash
npm run install:all
```

### 2. Environment Configuration
Copy `.env.example` to `server/.env`:
```bash
cp .env.example server/.env
```
Ensure your configuration matches your environment:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/portfolio_platform
JWT_SECRET=super_secret_jwt_production_signing_key_2026
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:5000
```

### 3. Seed Database with Production Data
Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `server/.env`, then run the seed script to populate the database. Seeding clears existing collections.
```bash
npm run seed
```

Contact form inquiries are always stored in MongoDB. To receive email notifications, configure
`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, and `SMTP_PASSWORD` in `server/.env`. The notification recipient
defaults to the contact email in Website Settings. For Gmail SMTP, use a Google App Password rather
than your normal account password.

### 4. Run Development Servers
Start both the backend API and frontend Vite server together:
```bash
npm run dev
```
The frontend starts after the API is healthy. MongoDB must be running locally (or `MONGODB_URI` must point to an available database). You can still run `npm run dev:server` and `npm run dev:client` separately when needed.
Visit `http://localhost:5173` in your browser.

### 5. Deployment API Configuration

When the frontend and API are deployed separately, set the frontend build environment variable
`VITE_API_BASE_URL` to the backend URL ending in `/api` (for example,
`https://your-api.example.com/api`) and redeploy the frontend. Set the backend `CLIENT_URL` to the
exact deployed frontend origin (for example, `https://your-site.example.com`) and configure its
production MongoDB URI, JWT secret, and email credentials in the backend host's environment settings.
The API must also be deployed with this repository's latest server code. An unset frontend API URL
works with the local Vite proxy, but in production it sends `/api` requests to the frontend host.

---

## 🔑 Pre-Configured Demo Accounts

| Role | Email | Password | Access URL | Features |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | Configured by `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `server/.env` | Configured locally | `/admin/login` | Full platform control, project CRUD, milestone manager, client creation, inquiries inbox, settings. |
| **Client** | `client@acme.com` | `ClientPassword123!` | `/client/login` | Private workspace ("Acme Ventures Portal"), milestone tracking, files vault, direct chat with Alex. |
| **Visitor** | *(No account required)* | *(Public)* | `/` | Portfolio viewing, case studies, skill inspection, contact form submission. |

The admin password is kept on the server and is never embedded in the frontend.

---

## 📡 API Reference Overview

### Public Endpoints
* `GET /api/projects`: List published portfolio projects (supports `?featured=true&category=...`).
* `GET /api/projects/:slug`: Case study details for a published project.
* `GET /api/services`: List enabled services.
* `GET /api/skills`: List skills and proficiency ratings.
* `GET /api/settings`: Studio hero copy, availability quarter, and social links.
* `POST /api/contact`: Submit contact inquiry (rate-limited).

### Authentication Endpoints
* `POST /api/auth/register`: Register new client account.
* `POST /api/auth/login`: Authenticate client or admin, sets HTTP-only cookie.
* `POST /api/auth/logout`: Clears session cookie.
* `GET /api/auth/me`: Retrieves current session user and client profile.
* `PUT /api/auth/profile`: Update profile information (safe fields only).

### Client Portal Endpoints (`requireClient`)
* `GET /api/client/dashboard`: Active projects, completed deliveries, unread messages, pending milestones.
* `GET /api/client/projects`: List projects owned by the authenticated client.
* `GET /api/client/projects/:id`: Milestone timeline, files, and chat messages for a specific project.
* `GET /api/client/files`: All files belonging to client's assigned projects.
* `GET /api/client/messages`: Active conversations.
* `POST /api/client/messages`: Send project message to developer.

### Admin Console Endpoints (`requireAdmin`)
* `GET /api/admin/dashboard`: Studio aggregated metrics.
* `GET /api/admin/projects`: All portfolio and client projects.
* `POST /api/projects`: Create portfolio or client project.
* `PUT /api/projects/:id`: Update project parameters.
* `DELETE /api/projects/:id`: Delete project and cascading records.
* `POST /api/projects/:projectId/milestones`: Create milestone stage.
* `PUT /api/projects/milestones/:milestoneId`: Complete or update milestone.
* `GET /api/admin/clients`: View all registered clients with project counts.
* `POST /api/admin/clients`: Provision new client account directly.
* `PUT /api/admin/clients/:id`: Update client status (active/disabled).
* `GET /api/admin/users`: List platform users.
* `PUT /api/admin/users/:id/role`: Change user roles and activation states.
* `GET /api/admin/messages`: View public inquiries and client chats.
* `POST /api/admin/messages/reply`: Reply to client project thread.
* `GET /api/admin/analytics`: Compute lifecycle distributions and progress averages.
* `PUT /api/admin/settings`: Save live studio copy and availability.

---

## 🚢 Production Deployment

### 1. Frontend (Vercel)
1. Push repository to GitHub.
2. Import the `client` directory in Vercel.
3. Set build command: `npm run build` and output directory: `dist`.
4. Add Environment Variable:
   * `VITE_API_URL`: Your deployed backend URL (e.g., `https://api.yourdomain.dev`).

### 2. Backend (Render / Railway)
1. Create a Web Service pointing to the `server` directory.
2. Build command: `npm run build`
3. Start command: `node dist/server.js`
4. Set Environment Variables:
   * `PORT`: `5000`
   * `NODE_ENV`: `production`
   * `MONGODB_URI`: Your MongoDB Atlas connection string (`mongodb+srv://...`)
   * `JWT_SECRET`: A cryptographically random secret string
   * `CLIENT_URL`: Your Vercel frontend URL (e.g., `https://yourdomain.dev`)

### 3. Database (MongoDB Atlas)
1. Create a free M0 cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Configure Database User credentials and whitelist Network Access (`0.0.0.0/0`).
3. Connect using the connection string in your backend environment variables.
4. Run `npm run seed` once to initialize the production dataset.

---

## 📄 License
MIT © 2026 Alex Rivera Studio. Built with React, TypeScript, Node.js, and MongoDB.
