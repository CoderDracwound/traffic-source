import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';

export default function Sidebar({ siteId }) {
  const router = useRouter();
  const { logout } = useAuth();
  const path = router.asPath;

  return (
    <div className="sidebar">
      <div className="sidebar-logo">Traffic Source</div>
      <nav className="sidebar-nav">
        <Link
          href="/sites"
          className={`sidebar-link ${path === '/sites' ? 'active' : ''}`}
        >
          All Sites
        </Link>

        {siteId && (
          <>
            <div className="sidebar-section">Current Site</div>
            <Link
              href={`/analytics/${siteId}`}
              className={`sidebar-link ${path === `/analytics/${siteId}` ? 'active' : ''}`}
            >
              Analytics
            </Link>
            <Link
              href={`/analytics/${siteId}/settings`}
              className={`sidebar-link ${path === `/analytics/${siteId}/settings` ? 'active' : ''}`}
            >
              Site Settings
            </Link>
          </>
        )}

        <div className="sidebar-section">Account</div>
        <Link
          href="/settings"
          className={`sidebar-link ${path === '/settings' ? 'active' : ''}`}
        >
          Settings
        </Link>
      </nav>
      <div className="sidebar-footer">
        <button className="sidebar-link" onClick={logout} style={{ width: '100%' }}>
          Sign out
        </button>
      </div>
    </div>
  );
}
