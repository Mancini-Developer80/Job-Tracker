# Job Tracker Dashboard

A full-stack web app to manage and analyze your job applications. Features include authentication, custom fields, notes, tags, analytics, import/export (CSV, Excel, PDF), and dark mode. Built with React, TypeScript, Express, and MongoDB for a modern, responsive, and customizable job search experience.

## 🚀 Live Demo

[View Live Demo](#) <!-- Replace # with your deployed app URL -->

## 📸 Screenshots

<!-- Add screenshots or GIFs here -->

---

## Features

- User authentication (JWT)
- Add, edit, delete, and filter job applications
- Custom fields for jobs
- Tag management
- Notes/comments per job
- Import/export (CSV, Excel, PDF)
- Analytics dashboard with charts
- Responsive design & dark mode
- Admin features

## Tech Stack

- Frontend: React, TypeScript, Vite, CSS Modules
- Backend: Express, TypeScript, MongoDB, Mongoose
- Charts: recharts
- File handling: papaparse, xlsx, jsPDF

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB

### Installation

```bash
# Clone the repo
 git clone https://github.com/yourusername/job-tracker.git
 cd job-tracker

# Install client dependencies
 cd client
 npm install

# Install server dependencies
 cd ../server
 npm install
```

### Environment Variables

Create a `.env` file in the `server` folder:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

### Running Locally

```bash
# Start backend
cd server
npm run dev

# Start frontend
cd ../client
npm run dev
```

The app will be available at `http://localhost:5173` (frontend) and `http://localhost:5000` (backend).

## API Endpoints

See `server/src/routes/` for all available endpoints (jobs, auth, users).

## Folder Structure

```
client/   # React frontend
server/   # Express backend
```

## Contributing

Pull requests are welcome! For major changes, please open an issue first.

## License

[MIT](LICENSE)

## Author

- [Your Name](https://your-portfolio-link.com)
