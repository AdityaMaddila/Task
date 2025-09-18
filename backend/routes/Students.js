const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const Papa = require('papaparse');
const fs = require('fs');
const path = require('path');
const Student = require('../models/Student');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.xlsx', '.xls', '.csv'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel (.xlsx, .xls) and CSV files are allowed'), false);
    }
  }
});

// Helper: Parse Excel file
function parseExcelFile(filePath) {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(worksheet);
}

// Helper: Parse CSV file
function parseCSVFile(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const result = Papa.parse(fileContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim()
  });
  return result.data;
}

// Helper: Normalize student data
function normalizeStudentData(rawData) {
  return rawData.map(row => {
    const student_id = row.Student_ID || row.student_id || row.StudentID || row.ID;
    const student_name = row.Student_Name || row.student_name || row.StudentName || row.Name;
    const total_marks = parseInt(row.Total_Marks || row.total_marks || row.TotalMarks || row.MaxMarks);
    const marks_obtained = parseInt(row.Marks_Obtained || row.marks_obtained || row.MarksObtained || row.Score);

    if (!student_id || !student_name || isNaN(total_marks) || isNaN(marks_obtained)) {
      throw new Error(`Invalid data format. Required: Student_ID, Student_Name, Total_Marks, Marks_Obtained`);
    }

    const percentage = parseFloat(((marks_obtained / total_marks) * 100).toFixed(2));

    return {
      student_id: student_id.toString(),
      student_name,
      total_marks,
      marks_obtained,
      percentage
    };
  });
}

// 📌 Routes

// Upload and process file
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    
    let rawData;
    if (fileExtension === '.csv') {
      rawData = parseCSVFile(filePath);
    } else {
      rawData = parseExcelFile(filePath);
    }

    if (!rawData || rawData.length === 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: 'No data found in file' });
    }

    const normalizedData = normalizeStudentData(rawData);

    const savedStudents = [];
    for (const studentData of normalizedData) {
      const student = await Student.findOneAndUpdate(
        { student_id: studentData.student_id },
        studentData,
        { upsert: true, new: true, runValidators: true }
      );
      savedStudents.push(student);
    }

    fs.unlinkSync(filePath);

    res.json({
      message: `Successfully processed ${savedStudents.length} students`,
      students: savedStudents
    });

  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Error processing file' });
  }
});

// Get all students
router.get('/students', async (req, res) => {
  try {
    const students = await Student.find().sort({ created_at: -1 });
    res.json({ students, totalCount: students.length });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Error fetching students' });
  }
});
//smaple create student
router.post('/students', async (req, res) => {
  try {
    const { student_id, student_name, marks_obtained, total_marks } = req.body;

    // calculate percentage automatically
    const percentage = (marks_obtained / total_marks) * 100;

    const newStudent = new Student({
      student_id,
      student_name,
      marks_obtained,
      total_marks,
      percentage
    });

    await newStudent.save();

    res.status(201).json({
      message: "Student created successfully",
      student: newStudent
    });
  } catch (error) {
    console.error("Error creating student:", error);
    res.status(500).json({
      message: "Error creating student",
      error: error.message
    });
  }
});
// Update a student
router.put('/students/:id', async (req, res) => {
  try {
    const { student_name, total_marks, marks_obtained } = req.body;
    const percentage = parseFloat(((marks_obtained / total_marks) * 100).toFixed(2));

    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      { student_name, total_marks, marks_obtained, percentage },
      { new: true, runValidators: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json(updatedStudent);
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ error: 'Error updating student' });
  }
});

// Delete a student
router.delete('/students/:id', async (req, res) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(req.params.id);
    if (!deletedStudent) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ error: 'Error deleting student' });
  }
});

module.exports = router;
