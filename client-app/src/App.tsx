import React, { useState, useEffect } from 'react';
import './App.css';

interface Activity {
  [key: string]: {
    description: string;
    schedule: string;
    maxParticipants: number;
    participants: string[];
  };
}

function App() {
  const [activities, setActivities] = useState<Activity>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [selectedActivity, setSelectedActivity] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch('/api/activities');
        if (!response.ok) {
          throw new Error('Failed to fetch activities');
        }
        const data = await response.json();
        setActivities(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    try {
      const response = await fetch(`/api/activities/${encodeURIComponent(selectedActivity)}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to sign up');
      }

      const result = await response.json();
      setMessage({ text: result.message || 'Successfully signed up!', type: 'success' });
      setEmail('');
      setSelectedActivity('');
      
      // Refresh activities to show updated participant count
      const activitiesResponse = await fetch('/api/activities');
      const updatedActivities = await activitiesResponse.json();
      setActivities(updatedActivities);
    } catch (err) {
      setMessage({ 
        text: err instanceof Error ? err.message : 'Failed to sign up', 
        type: 'error' 
      });
    }
  };

  if (loading) return <div>Loading activities...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="App">
      <div className="header">
        <h1>Mergington High School</h1>
        <h2>Extracurricular Activities</h2>
      </div>
      <div className="main-content">
        <div className="activities-section">
          <h3>Available Activities</h3>
          <div className="activities-list">
            {Object.entries(activities).map(([name, activity]) => (
              <div key={name} className="activity-card">
                <h4>{name}</h4>
                <p><strong>Description:</strong> {activity.description}</p>
                <p><strong>Schedule:</strong> {activity.schedule}</p>
                <p><strong>Participants:</strong> {activity.participants.length}/{activity.maxParticipants}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="signup-section">
          <h3>Sign Up for an Activity</h3>
          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Student Email:</label>
              <input
                type="email"
                id="email"
                className="k-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your-email@mergington.edu"
              />
            </div>
            <div className="form-group">
              <label htmlFor="activity">Select Activity:</label>
              <select
                id="activity"
                className="k-dropdown"
                value={selectedActivity}
                onChange={(e) => setSelectedActivity(e.target.value)}
                required
              >
                <option value="">-- Select an activity --</option>
                {Object.keys(activities).map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit">Sign Up</button>
          </form>
          {message && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}
        </div>
      </div>
      <div className="footer">
        <p>&copy; 2025 Mergington High School</p>
      </div>
    </div>
  );
}

export default App;
