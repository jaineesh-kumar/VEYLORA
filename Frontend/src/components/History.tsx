import { useState, useEffect } from 'react';
import axios from 'axios';
import { HistoryListItem } from './HistoryListItem';
import { ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {AlgorithmIdentificationHistory} from '@/types';
import { motion } from 'framer-motion';

// Define the type for history items

export default function HistoryPage() {
  const [history, setHistory] = useState<AlgorithmIdentificationHistory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAuthError = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    navigate('/login');
  };

  const getAuthToken = (): string | null => {
    return localStorage.getItem('accessToken') || localStorage.getItem('token');
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          handleAuthError();
          return;
        }

        const response = await axios.get<AlgorithmIdentificationHistory[]>(
          '/api/cryptographic-data/last20',
          { 
            headers: { Authorization: `Bearer ${token}` },
            timeout: 5000
          }
        );
        console.log(response);
        if (!response.data || !Array.isArray(response.data)) {
          setHistory([]);
          return;
        }

        const validatedHistory = response.data.filter((item): item is AlgorithmIdentificationHistory => {
          return (
            item !== null &&
            typeof item === 'object' &&
            'id' in item &&
            typeof item.id === 'number'
          );
        });

        setHistory(validatedHistory);
        setError(null);
      } catch (err) {
        console.error('History fetch error:', err);
        
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401 || err.response?.status === 403) {
            handleAuthError();
            return;
          }
          if (err.response?.status !== 404) {
            setError(err.response?.data?.message || 'Failed to fetch history. Please try again.');
          }
        } else {
          setError('An unexpected error occurred. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [navigate]);

  const handleStatusChange = async (id: number, correctedData: boolean) => {
    try {
      const token = getAuthToken();
      if (!token) {
        handleAuthError();
        return;
      }

      await axios.put(
        `/api/cryptographic-data/last20`,
        { correctedData },
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000
        }
      );

      setHistory((prevHistory) => {
        if (!Array.isArray(prevHistory)) {
          return [];
        }
        return prevHistory.map((item) =>
          item.id === id ? { ...item, correctedData } : item
        );
      });
      
      setError(null);
    } catch (err) {
      console.error('Status update error:', err);
      
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          handleAuthError();
          return;
        }
        setError(err.response?.data?.message || 'Failed to update status. Please try again.');
      } else {
        setError('An unexpected error occurred while updating status.');
      }
    }
  };

  const EmptyState = () => (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16 bg-void/60 backdrop-blur-xl rounded-xl border border-signal-violet/20 shadow-[0_0_40px_rgba(108,92,231,0.1)]">
      <ClipboardList className="mx-auto h-12 w-12 text-signal-violet/50 mb-4" />
      <h3 className="text-xl font-medium text-signal-violet mb-2 font-display">
        No Algorithm History Yet
      </h3>
      <p className="text-ink-dim max-w-sm mx-auto mb-8 font-body">
        Your algorithm identification history will appear here once you start using the system.
      </p>
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center px-8 py-3 rounded-full font-bold text-void bg-key-amber hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(245,166,35,0.4)] transition-all"
      >
        Start Identifying Algorithms
      </button>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-void text-ink py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="h-8 w-64 bg-dusk/50 rounded animate-pulse mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-dusk/50 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const historyItems = Array.isArray(history) ? history : [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-void text-ink py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_0%,var(--signal-violet)_0%,transparent_30%)] opacity-20 pointer-events-none blur-[120px]" />
      <div className="max-w-3xl mx-auto relative z-10">
        <h2 className="font-bold text-4xl mb-12 font-display bg-gradient-to-r from-signal-violet to-cipher-cyan bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(108,92,231,0.3)] text-center">
          Algorithm Identification History
        </h2>
        
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
            {error}
          </div>
        )}
        
        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }} 
          className="space-y-4"
        >
          {historyItems.length > 0 ? (
            historyItems.map((item) => (
              <motion.div key={item.id} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                <HistoryListItem
                  item={item}
                  onStatusChange={handleStatusChange}
                />
              </motion.div>
            ))
          ) : (
            <EmptyState />
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}