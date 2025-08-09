import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';

function FileList() {
  const [files, setFiles] = useState([]);
  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    const fetchFiles = async () => {
      const token = await getAccessTokenSilently();
      const apiUrl = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';
      const res = await axios.get(`${apiUrl}/files`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFiles(res.data);
    };
    fetchFiles();
  }, [getAccessTokenSilently]);

  return (
    <div>
      <h3>Your Uploaded Files</h3>
      <ul>
        {files.map((f) => (
          <li key={f.id}>
            <a href={f.url} target="_blank" rel="noopener noreferrer">{f.filename}</a> ({f.timestamp})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FileList;
