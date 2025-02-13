// App.js
import React from 'react';
import { useAuth } from "react-oidc-context";

function App() {
  const auth = useAuth();
  const [formData, setFormData] = React.useState({
    date: '',
    cost: '',
    title: ''
  });
  const [entries, setEntries] = React.useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.date && formData.cost && formData.title) {
      setEntries(prev => [...prev, { ...formData, id: Date.now() }]);
      setFormData({ date: '', cost: '', title: '' });
    }
  };

  const handleDelete = (id) => {
    setEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const signOutRedirect = () => {
    const clientId = "5gh0dubj45gj1oo07ptsiu05ks";
    const logoutUri = "<logout uri>";
    const cognitoDomain = "https://us-east-1nuni86pdc.auth.us-east-1.amazoncognito.com";
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  if (auth.error) {
    return <div>Encountering error... {auth.error.message}</div>;
  }

  if (auth.isAuthenticated) {
    return (
      <div className="dashboard">
        <h2>Welcome, {auth.user?.profile.email}</h2>
        
        <form onSubmit={handleSubmit} className="input-form">
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            required
          />
          <input
            type="number"
            name="cost"
            value={formData.cost}
            onChange={handleInputChange}
            placeholder="USD$"
            required
          />
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Title of transaction"
            required
          />
          <button type="submit">Submit</button>
        </form>

        <div className="entries-list">
          {entries.map(entry => (
            <div key={entry.id} className="entry-item">
              <span>{entry.date}</span>
              <span>${entry.cost}</span>
              <span>{entry.title}</span>
              <button onClick={() => handleDelete(entry.id)} className="delete-btn">Delete</button>
            </div>
          ))}
        </div>
        
        <button className="logout-btn" onClick={() => auth.removeUser()}>Sign out</button>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => auth.signinRedirect()}>Sign in</button>
      <button onClick={() => signOutRedirect()}>Sign out</button>
    </div>
  );
}

export default App;