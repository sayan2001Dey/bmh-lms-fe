import { HistoryChainData } from "../../../model/history-chain.model";

export const hcData: HistoryChainData[] = [
  {
      "id": {
          "timestamp": 1724927754,
          "date": "2024-08-29T10:35:54.000+00:00"
      },
      "name": "Archisman",
      "recId": "1",
      "parents": [],
      "children": [
          "2",
          "3",
          "6"
      ]
  },
  {
      "id": {
          "timestamp": 1724928662,
          "date": "2024-08-29T10:51:02.000+00:00"
      },
      "name": "Archisman",
      "recId": "3",
      "parents": [
          "1",
          "2"
      ],
      "children": [
          "5"
      ]
  },
  {
      "id": {
          "timestamp": 1724928687,
          "date": "2024-08-29T10:51:27.000+00:00"
      },
      "name": "Archisman",
      "recId": "5",
      "parents": [
          "3",
          "4"
      ],
      "children": []
  },
  {
      "id": {
          "timestamp": 1724928961,
          "date": "2024-08-29T10:56:01.000+00:00"
      },
      "name": "Archisman",
      "recId": "6",
      "parents": [
          "1"
      ],
      "children": []
  },
  {
      "id": {
          "timestamp": 1724928672,
          "date": "2024-08-29T10:51:12.000+00:00"
      },
      "name": "Archisman",
      "recId": "4",
      "parents": [
          "2"
      ],
      "children": [
          "5"
      ]
  },
  {
      "id": {
          "timestamp": 1724928354,
          "date": "2024-08-29T10:45:54.000+00:00"
      },
      "name": "Archisman",
      "recId": "2",
      "parents": [
          "1"
      ],
      "children": [
          "3",
          "4"
      ]
  }
];