'use client';
import { useState, useEffect } from 'react';
import BugSender from '@/components/BugSender';
import SenderManager from '@/components/SenderManager';

export default function Home() {
  const [senders, setSenders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSenders();
  }, []);

  const loadSenders = async () => {
    try {
      const response = await fetch('/api/senders');
      const data = await response.json();
      if (data.success) {
        setSenders(data.senders);
      }
    } catch (error) {
      console.error('Error loading senders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', color: 'white', padding: '50px' }}>
          <div className="loader" style={{ margin: '0 auto 20px' }}></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1>🚀 WhatsApp Bug Sender</h1>
        <p>Kirim bug WhatsApp dengan multiple senders</p>
      </div>

      <div className="main-content">
        <BugSender senders={senders} />
        <SenderManager />
      </div>
    </div>
  );
}
