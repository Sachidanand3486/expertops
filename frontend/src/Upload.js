
import React, { useState } from 'react';
import axios from 'axios';

function Upload() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFile(e.target.files[0]);
    setMessage('');
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file to upload.');
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      setMessage('Only JPG, PNG, GIF allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage('Max file size is 5MB');
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';
      await axios.post(`${apiUrl}/upload`, formData);
      setMessage('✅ Upload successful!');
      setFile(null);
    } catch (err) {
      setMessage('❌ Upload failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{
      maxWidth: 400,
      margin: '40px auto',
      padding: 32,
      background: '#fff',
      borderRadius: 16,
      boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
      textAlign: 'center',
      fontFamily: 'Segoe UI, Arial, sans-serif'
    }}>
      <h2 style={{ color: '#2d7ff9', marginBottom: 24 }}>Upload an Image</h2>
      <input
        type="file"
        accept="image/jpeg,image/png,image/gif"
        onChange={handleChange}
        style={{
          marginBottom: 16,
          padding: '8px 0',
          border: 'none',
          fontSize: 16
        }}
      />
      <br />
      <button
        onClick={handleUpload}
        disabled={loading}
        style={{
          background: '#2d7ff9',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          padding: '10px 32px',
          fontSize: 18,
          cursor: loading ? 'not-allowed' : 'pointer',
          boxShadow: '0 2px 8px rgba(45,127,249,0.08)',
          marginTop: 8
        }}
      >
        {loading ? 'Uploading...' : 'Upload'}
      </button>
      <div style={{ marginTop: 18, fontSize: 16, color: message.startsWith('✅') ? '#2ecc40' : '#e74c3c' }}>
        {message}
      </div>
    </div>
  );
}

export default Upload;
