import {
  Component,
  Input,
} from '@angular/core';
import { GraphNode } from '../../../../model/graph-node.model';
import { GraphNodeComponent } from './graph-node/graph-node.component';

@Component({
  selector: 'app-history-chain-graph-view-linear',
  standalone: true,
  imports: [
    GraphNodeComponent
  ],
  templateUrl: './history-chain-graph-view-linear.component.html',
  styleUrl: './history-chain-graph-view-linear.component.scss',
})
export class HistoryChainGraphViewLinearComponent {
  @Input() graphData: GraphNode | null = null;
}
