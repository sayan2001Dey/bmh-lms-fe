import { Component } from '@angular/core';
import { HistoryChainGraphViewOPMCComponent } from "./history-chain-graph-view-opmc/history-chain-graph-view-opmc.component";

@Component({
  selector: 'app-history-chain-graph',
  standalone: true,
  imports: [HistoryChainGraphViewOPMCComponent],
  templateUrl: './history-chain-graph.component.html',
  styleUrl: './history-chain-graph.component.scss'
})
export class HistoryChainGraphComponent {

}
