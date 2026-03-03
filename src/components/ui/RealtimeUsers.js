import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { countryCodeToFlag } from '@/lib/formatters';

function groupByCountry(users) {
  const map = {};
  for (const user of users) {
    const code = user.country ? user.country.toUpperCase() : 'UNKNOWN';
    if (!map[code]) map[code] = [];
    map[code].push(user);
  }
  return Object.entries(map)
    .map(([code, visitors]) => ({ code, visitors, count: visitors.length }))
    .sort((a, b) => b.count - a.count);
}

export default function RealtimeUsers() {
  const [data, setData] = useState(null);
  const router = useRouter();
  const { siteId } = router.query;
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!siteId) return;

    const fetchRealtime = async () => {
      try {
        const res = await fetch(`/api/analytics/${siteId}/realtime`);
        if (res.ok) {
          setData(await res.json());
        }
      } catch {
        // silently fail on polling
      }
    };

    fetchRealtime();
    intervalRef.current = setInterval(fetchRealtime, 30000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [siteId]);

  if (!data) return null;

  return (
    <div className="realtime-strip">
      <div className="realtime-indicator">
        <span className="realtime-dot" />
        <span className="realtime-count">{data.count}</span>
        <span className="realtime-label">
          {data.count === 1 ? 'visitor' : 'visitors'} online
        </span>
      </div>

      {data.users.length > 0 && (
        <div className="realtime-flags">
          {groupByCountry(data.users).map(({ code, count }) => (
            <div key={code} className="realtime-flag">
              <span className="realtime-flag-emoji">
                {code !== 'UNKNOWN' ? countryCodeToFlag(code) : '\u{1F310}'}
              </span>
              {count > 1 && <span className="realtime-flag-count">{count}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
