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
        className="fixed inset-0 bg-black/20 backdrop-blur-sm"
        onClick={() => setShowDetails(false)}
      ></div>
      <div className="relative bg-gray-900 rounded-2xl shadow-xl w-full max-w-md border border-gray-800">
        <div className="flex justify-between items-center p-6 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-white">Algorithm Details</h2>
          <button
            onClick={() => setShowDetails(false)}
            className="text-gray-400 hover:text-gray-200 transition-colors rounded-full hover:bg-gray-800 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-400">Data</label>
            <p className="mt-2 text-white break-words">{item.data}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-400">Created At</label>
            <p className="mt-2 text-white">
              {item.createdAt
                ? new Date(item.createdAt).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })
                : 'Unknown'}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-400">Prediction Status</label>
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
            <label className="text-sm font-medium text-gray-400">Predicted Algorithm</label>
            <p className="mt-2 text-white">{item.predictedAlgorithm ?? 'Unknown'}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div
        onClick={() => setShowDetails(true)}
        className="bg-gray-900 rounded-xl p-6 shadow-sm hover:shadow-md cursor-pointer hover:bg-gray-800 transition-all duration-200 border border-gray-800"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2 flex-1 min-w-0">
            <p className="text-base font-medium text-white truncate">
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
                <span className="text-sm text-gray-400">{item.predictedAlgorithm ?? 'Unknown'}</span>
              </div>
            )}
          </div>
          {item.createdAt && (
            <div className="flex items-center text-sm text-gray-400">
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