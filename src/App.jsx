
import { useAuth } from "react-oidc-context";
import { useState } from "react";

function App() {
  const auth = useAuth();
  const [entries, setEntries] = useState([]);
  const [formData, setFormData] = useState({
    date: "",
    title: "",
    cost: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setEntries([...entries, { ...formData, id: Date.now() }]);
    setFormData({ date: "", title: "", cost: "" });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
        <h1>Welcome, {auth.user?.profile.email}</h1>
        
        <form onSubmit={handleSubmit} className="input-form">
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="title"
            value={formData.title}
            placeholder="Title"
            onChange={handleChange}
            required
          />
          <input
            type="number"
            name="cost"
            value={formData.cost}
            placeholder="Cost"
            onChange={handleChange}
            required
          />
          <button type="submit">Add Entry</button>
        </form>

        <div className="entries-list">
          <h2>Entries</h2>
          {entries.map(entry => (
            <div key={entry.id} className="entry-item">
              <span>{entry.date}</span>
              <span>{entry.title}</span>
              <span>${entry.cost}</span>
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
    </div>
  );
}

export default App;
