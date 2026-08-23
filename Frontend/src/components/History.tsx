import { useState, useEffect } from 'react';
import axios from 'axios';
import { HistoryListItem } from './HistoryListItem';
import { ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {AlgorithmIdentificationHistory} from '@/types'

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
    <div className="text-center py-12 bg-gray-900 rounded-xl border border-gray-800">
      <ClipboardList className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-200 mb-2">
        No Algorithm History Yet
      </h3>
      <p className="text-gray-400 max-w-sm mx-auto mb-6">
        Your algorithm identification history will appear here once you start using the system.
      </p>
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-black bg-purple-400 hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
      >
        Start Identifying Algorithms
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="h-8 w-64 bg-gray-800 rounded animate-pulse mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-800 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const historyItems = Array.isArray(history) ? history : [];

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <p className="veylora-page-kicker">Veylora / Archive</p>
        <h2 className="veylora-page-title font-bold mb-3">Your analysis trail.</h2>
        <p className="mb-8 text-sm text-gray-400">Every detection you've saved, ready to revisit.</p>
        
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          {historyItems.length > 0 ? (
            historyItems.map((item) => (
              <HistoryListItem
                key={item.id}
                item={item}
                onStatusChange={handleStatusChange}
              />
            ))
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </div>
  );
}
