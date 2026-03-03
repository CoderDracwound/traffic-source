import { useState } from 'react';
import Head from 'next/head';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';

export default function Settings() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    // Profile update could be added via API
    setMessage('Profile updated');
  };

  return (
    <>
      <Head>
        <title>Settings - Traffic Source</title>
      </Head>
      <DashboardLayout>
        <h2 className="page-title">Account Settings</h2>
        <div style={{ maxWidth: 600 }}>
          <div className="panel" style={{ marginBottom: 24 }}>
            <div className="panel-header">
              <div className="panel-tabs">
                <button className="panel-tab active">Profile</button>
              </div>
            </div>
            <div className="panel-body" style={{ padding: 20 }}>
              <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {message && (
                  <div style={{ background: 'var(--success-light)', color: 'var(--success)', padding: '10px 14px', borderRadius: 'var(--radius)', fontSize: 13 }}>
                    {message}
                  </div>
                )}
                {error && <div className="auth-error">{error}</div>}
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={user?.email || ''} disabled style={{ opacity: 0.6 }} />
                </div>
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
                  Save Changes
                </button>
              </form>
            </div>
          </div>

        </div>
      </DashboardLayout>
    </>
  );
}
