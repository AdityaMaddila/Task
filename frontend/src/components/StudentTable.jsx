import React, { useState } from 'react';

const StudentTable = ({ students, onUpdateStudent, onDeleteStudent, disabled }) => {
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const handleEditClick = (student) => {
    setEditingId(student._id);
    setEditData({
      student_name: student.student_name,
      total_marks: student.total_marks,
      marks_obtained: student.marks_obtained
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleSaveEdit = () => {
    if (onUpdateStudent && editingId) {
      onUpdateStudent(editingId, editData);
      setEditingId(null);
      setEditData({});
    }
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return 'grade-a';
    if (percentage >= 80) return 'grade-b';
    if (percentage >= 70) return 'grade-c';
    if (percentage >= 60) return 'grade-d';
    return 'grade-f';
  };

  if (!students || students.length === 0) {
    return (
      <div className="no-students">
        <p>No students found. Upload a file to get started!</p>
      </div>
    );
  }

  return (
    <div className="student-table-container">
      <div className="table-header">
        <h3>All Students</h3>
        <div className="stats">
          <span>Total: {students.length}</span>
          <span>
            Average: {students.length > 0 ? 
              (students.reduce((sum, s) => sum + s.percentage, 0) / students.length).toFixed(2) 
              : 0}%
          </span>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="students-table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Name</th>
              <th>Total Marks</th>
              <th>Marks Obtained</th>
              <th>Percentage</th>
              <th>Grade</th>
              <th>Added On</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student._id} className="student-row">
                <td className="student-id">{student.student_id}</td>
                
                <td className="student-name">
                  {editingId === student._id ? (
                    <input
                      type="text"
                      value={editData.student_name}
                      onChange={(e) => handleInputChange('student_name', e.target.value)}
                      className="edit-input"
                    />
                  ) : (
                    student.student_name
                  )}
                </td>

                <td className="total-marks">
                  {editingId === student._id ? (
                    <input
                      type="number"
                      value={editData.total_marks}
                      onChange={(e) => handleInputChange('total_marks', parseInt(e.target.value) || 0)}
                      className="edit-input"
                      min="0"
                    />
                  ) : (
                    student.total_marks
                  )}
                </td>

                <td className="marks-obtained">
                  {editingId === student._id ? (
                    <input
                      type="number"
                      value={editData.marks_obtained}
                      onChange={(e) => handleInputChange('marks_obtained', parseInt(e.target.value) || 0)}
                      className="edit-input"
                      min="0"
                      max={editData.total_marks || student.total_marks}
                    />
                  ) : (
                    student.marks_obtained
                  )}
                </td>

                <td className="percentage">
                  <span className={`percentage-badge ${getGradeColor(student.percentage)}`}>
                    {editingId === student._id ? 
                      ((editData.marks_obtained / editData.total_marks) * 100 || 0).toFixed(2)
                      : student.percentage
                    }%
                  </span>
                </td>

                <td className="grade">
                  <span className={`grade-badge ${getGradeColor(student.percentage)}`}>
                    {student.percentage >= 90 ? 'A' :
                     student.percentage >= 80 ? 'B' :
                     student.percentage >= 70 ? 'C' :
                     student.percentage >= 60 ? 'D' : 'F'}
                  </span>
                </td>

                <td className="created-date">
                  {formatDate(student.created_at)}
                </td>

                <td className="actions">
                  {editingId === student._id ? (
                    <div className="edit-actions">
                      <button
                        className="save-button"
                        onClick={handleSaveEdit}
                        disabled={disabled}
                      >
                        Save
                      </button>
                      <button
                        className="cancel-button"
                        onClick={handleCancelEdit}
                        disabled={disabled}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="view-actions">
                      <button
                        className="edit-button"
                        onClick={() => handleEditClick(student)}
                        disabled={disabled}
                        title="Edit student"
                      >
                        ✏️
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => onDeleteStudent(student._id)}
                        disabled={disabled}
                        title="Delete student"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentTable;