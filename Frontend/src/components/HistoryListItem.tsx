import React, { useState } from 'react';
import { Clock, X, CheckCircle, XCircle } from 'lucide-react';
import { AlgorithmIdentificationHistory } from '@/types';

interface HistoryListItemProps {
  item: AlgorithmIdentificationHistory;
  onStatusChange: (id: number, correctedData: boolean) => Promise<void>;
}

const formatTimeAgo = (createdAt?: string): string => {
  if (!createdAt) return 'Unknown';
  const now = new Date();
  const date = new Date(createdAt);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }
};

export const HistoryListItem: React.FC<HistoryListItemProps> = ({ item, onStatusChange }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusToggle = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening details modal
    if (isUpdating || !item.id) return;

    setIsUpdating(true);
    try {
      await onStatusChange(item.id, !item.correctedData);
    } finally {
      setIsUpdating(false);
    }
  };

  const DetailPopup = () => (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div
        className="fixed inset-0 bg-void/20 backdrop-blur-sm"
        onClick={() => setShowDetails(false)}
      ></div>
      <div className="relative bg-void/90 backdrop-blur-2xl rounded-2xl shadow-[0_0_50px_rgba(108,92,231,0.2)] w-full max-w-md border border-signal-violet/30 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-signal-violet/5 to-transparent pointer-events-none"></div>
        <div className="flex justify-between items-center p-6 border-b border-ink-dim/20">
          <h2 className="text-xl font-semibold text-ink font-display">Algorithm Details</h2>
          <button
            onClick={() => setShowDetails(false)}
            className="text-ink-dim hover:text-gray-200 transition-colors rounded-full hover:bg-dusk/50 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className="text-sm font-medium text-ink-dim">Data</label>
            <p className="mt-2 text-ink break-words">{item.data}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-ink-dim">Created At</label>
            <p className="mt-2 text-ink">
              {item.createdAt
                ? new Date(item.createdAt).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })
                : 'Unknown'}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-ink-dim">Prediction Status</label>
            <div className="mt-2 flex items-center">
              <button
                onClick={handleStatusToggle}
                disabled={isUpdating}
                className={`flex items-center ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}`}
              >
                {item.correctedData ? (
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500 mr-2" />
                )}
                <span className={`font-medium ${item.correctedData ? 'text-green-500' : 'text-red-500'}`}>
                  {item.correctedData ? 'Correct' : 'Incorrect'}
                </span>
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-ink-dim">Predicted Algorithm</label>
            <p className="mt-2 text-ink">{item.predictedAlgorithm ?? 'Unknown'}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div
        onClick={() => setShowDetails(true)}
        className="bg-void/80 backdrop-blur-xl rounded-xl p-6 shadow-[0_0_15px_rgba(108,92,231,0.05)] hover:shadow-[0_0_30px_rgba(108,92,231,0.15)] cursor-pointer hover:bg-void transition-all duration-300 border border-ink-dim/10 hover:border-signal-violet/40 hover:scale-[1.01] group"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2 flex-1 min-w-0">
            <p className="text-base font-medium text-ink truncate group-hover:text-cipher-cyan transition-colors">
              {item.data ?? 'No data available'}
            </p>
            {item.predictedAlgorithm && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleStatusToggle}
                  disabled={isUpdating}
                  className={`flex items-center ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}`}
                >
                  {item.correctedData ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                </button>
                <span className="text-sm text-ink-dim">{item.predictedAlgorithm ?? 'Unknown'}</span>
              </div>
            )}
          </div>
          {item.createdAt && (
            <div className="flex items-center text-sm text-ink-dim">
              <Clock className="w-4 h-4 mr-1 flex-shrink-0" />
              {formatTimeAgo(item.createdAt)}
            </div>
          )}
        </div>
      </div>
      {showDetails && <DetailPopup />}
    </>
  );
};