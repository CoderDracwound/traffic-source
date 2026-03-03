import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function SiteSettings() {
  const router = useRouter();
  const { siteId } = router.query;

  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snippetData, setSnippetData] = useState(null);
  const [stripeSecretKey, setStripeSecretKey] = useState('');
  const [stripeWebhookSecret, setStripeWebhookSecret] = useState('');
  const [stripeSaving, setStripeSaving] = useState(false);
  const [stripeMessage, setStripeMessage] = useState('');
  const [stripeError, setStripeError] = useState('');

  useEffect(() => {
    if (!siteId) return;
    (async () => {
      try {
        const [siteRes, snippetRes] = await Promise.all([
          fetch(`/api/sites/${siteId}`),
          fetch(`/api/sites/${siteId}/snippet`),
        ]);
        if (siteRes.ok) {
          const data = await siteRes.json();
          setSite(data.site);
          setStripeSecretKey(data.site.stripe_secret_key || '');
          setStripeWebhookSecret(data.site.stripe_webhook_secret || '');
        }
        if (snippetRes.ok) {
          setSnippetData(await snippetRes.json());
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [siteId]);

  const handleSaveStripe = async (e) => {
    e.preventDefault();
    setStripeSaving(true);
    setStripeMessage('');
    setStripeError('');
    try {
      const body = {};
      if (stripeSecretKey && !stripeSecretKey.startsWith('••••')) {
        body.stripe_secret_key = stripeSecretKey;
      }
      if (stripeWebhookSecret && !stripeWebhookSecret.startsWith('••••')) {
        body.stripe_webhook_secret = stripeWebhookSecret;
      }
      if (Object.keys(body).length === 0) {
        setStripeMessage('No changes to save');
        return;
      }
      const res = await fetch(`/api/sites/${siteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStripeSecretKey(data.site.stripe_secret_key || '');
      setStripeWebhookSecret(data.site.stripe_webhook_secret || '');
      setStripeMessage('Stripe keys saved');
    } catch (err) {
      setStripeError(err.message);
    } finally {
      setStripeSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this site and all its data?')) return;
    await fetch(`/api/sites/${siteId}`, { method: 'DELETE' });
    router.push('/sites');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  if (loading || !site) {
    return (
      <>
        <Head><title>Settings - Traffic Source</title></Head>
        <DashboardLayout siteId={siteId}>
          <div className="loading-inline"><div className="loading-spinner" /></div>
        </DashboardLayout>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Settings - {site.name} - Traffic Source</title>
      </Head>
      <DashboardLayout siteId={siteId} siteName={site.name}>
        <h2 className="page-title">Site Settings</h2>

        {/* ── Tracking Snippet ── */}
        <div className="panel" style={{ marginBottom: 20 }}>
          <div className="panel-header">
            <div className="panel-tabs">
              <button className="panel-tab active">Tracking Code</button>
            </div>
          </div>
          <div className="panel-body" style={{ padding: 20 }}>
            {snippetData ? (
              <>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
                  Add this snippet to your website&apos;s HTML, before the closing &lt;/head&gt; tag:
                </p>
                <div className="snippet-block">
                  <button className="copy-btn" onClick={() => copyToClipboard(snippetData.trackingSnippet)}>
                    Copy
                  </button>
                  {snippetData.trackingSnippet}
                </div>

                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 16 }}>
                  For Stripe conversion tracking, add this to your checkout flow:
                </p>
                <div className="snippet-block">
                  <button className="copy-btn" onClick={() => copyToClipboard(snippetData.stripeSnippet)}>
                    Copy
                  </button>
                  {snippetData.stripeSnippet}
                </div>

                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 16 }}>
                  Stripe Webhook URL:
                </p>
                <div className="snippet-block">
                  <button className="copy-btn" onClick={() => copyToClipboard(snippetData.webhookUrl)}>
                    Copy
                  </button>
                  {snippetData.webhookUrl}
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                  Add this URL in your Stripe Dashboard under Developers &gt; Webhooks. Listen for these events:
                </p>
                <ul style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0 16px', padding: 0 }}>
                  {snippetData.webhookEvents?.map((evt) => (
                    <li key={evt}><code>{evt}</code></li>
                  ))}
                </ul>
              </>
            ) : (
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Could not load snippet data.</p>
            )}
          </div>
        </div>

        {/* ── Stripe Settings ── */}
        <div className="panel" style={{ marginBottom: 20 }}>
          <div className="panel-header">
            <div className="panel-tabs">
              <button className="panel-tab active">Stripe</button>
            </div>
          </div>
          <div className="panel-body" style={{ padding: 20 }}>
            {stripeMessage && (
              <div style={{ background: 'var(--success-light)', color: 'var(--success)', padding: '10px 14px', borderRadius: 'var(--radius)', fontSize: 13, marginBottom: 12 }}>
                {stripeMessage}
              </div>
            )}
            {stripeError && <div className="auth-error">{stripeError}</div>}
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
              Enter your Stripe API keys for this site. You can find these in your Stripe Dashboard under Developers &gt; API keys.
            </p>
            <form onSubmit={handleSaveStripe} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label>Stripe Secret Key</label>
                <input
                  type="password"
                  value={stripeSecretKey}
                  onChange={(e) => setStripeSecretKey(e.target.value)}
                  placeholder="sk_live_..."
                />
              </div>
              <div className="form-group">
                <label>Webhook Secret</label>
                <input
                  type="password"
                  value={stripeWebhookSecret}
                  onChange={(e) => setStripeWebhookSecret(e.target.value)}
                  placeholder="whsec_..."
                />
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Listen for <code>checkout.session.completed</code> and <code>charge.refunded</code> events.
              </p>
              <button type="submit" className="btn btn-primary" disabled={stripeSaving} style={{ alignSelf: 'flex-start' }}>
                {stripeSaving ? 'Saving...' : 'Save Keys'}
              </button>
            </form>
          </div>
        </div>

        {/* ── Danger Zone ── */}
        <div className="panel" style={{ borderColor: 'var(--danger, #e53e3e)' }}>
          <div className="panel-header">
            <div className="panel-tabs">
              <button className="panel-tab active" style={{ color: 'var(--danger, #e53e3e)' }}>Danger Zone</button>
            </div>
          </div>
          <div className="panel-body" style={{ padding: 20 }}>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
              Permanently delete <strong>{site.name}</strong> and all its analytics data. This action cannot be undone.
            </p>
            <button className="btn btn-danger" onClick={handleDelete}>
              Delete Site
            </button>
          </div>
        </div>

      </DashboardLayout>
    </>
  );
}
