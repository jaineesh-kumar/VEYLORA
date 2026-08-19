export interface AlgorithmIdentificationHistory {
  id: number;
  data: string;
  createdAt: string;
  correctedData: boolean;
  predictedAlgorithm: string
}

export interface PopupProps {
  item: AlgorithmIdentificationHistory | null;
  onClose: () => void;
  onEdit: (id: string, correctData: boolean) => void; // Added onEdit prop
}


export interface HistoryItemProps {
  item: AlgorithmIdentificationHistory;
  onClick: () => void;
}