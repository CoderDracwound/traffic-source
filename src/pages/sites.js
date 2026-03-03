import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function Sites() {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const fetchSites = useCallback(async () => {
    try {
      const res = await fetch('/api/sites');
      if (res.ok) {
        const data = await res.json();
        setSites(data.sites);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSites();
  }, [fetchSites]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, domain }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setShowModal(false);
      setName('');
      setDomain('');
      fetchSites();
      router.push(`/analytics/${data.site.id}/settings`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <Head>
        <title>Sites - Traffic Source</title>
      </Head>
      <DashboardLayout>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 className="page-title" style={{ marginBottom: 0 }}>Your Sites</h2>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            Add Site
          </button>
        </div>

        {loading ? (
          <div className="loading-inline"><div className="loading-spinner" /></div>
        ) : sites.length === 0 ? (
          <div className="empty-state">
            <h3>No sites yet</h3>
            <p>Add your first site to start tracking analytics.</p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              Add Site
            </button>
          </div>
        ) : (
          <div className="sites-list">
            {sites.map((site) => {
              const totalPageviews = site.hourly.reduce((sum, h) => sum + h.pageviews, 0);
              const totalVisitors = site.hourly.reduce((sum, h) => sum + h.visitors, 0);
              const maxVal = Math.max(...site.hourly.map((h) => h.pageviews), 1);
              return (
                <div
                  key={site.id}
                  className="site-row"
                  onClick={() => router.push(`/analytics/${site.id}`)}
                >
                  <div className="site-row-info">
                    <div className="site-row-name">{site.name}</div>
                    <div className="site-row-domain">{site.domain}</div>
                  </div>
                  <div className="site-row-chart">
                    {site.hourly.length > 0 ? (
                      site.hourly.map((h, i) => (
                        <div
                          key={i}
                          className="site-row-bar-group"
                          title={`${h.hour}\n${h.pageviews} pageviews\n${h.visitors} visitors`}
                        >
                          <div
                            className="site-row-bar site-row-bar--pageviews"
                            style={{ height: `${(h.pageviews / maxVal) * 100}%` }}
                          />
                          <div
                            className="site-row-bar site-row-bar--visitors"
                            style={{ height: `${(h.visitors / maxVal) * 100}%` }}
                          />
                        </div>
                      ))
                    ) : (
                      <span className="site-row-nodata">No data</span>
                    )}
                  </div>
                  <div className="site-row-stats">
                    <span className="site-row-count">{totalPageviews.toLocaleString()}</span>
                    <span className="site-row-period">pageviews</span>
                    <span className="site-row-count site-row-count--visitors">{totalVisitors.toLocaleString()}</span>
                    <span className="site-row-period">visitors</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Site Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Add Site</h2>
                <button onClick={() => setShowModal(false)}>x</button>
              </div>
              <form onSubmit={handleCreate}>
                <div className="modal-body">
                  {error && <div className="auth-error">{error}</div>}
                  <div className="form-group">
                    <label>Site Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="My Website"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Domain</label>
                    <input
                      type="text"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      placeholder="example.com"
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Add Site
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </DashboardLayout>
    </>
  );
}
