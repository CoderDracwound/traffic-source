import { useState, useEffect } from 'react';
import { getCountryName, getDeviceIcon } from '@/lib/formatters';
import CountryFlag from './CountryFlag';
import TechIcon from './TechIcon';
import VisitorAvatar from './VisitorAvatar';
import ConversionDrawer from './ConversionDrawer';

const JOURNEY_COLORS = [
  '#7c5bf5', '#4c9fe8', '#22c55e', '#f5875b', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
];

function getJourneyColor(pathname) {
  let hash = 0;
  for (let i = 0; i < pathname.length; i++) {
    hash = ((hash << 5) - hash) + pathname.charCodeAt(i);
    hash |= 0;
  }
  return JOURNEY_COLORS[Math.abs(hash) % JOURNEY_COLORS.length];
}

function formatTimeToComplete(seconds) {
  if (!seconds || seconds <= 0) return 'Instant';
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`;
  if (seconds < 86400) {
    const h = Math.floor(seconds / 3600);
    return `${h} hours`;
  }
  const d = Math.floor(seconds / 86400);
  return `${d} days`;
}

function formatAmount(amount, currency) {
  const value = (amount || 0) / 100;
  if (currency === 'usd' || !currency) return `$${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  return `${value.toFixed(2)} ${(currency || '').toUpperCase()}`;
}

function getSourceFavicon(domain) {
  if (!domain) return null;
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=16`;
}

function formatTimestamp(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) {
    return `Today at ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
  }
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  }) + ' at ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function maskName(email) {
  if (!email) return null;
  const [local] = email.split('@');
  if (local.length <= 3) return local.slice(0, 1) + '** ******';
  return local.slice(0, 3) + '** ******';
}

export default function ConversionJourneyTable({ conversions, siteId }) {
  const [selectedConversion, setSelectedConversion] = useState(null);

  if (!conversions || conversions.length === 0) {
    return (
      <div className="empty-state">
        <p>No conversions for this period</p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="journey-table journey-table-detailed">
        <thead>
          <tr>
            <th>Visitor</th>
            <th>Country</th>
            <th>Browser</th>
            <th>Source</th>
            <th>Spent</th>
            <th>Time to complete</th>
            <th>Completed at</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {conversions.map((conv) => {
            const source = conv.utm_source || conv.referrer_domain || 'Direct';
            const sourceDomain = conv.referrer_domain;
            const displayName = maskName(conv.stripe_customer_email) || `Visitor ${(conv.visitor_id || '').slice(-6)}`;

            return (
              <tr key={conv.id} onClick={() => setSelectedConversion(conv)}>
                <td>
                  <div className="visitor-cell">
                    <VisitorAvatar visitorId={conv.visitor_id} size={44} />
                    <div className="visitor-info">
                      <div className="visitor-name">
                        {displayName}
                        <span className="badge-customer">Customer</span>
                      </div>
                      {conv.device_type && (
                        <div className="visitor-meta">
                          <span>{getDeviceIcon(conv.device_type)} {conv.device_type}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                <td>
                  <div className="country-cell">
                    {conv.country ? (
                      <>
                        <CountryFlag code={conv.country} size="s" />
                        <span>{getCountryName(conv.country)}</span>
                      </>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>--</span>
                    )}
                  </div>
                </td>

                <td>
                  <div className="browser-cell">
                    {conv.browser ? (
                      <>
                        <TechIcon type="browser" name={conv.browser} />
                        <span>{conv.browser}</span>
                      </>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>--</span>
                    )}
                  </div>
                </td>

                <td>
                  <div className="source-cell">
                    {sourceDomain && (
                      <img
                        src={getSourceFavicon(sourceDomain)}
                        alt=""
                        width={16}
                        height={16}
                        className="source-favicon"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    )}
                    <span>{source}</span>
                  </div>
                </td>

                <td>
                  <span className="amount-value">
                    {formatAmount(conv.amount, conv.currency)}
                  </span>
                </td>

                <td>{formatTimeToComplete(conv.timeToComplete)}</td>

                <td>{formatTimestamp(conv.created_at)}</td>

                <td>
                  <div className="journey-dots">
                    {(conv.journey || []).map((step, i) => (
                      <div
                        key={i}
                        className="journey-dot"
                        style={{ backgroundColor: getJourneyColor(step.pathname) }}
                        title={step.pathname}
                      />
                    ))}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <ConversionDrawer
        siteId={siteId}
        conversion={selectedConversion}
        onClose={() => setSelectedConversion(null)}
      />
    </div>
  );
}
