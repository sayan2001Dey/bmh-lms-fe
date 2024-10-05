import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { HistoryChainGraphDynamicComponent } from "../history-chain-graph/history-chain-graph-dynamic/history-chain-graph-dynamic.component";
import { GraphStateData } from '../../../model/graph-state-data.model';
import { historyChainTD } from './lms_test.historyChain';

@Component({
  selector: 'app-test-report',
  standalone: true,
  imports: [HistoryChainGraphDynamicComponent],
  templateUrl: './test-report.component.html',
  styleUrl: './test-report.component.scss'
})
export class TestReportComponent implements OnInit{
  stateSignal: WritableSignal<GraphStateData> = signal({
    diagramNodeData: [
      { key: 'Alpha', text: 'Alpha', color: 'lightblue', loc: '0 0' },
      { key: 'Beta', text: 'Beta', color: 'orange', loc: '150 0' },
      { key: 'Gamma', text: 'Gamma', color: 'lightgreen', loc: '0 100' },
      { key: 'Delta', text: 'Delta', color: 'pink', loc: '100 100' },
    ],
    diagramLinkData: [
      { key: -1, from: 'Alpha', to: 'Beta', fromPort: 'r', toPort: 'l' },
      { key: -2, from: 'Alpha', to: 'Gamma', fromPort: 'b', toPort: 't' },
      { key: -3, from: 'Beta', to: 'Beta' },
      { key: -4, from: 'Gamma', to: 'Delta', fromPort: 'r', toPort: 'l' },
      { key: -5, from: 'Delta', to: 'Alpha', fromPort: 't', toPort: 'r' },
    ],
    diagramModelData: { prop: 'value' },
    skipsDiagramUpdate: true,
  });

  jsonData = historyChainTD;

  ngOnInit(): void {
    console.log(this.jsonData);
  }
}
