import { useEffect, useState } from 'react';
import { fetchMe } from '../api/auth';

const AuthGate = ({ children }) => {
  const [status, setStatus] = useState('checking');
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchMe()
      .then((data) => {
        setUser(data);
        setStatus('ok');
      })
      .catch(() => {
        window.location.href = 'http://localhost:4000/login';
      });
  }, []);

  if (status === 'checking') {
    return (
      <div style={{ display: 'grid', placeItems: 'center', height: '100vh', color: '#6b7686' }}>
        로그인 확인 중…
      </div>
    );
  }

  return children(user);
};

export default AuthGate;