import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const [stats, setStats] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ox_stats_v1')) || null; } catch(e) { return null; }
  });
  const [campaignLogs, setCampaignLogs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ox_logs_v1')) || []; } catch(e) { return []; }
  });
  const [isInitialized, setIsInitialized] = useState(() => {
    return !!localStorage.getItem('ox_stats_v1');
  });
  const [imapEmails, setImapEmails] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ox_imap_v1')) || []; } catch(e) { return []; }
  });
  const [isImapSyncing, setIsImapSyncing] = useState(false);

  const fetchAllData = useCallback(async (isInitial = false) => {
    try {
      const [statsRes, logsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/analytics/overview'),
        axios.get('http://localhost:5000/api/inbox')
      ]);

      if (statsRes.data) {
        setStats(statsRes.data);
        localStorage.setItem('ox_stats_v1', JSON.stringify(statsRes.data));
      }
      if (logsRes.data) {
        setCampaignLogs(logsRes.data);
        localStorage.setItem('ox_logs_v1', JSON.stringify(logsRes.data));
      }

      if (isInitial) {
        setIsInitialized(true);
        sessionStorage.setItem('ox_v1_init', 'true');
      }
    } catch (error) {
      console.error("[DataContext] Fetch Error:", error);
    }
  }, []);

  const fetchImap = useCallback(async () => {
    setIsImapSyncing(true);
    try {
      const res = await axios.get('http://localhost:5000/api/inbox/imap');
      if (res.data && !res.data.error) {
        const data = res.data.emails || res.data || [];
        setImapEmails(data);
        localStorage.setItem('ox_imap_v1', JSON.stringify(data));
      }
    } catch (err) {
      console.error("[DataContext] IMAP Error:", err);
    } finally {
      setIsImapSyncing(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchAllData(true);
    fetchImap();

    // 2s Polling for fast data (stats + logs)
    const fastInterval = setInterval(() => fetchAllData(false), 2000);
    
    // 60s Polling for heavy data (IMAP)
    const slowInterval = setInterval(() => fetchImap(), 60000);

    return () => {
      clearInterval(fastInterval);
      clearInterval(slowInterval);
    };
  }, [fetchAllData, fetchImap]);

  const value = {
    stats,
    campaignLogs,
    imapEmails,
    isInitialized,
    isImapSyncing,
    refreshImap: fetchImap,
    refreshAll: () => fetchAllData(false)
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};
