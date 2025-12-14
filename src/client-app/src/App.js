import React, { useState, useEffect } from 'react';
import { Button } from '@progress/kendo-react-buttons';
import { Input } from '@progress/kendo-react-inputs';
import { DropDownList } from '@progress/kendo-react-dropdowns';
import '@progress/kendo-theme-default/dist/all.css';
import './App.css';

function App() {
  const [activities, setActivities] = useState({});
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/activities');
      const data = await response.json();
      setActivities(data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (!selectedActivity || !email) {
      setMessage('Please select an activity and enter your email');
      setMessageType('error');
      return;
    }

    try {
      const response = await fetch(
        `/api/activities/${encodeURIComponent(selectedActivity)}/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        setMessage(result.message);
        setMessageType('success');
        setEmail('');
        setSelectedActivity(null);
        fetchActivities(); // Refresh activities
      } else {
        setMessage(result.detail || 'An error occurred');
        setMessageType('error');
      }

      setTimeout(() => {
        setMessage('');
      }, 5000);
    } catch (error) {
      setMessage('Failed to sign up. Please try again.');
      setMessageType('error');
      console.error('Error signing up:', error);
    }
  };

  const activityNames = Object.keys(activities);

  return (
    <div className="App">
      <header className="header">
        <h1>Mergington High School</h1>
        <h2>Extracurricular Activities</h2>
      </header>

      <main className="main-content">
        <section className="activities-section">
          <h3>Available Activities</h3>
          <div className="activities-list">
            {activityNames.length === 0 ? (
              <p>Loading activities...</p>
            ) : (
              activityNames.map((name) => {
                const activity = activities[name];
                const spotsLeft = activity.maxParticipants - activity.participants.length;
                
                return (
                  <div key={name} className="activity-card">
                    <h4>{name}</h4>
                    <p>{activity.description}</p>
                    <p><strong>Schedule:</strong> {activity.schedule}</p>
                    <p><strong>Availability:</strong> {spotsLeft} spots left</p>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="signup-section">
          <h3>Sign Up for an Activity</h3>
          <form onSubmit={handleSignup} className="signup-form">
            <div className="form-group">
              <label htmlFor="email">Student Email:</label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.value)}
                placeholder="your-email@mergington.edu"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="activity">Select Activity:</label>
              <DropDownList
                id="activity"
                data={activityNames}
                value={selectedActivity}
                onChange={(e) => setSelectedActivity(e.value)}
                defaultItem="-- Select an activity --"
              />
            </div>
            <Button type="submit" themeColor="primary">
              Sign Up
            </Button>
          </form>
          {message && (
            <div className={`message ${messageType}`}>
              {message}
            </div>
          )}
        </section>
      </main>

      <footer className="footer">
        <p>&copy; 2023 Mergington High School</p>
      </footer>
    </div>
  );
}

export default App;
