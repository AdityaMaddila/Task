import React, { useState, useRef } from 'react';

const FileUpload = ({ onFileUpload, disabled }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv' // .csv
    ];
    
    if (!allowedTypes.includes(file.type) && 
        !file.name.toLowerCase().endsWith('.xlsx') && 
        !file.name.toLowerCase().endsWith('.xls') &&
        !file.name.toLowerCase().endsWith('.csv')) {
      alert('Please select an Excel (.xlsx, .xls) or CSV file');
      return;
    }

    setSelectedFile(file);
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile && onFileUpload) {
      onFileUpload(selectedFile);
      setSelectedFile(null);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="file-upload">
      <div
        className={`drop-zone ${dragActive ? 'drag-active' : ''} ${disabled ? 'disabled' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
          disabled={disabled}
        />
        
        <div className="drop-zone-content">
          <div className="upload-icon">📄</div>
          <p className="primary-text">
            Drop your Excel or CSV file here, or{' '}
            <button
              type="button"
              className="browse-button"
              onClick={handleBrowseClick}
              disabled={disabled}
            >
              browse
            </button>
          </p>
          <p className="secondary-text">
            Supports .xlsx, .xls, and .csv files
          </p>
        </div>
      </div>

      {selectedFile && (
        <div className="file-selected">
          <div className="file-info">
            <span className="file-icon">📎</span>
            <span className="file-name">{selectedFile.name}</span>
            <span className="file-size">
              ({(selectedFile.size / 1024).toFixed(2)} KB)
            </span>
          </div>
          <div className="upload-actions">
            <button
              className="upload-button"
              onClick={handleUpload}
              disabled={disabled}
            >
              {disabled ? 'Uploading...' : 'Upload File'}
            </button>
            <button
              className="cancel-button"
              onClick={() => {
                setSelectedFile(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              disabled={disabled}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="file-format-info">
        <h3>Expected File Format:</h3>
        <div className="format-example">
          <table>
            <thead>
              <tr>
                <th>Student_ID</th>
                <th>Student_Name</th>
                <th>Total_Marks</th>
                <th>Marks_Obtained</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>S501</td>
                <td>Quinn Flores</td>
                <td>100</td>
                <td>85</td>
              </tr>
              <tr>
                <td>S502</td>
                <td>Morgan Nguyen</td>
                <td>100</td>
                <td>92</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;