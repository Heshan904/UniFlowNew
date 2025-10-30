import React, { useEffect, useState } from 'react';


function App() {
  const [auth, setAuth] = useState(isAuthenticated());
  const location = useLocation();

  useEffect(() => {
    const handleStorage = () => setAuth(isAuthenticated());
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    setAuth(isAuthenticated());
  }, [location.pathname]);

  const role = getRole();

  const handleLoginSuccess = () => {
    setAuth(true);
  };

  return (
    <div className='app'>

    </div>
  );
}

export default App;
