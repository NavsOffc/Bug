'use client';
import { useState, useEffect } from 'react';

export default function SenderManager() {
  const [senders, setSenders] = useState([]);
  const [newSender, setNewSender] = useState({ phone: '', name: '' });
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [pollingSender, setPollingSender] = useState(null);

  useEffect(() => {
    loadSenders();
  }, []);

  useEffect(() => {
    if (pollingSender) {
      const interval = setInterval(() => {
        checkQRCode(pollingSender);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [pollingSender]);

  const loadSenders = async () => {
    try {
      const response = await fetch('/api/senders');
      const data = await response.json();
      if (data.success) {
        setSenders(data.senders);
      }
    } catch (error) {
      console.error('Error loading senders:', error);
    }
  };

  const addSender = async () => {
    if (!newSender.phone) {
      alert('Phone number is required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/senders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSender)
      });

      const data = await response.json();
      
      if (data.success) {
        setNewSender({ phone: '', name: '' });
        setQrCode(data.qrCode);
        setPollingSender(data.sender.id);
        loadSenders();
        alert('Sender added! Scan QR code to connect.');
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      alert('Error adding sender: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const checkQRCode = async (senderId) => {
    try {
      const response = await fetch(`/api/auth/qr?senderId=${senderId}`);
      const data = await response.json();
      
      if (data.success) {
        if (data.qrCode) {
          setQrCode(data.qrCode);
        } else {
          // QR code gone, probably connected
          setQrCode(null);
          setPollingSender(null);
          loadSenders();
        }
      }
    } catch (error) {
      console.error('Error checking QR:', error);
    }
  };

  const deleteSender = async (senderId) => {
    if (!confirm('Delete this sender?')) return;

    try {
      const response = await fetch(`/api/senders/${senderId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        loadSenders();
        alert('Sender deleted');
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      alert('Error deleting sender: ' + error.message);
    }
  };

  return (
    <div className="card">
      <h2>📱 Manage Senders</h2>
      
      <div className="form-group">
        <label>Add New Sender</label>
        <input
          type="text"
          placeholder="Phone number (6281234567890)"
          value={newSender.phone}
          onChange={(e) => setNewSender({...newSender, phone: e.target.value})}
        />
        <input
          type="text"
          placeholder="Sender name (optional)"
          value={newSender.name}
          onChange={(e) => setNewSender({...newSender, name: e.target.value})}
          style={{ marginTop: '10px' }}
        />
        <button 
          className="btn btn-primary"
          onClick={addSender}
          disabled={loading || !newSender.phone}
          style={{ marginTop: '15px', width: '100%' }}
        >
          {loading ? <div className="loader"></div> : '➕'}
          {loading ? ' Adding...' : ' Add Sender'}
        </button>
      </div>

      {qrCode && (
        <div className="qr-container">
          <h3>📱 Scan QR Code</h3>
          <p>Scan this QR code with WhatsApp to connect the sender</p>
          <pre style={{ 
            background: 'white', 
            padding: '15px', 
            borderRadius: '8px',
            fontSize: '8px',
            lineHeight: '1',
            overflow: 'auto'
          }}>
            {qrCode}
          </pre>
        </div>
      )}

      <div className="senders-list">
        <h3>Connected Senders</h3>
        {senders.map(sender => (
          <div key={sender.id} className="sender-item">
            <div className="sender-info">
              <h4>{sender.name}</h4>
              <p>{sender.phone}</p>
              <span className={`sender-status sender-${sender.status}`}>
                {sender.status}
              </span>
            </div>
            <div>
              <button 
                className="btn btn-danger"
                onClick={() => deleteSender(sender.id)}
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
        {senders.length === 0 && (
          <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
            No senders added yet
          </p>
        )}
      </div>
    </div>
  );
}
