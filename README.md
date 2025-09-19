# Student Grade Management System

A web application to upload Excel/CSV files and manage student grades with automatic percentage calculations.

## 🚀 Quick Setup

### 1. Clone & Install
```bash
git clone https://github.com/AdityaMaddila/Task/
cd student-grade-system

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies  
cd ../frontend
npm install
```

### 2. Setup Database
- Create free MongoDB Atlas account at [mongodb.com](https://cloud.mongodb.com)
- Create a cluster and get connection string
- Create `backend/.env` file:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/student-grades
PORT=5000
```

### 3. Run the Application
```bash
# Start backend (from backend folder)
npm start

# Start frontend (from frontend folder) 
npm start
```

Visit `http://localhost:3000` to use the app!

## 📁 File Format
Your Excel/CSV files should have these columns:
```
Student_ID | Student_Name | Total_Marks | Marks_Obtained
S501       | John Doe     | 100         | 85
S502       | Jane Smith   | 100         | 92
```

## 🎯 Features
- Upload Excel (.xlsx) and CSV files
- View student data with calculated percentages
- Edit student records
- Delete students
- Responsive design

That's it! 🎉
