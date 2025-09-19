import React, { useState, useMemo } from 'react';

const StudentTable = ({ students, onUpdateStudent, onDeleteStudent, disabled }) => {
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  
  
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage, setStudentsPerPage] = useState(10);
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');

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

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1); 
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setEditingId(null); 
    setEditData({});
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
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

  const getGradeLetter = (percentage) => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  // Filtered and sorted students
  const filteredAndSortedStudents = useMemo(() => {
    if (!students) return [];

    let filtered = students.filter(student =>
      student.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort students
    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === 'created_at') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });

    return filtered;
  }, [students, searchTerm, sortField, sortDirection]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedStudents.length / studentsPerPage);
  const startIndex = (currentPage - 1) * studentsPerPage;
  const endIndex = startIndex + studentsPerPage;
  const currentStudents = filteredAndSortedStudents.slice(startIndex, endIndex);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const halfVisible = Math.floor(maxVisiblePages / 2);
      let startPage = Math.max(currentPage - halfVisible, 1);
      let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);
      
      if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(endPage - maxVisiblePages + 1, 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
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

      {/* Search and Controls */}
      <div className="table-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by name or student ID..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        
        <div className="per-page-selector">
          <label htmlFor="perPage">Show:</label>
          <select
            id="perPage"
            value={studentsPerPage}
            onChange={(e) => {
              setStudentsPerPage(parseInt(e.target.value));
              setCurrentPage(1);
            }}
            className="per-page-select"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span>entries</span>
        </div>
      </div>

      {filteredAndSortedStudents.length === 0 ? (
        <div className="no-results">
          <p>No students match your search criteria.</p>
        </div>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="students-table">
              <thead>
                <tr>
                  <th 
                    className={`sortable ${sortField === 'student_id' ? `sorted-${sortDirection}` : ''}`}
                    onClick={() => handleSort('student_id')}
                  >
                    Student ID {sortField === 'student_id' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className={`sortable ${sortField === 'student_name' ? `sorted-${sortDirection}` : ''}`}
                    onClick={() => handleSort('student_name')}
                  >
                    Name {sortField === 'student_name' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className={`sortable ${sortField === 'total_marks' ? `sorted-${sortDirection}` : ''}`}
                    onClick={() => handleSort('total_marks')}
                  >
                    Total Marks {sortField === 'total_marks' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className={`sortable ${sortField === 'marks_obtained' ? `sorted-${sortDirection}` : ''}`}
                    onClick={() => handleSort('marks_obtained')}
                  >
                    Marks Obtained {sortField === 'marks_obtained' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className={`sortable ${sortField === 'percentage' ? `sorted-${sortDirection}` : ''}`}
                    onClick={() => handleSort('percentage')}
                  >
                    Percentage {sortField === 'percentage' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th>Grade</th>
                  <th 
                    className={`sortable ${sortField === 'created_at' ? `sorted-${sortDirection}` : ''}`}
                    onClick={() => handleSort('created_at')}
                  >
                    Added On {sortField === 'created_at' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentStudents.map((student) => (
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
                        {getGradeLetter(student.percentage)}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-container">
              <div className="pagination-info">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedStudents.length)} of {filteredAndSortedStudents.length} entries
                {searchTerm && ` (filtered from ${students.length} total entries)`}
              </div>
              
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                >
                  First
                </button>
                
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>

                {getPageNumbers().map((page) => (
                  <button
                    key={page}
                    className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                ))}

                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
                
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  Last
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StudentTable;