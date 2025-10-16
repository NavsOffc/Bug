'use client';
import { useState, useEffect } from 'react';

export default function BugSender({ senders }) {
  const [target, setTarget] = useState('');
  const [bugType, setBugType] = useState('');
  const [selectedSender, setSelectedSender] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await fetch('/api/history');
      const data = await response.json();
      if (data.success) {
        setHistory(data.history);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const sendBug = async () => {
    if (!target || !bugType || !selectedSender) {
      alert('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/send-bug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target,
          bugType,
          senderId: parseInt(selectedSender)
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Bug sent successfully!');
        setTarget('');
        setBugType('');
        loadHistory();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      alert('Error sending bug: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const connectedSenders = senders.filter(s => s.status === 'connected');

  return (
    <div className="card">
      <h2>🐛 Send Bug</h2>
      
      <div className="form-group">
        <label>Target Phone Number</label>
        <input
          type="text"
          placeholder="6281234567890"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Bug Type</label>
        <div className="bug-options">
          {[
            { type: 'delay', icon: '⏱️', name: 'Delay Invis', desc: 'Pesan delay tak terlihat' },
            { type: 'blank', icon: '⬜', name: 'Blank', desc: 'Pesan kosong' },
            { type: 'stuck', icon: '📵', name: 'Stuck', desc: 'Buat WhatsApp error' }
          ].map(bug => (
            <div
              key={bug.type}
              className={`bug-option ${bugType === bug.type ? 'selected' : ''}`}
              onClick={() => setBugType(bug.type)}
            >
              <div className="bug-icon">{bug.icon}</div>
              <div className="bug-name">{bug.name}</div>
              <div className="bug-desc">{bug.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Select Sender</label>
        <select 
          value={selectedSender} 
          onChange={(e) => setSelectedSender(e.target.value)}
        >
          <option value="">Pilih sender</option>
          {connectedSenders.map(sender => (
            <option key={sender.id} value={sender.id}>
              {sender.name} ({sender.phone})
            </option>
          ))}
        </select>
        {connectedSenders.length === 0 && (
          <p style={{ color: '#e74c3c', fontSize: '14px', marginTop: '5px' }}>
            Tidak ada sender yang terhubung. Tambah sender terlebih dahulu.
          </p>
        )}
      </div>

      <button 
        className="btn btn-primary"
        onClick={sendBug}
        disabled={loading || !target || !bugType || !selectedSender || connectedSenders.length === 0}
        style={{ width: '100%' }}
      >
        {loading ? <div className="loader"></div> : '🚀'}
        {loading ? ' Sending...' : ' Send Bug'}
      </button>

      <div className="history" style={{ marginTop: '30px' }}>
        <h3>📜 Send History</h3>
        <div className="history-list">
          {history.slice(0, 10).map(item => (
            <div key={item.id} className="history-item">
              <div className="history-info">
                <div className="history-number">{item.target}</div>
                <div className="history-time">
                  {new Date(item.createdAt).toLocaleString('id-ID')}
                </div>
              </div>
              <div className={`history-bug bug-${item.bugType}`}>
                {item.bugType}
              </div>
            </div>
          ))}
          {history.length === 0 && (
            <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
              No send history yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
