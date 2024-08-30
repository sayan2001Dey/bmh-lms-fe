export interface HistoryChainData {
  id: {
    timestamp: number;
    date: string;
  };
  name: string;
  recId: string;
  parents: string[];
  children: string[];
}

export interface HistoryChain {
  recId: string;
  parents: HistoryChain[];
  children: HistoryChain[];
  depth: number;
  spread: number;
}