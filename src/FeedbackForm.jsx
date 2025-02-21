
import React, { useState } from 'react';
import './FeedbackForm.css';

export function FeedbackForm({ onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Sending...');

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_key: '9cf96956-b89f-4edb-ad44-b2f0aa22eabc',
          from_name: formData.name,
          email: formData.email,
          message: formData.message,
          subject: 'Card Stak Feedback',
          form_name: 'Card Stak Feedback Form',
        }),
      });

      const data = await response.json();
      if (data.success) {
        setStatus('Thank you for your feedback!');
        setFormData({ name: '', email: '', message: '' });
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setStatus('Something went wrong. Please try again.');
      }
    } catch (err) {
      setStatus('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="feedback-overlay">
      <div className="feedback-modal">
        <h3>Submit Feedback</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Your Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <textarea
            placeholder="Your Message"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            required
          />
          <div className="feedback-buttons">
            <button type="submit">Submit</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
          {status && <div className="status-message">{status}</div>}
        </form>
      </div>
    </div>
  );
}
