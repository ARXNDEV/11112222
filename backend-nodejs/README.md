# Hostel Room Allocation Management System - Backend

## Tech Stack
- **Node.js** + **Express.js** - Backend server
- **MongoDB** - Database
- **Socket.IO** - Real-time WebSocket communication
- **JWT** - Authentication
- **Bcrypt** - Password hashing

## Features
- JWT-based authentication with role-based access (Admin/Student)
- Complete CRUD operations for Rooms, Students, and Allocations
- Real-time updates using WebSocket (Socket.IO)
- MongoDB models with relationships
- Secure password hashing
- Input validation

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend-nodejs
npm install
```

### 2. Environment Variables
Create a `.env` file in the root directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/hostel-management
JWT_SECRET=your_jwt_secret_key_here_change_this_in_production
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

**Important:** Change `JWT_SECRET` to a secure random string in production.

### 3. MongoDB Setup

**Option 1: Local MongoDB**
- Install MongoDB locally
- Start MongoDB service
- Use connection string: `mongodb://localhost:27017/hostel-management`

**Option 2: MongoDB Atlas (Cloud)**
- Create account at [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas)
- Create a cluster
- Get connection string
- Update `MONGO_URI` in `.env`

### 4. Start Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Rooms
- `GET /api/rooms` - Get all rooms (Protected)
- `GET /api/rooms/:id` - Get room by ID (Protected)
- `POST /api/rooms` - Create room (Admin only)
- `PUT /api/rooms/:id` - Update room (Admin only)
- `DELETE /api/rooms/:id` - Delete room (Admin only)
- `GET /api/rooms/stats/summary` - Get room statistics (Protected)

### Students
- `GET /api/students` - Get all students (Protected)
- `GET /api/students/:id` - Get student by ID (Protected)
- `POST /api/students` - Create student (Admin only)
- `PUT /api/students/:id` - Update student (Admin only)
- `DELETE /api/students/:id` - Delete student (Admin only)

### Allocations
- `GET /api/allocations` - Get all allocations (Protected)
- `GET /api/allocations/:id` - Get allocation by ID (Protected)
- `POST /api/allocations` - Create allocation (Admin only)
- `POST /api/allocations/:id/deallocate` - Deallocate student (Admin only)
- `DELETE /api/allocations/:id` - Delete allocation (Admin only)

## WebSocket Events

The server emits the following real-time events:

- `room_created` - When a new room is created
- `room_updated` - When a room is updated
- `room_deleted` - When a room is deleted
- `student_created` - When a new student is created
- `student_updated` - When a student is updated
- `student_deleted` - When a student is deleted
- `allocation_created` - When a new allocation is made
- `allocation_completed` - When a student is deallocated
- `allocation_deleted` - When an allocation is deleted

## Deployment Options

### 1. Railway
1. Create account at [railway.app](https://railway.app)
2. Create new project
3. Add MongoDB service
4. Deploy from GitHub or upload files
5. Set environment variables
6. Deploy!

### 2. Render
1. Create account at [render.com](https://render.com)
2. Create new Web Service
3. Connect GitHub repo or upload files
4. Set build command: `npm install`
5. Set start command: `npm start`
6. Add environment variables
7. Deploy!

### 3. Heroku
1. Create account at [heroku.com](https://heroku.com)
2. Install Heroku CLI
3. Run:
```bash
heroku login
heroku create your-app-name
heroku addons:create mongolab
git push heroku main
```

### 4. DigitalOcean App Platform
1. Create account at [digitalocean.com](https://www.digitalocean.com)
2. Create new App
3. Connect GitHub or upload
4. Configure build and run commands
5. Add MongoDB database
6. Deploy!

## Testing the API

### Create Admin User
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@hostel.com",
    "password": "admin123",
    "role": "Admin"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@hostel.com",
    "password": "admin123"
  }'
```

Save the token from the response!

### Create Room (use token)
```bash
curl -X POST http://localhost:5000/api/rooms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "roomNumber": "A-101",
    "capacity": 4,
    "floor": 1
  }'
```

## Model Schemas

### User
- name (String, required)
- email (String, required, unique)
- password (String, required, hashed)
- role (String, enum: ['Admin', 'Student'])
- studentId (ObjectId, ref: Student)

### Room
- roomNumber (String, required, unique)
- capacity (Number, required, min: 1)
- currentOccupancy (Number, default: 0)
- status (String, enum: ['Available', 'Occupied', 'Maintenance'])
- floor (Number)
- amenities (Array of Strings)

### Student
- name (String, required)
- studentId (String, required, unique)
- course (String, required)
- contact (String, required)
- email (String, required, unique)
- userId (ObjectId, ref: User)
- roomId (ObjectId, ref: Room)
- currentAllocation (ObjectId, ref: Allocation)

### Allocation
- studentId (ObjectId, ref: Student, required)
- roomId (ObjectId, ref: Room, required)
- allocationDate (Date, default: now)
- deallocationDate (Date, default: null)
- status (String, enum: ['Active', 'Completed'])
- notes (String)

## Support

For issues or questions, please create an issue in the repository.
