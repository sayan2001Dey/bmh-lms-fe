import { HistoryChainData } from '../../../model/history-chain-data.model';

export const historyChainTD: HistoryChainData[] = [
  {
    "deedId": "DM-1829",
    "parents": [],
    "children": ["DM-2161"]
  },
  {
    "deedId": "DM-2161",
    "parents": ["DM-1829", "DM-3821"],
    "children": []
  },
  {
    "deedId": "DM-3821",
    "parents": [],
    "children": ["DM-2161"]
  },

  // {
  //   deedId: 'DM-1868',
  //   parents: [],
  //   children: ['DM-3569'],
  // },
  // {
  //   deedId: 'DM-3569',
  //   parents: ['DM-1868', 'DM-4610'],
  //   children: [],
  // },
  // {
  //   deedId: 'DM-4610',
  //   parents: [],
  //   children: ['DM-3569'],
  // },

  // {
  //   deedId: 'DM-5537',
  //   parents: ['DM-3569', 'DM-4610'],
  //   children: [],
  // },
  // {
  //   deedId: 'DM-6418',
  //   parents: ['DM-1868'],
  //   children: [],
  // },
  // {
  //   deedId: 'DM-7359',
  //   parents: [],
  //   children: ['DM-8580'],
  // },
  // {
  //   deedId: 'DM-8580',
  //   parents: ['DM-7359'],
  //   children: [],
  // },
  // {
  //   deedId: 'DM-2332',
  //   parents: ['DM-4610', 'DM-3569', 'DM-1868'],
  //   children: [],
  // }
];
