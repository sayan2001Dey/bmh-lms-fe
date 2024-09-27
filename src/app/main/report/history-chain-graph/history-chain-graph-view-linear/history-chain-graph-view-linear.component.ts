import {
  Component,
  computed,
  Input,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ChainDeedData } from '../../../../model/chain-deed-data.model';
import { Deed } from '../../../../model/deed.model';
import { GraphNode } from '../../../../model/graph-node.model';

@Component({
  selector: 'app-history-chain-graph-view-linear',
  standalone: true,
  imports: [],
  templateUrl: './history-chain-graph-view-linear.component.html',
  styleUrl: './history-chain-graph-view-linear.component.scss',
})
export class HistoryChainGraphViewLinearComponent {
  @Input() graphData: Signal<GraphNode | null> = signal(null);
}
