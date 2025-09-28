# TickTock - Timesheet Web App (Mock API + React)

This is a simple timesheet management web application built with **React**.  
The project demonstrates authentication, listing weekly timesheets, and displaying tasks for each week using **mock API endpoints** created with `json-server`.

---

## 🚀 Setup Instructions

1. **Clone the repository**  
   ```bash
   git clone https://github.com/vinaypoddar2000/Time_Management_App


Install dependencies

npm install


Start the mock API server
This project uses json-server to simulate API endpoints.
Run:

npm run server


API will be available at http://localhost:5000

Endpoints:

GET /users → user login data

GET /timesheets → list of weekly timesheets

GET /entries/:weekId → tasks for a specific week

Start the React app

npm start


Runs the app in development mode at http://localhost:3000

🛠 Frameworks / Libraries Used

React (Frontend UI)

React Router DOM (Routing between login, timesheet list, and task views)

Tailwind CSS (Styling and UI components)

json-server (Mock backend API)

LocalStorage (Basic session handling for login)

📌 Assumptions / Notes

Authentication is mocked:

Login checks against the /users endpoint (using tokens).

A valid user must exist in db.json.

Each week’s tasks are served from /entries/:weekId.

For simplicity:

No real database or backend — everything runs from db.json.

API calls are fetch requests to http://localhost:5000.

If json-server is not running, the app will not load data.

⏱ Time Spent

Project setup (React, Tailwind, Router): ~2 hrs

Creating mock API with json-server: ~2 hr

Building login, timesheet table, and list view components: ~2 hrs

Testing and polish: ~1 hr

Total: ~7 hours