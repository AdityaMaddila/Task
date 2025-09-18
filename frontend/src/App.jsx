import React, { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import StudentTable from './components/StudentTable';
import './App.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  // Fetch students on component mount
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/students`);
      const data = await response.json();
      
      if (response.ok) {
        setStudents(data.students);
      } else {
        showMessage(data.error || 'Error fetching students', 'error');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      showMessage('Error connecting to server', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        showMessage(data.message, 'success');
        fetchStudents(); // Refresh the student list
      } else {
        showMessage(data.error || 'Upload failed', 'error');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showMessage('Error uploading file', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStudent = async (studentId, updatedData) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/students/${studentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('Student updated successfully', 'success');
        fetchStudents(); // Refresh the student list
      } else {
        showMessage(data.error || 'Update failed', 'error');
      }
    } catch (error) {
      console.error('Update error:', error);
      showMessage('Error updating student', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to delete this student?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/students/${studentId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('Student deleted successfully', 'success');
        fetchStudents(); // Refresh the student list
      } else {
        showMessage(data.error || 'Delete failed', 'error');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showMessage('Error deleting student', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000); // Clear message after 5 seconds
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Student Grade Management System</h1>
      </header>

      <main className="App-main">
        {/* Message Display */}
        {message && (
          <div className={`message ${messageType}`}>
            {message}
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Processing...</p>
          </div>
        )}

        {/* File Upload Section */}
        <section className="upload-section">
          <h2>Upload Student Data</h2>
          <FileUpload onFileUpload={handleFileUpload} disabled={loading} />
        </section>

        {/* Students Display Section */}
        <section className="students-section">
          <h2>Students ({students.length})</h2>
          <StudentTable
            students={students}
            onUpdateStudent={handleUpdateStudent}
            onDeleteStudent={handleDeleteStudent}
            disabled={loading}
          />
        </section>
      </main>
    </div>
  );
}

export default App;