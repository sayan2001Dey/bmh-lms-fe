import {
  Component,
  computed,
  Input,
  Signal,
  signal,
  SimpleChanges,
  WritableSignal,
} from '@angular/core';
import { HistoryChainGraphViewOPMCComponent } from './history-chain-graph-view-opmc/history-chain-graph-view-opmc.component';
import { HistoryChainGraphViewLinearComponent } from './history-chain-graph-view-linear/history-chain-graph-view-linear.component';
import { GraphNode } from '../../../model/graph-node.model';
import { FormGroup } from '@angular/forms';
import { Deed } from '../../../model/deed.model';
import { ChainDeedData } from '../../../model/chain-deed-data.model';

@Component({
  selector: 'app-history-chain-graph',
  standalone: true,
  imports: [
    HistoryChainGraphViewOPMCComponent,
    HistoryChainGraphViewLinearComponent,
  ],
  templateUrl: './history-chain-graph.component.html',
  styleUrl: './history-chain-graph.component.scss',
})
export class HistoryChainGraphComponent {
  @Input() chainDeedDataArray: ChainDeedData[] = [];
  @Input() deedList: WritableSignal<Deed[]> = signal([]);
  graphData: GraphNode | null = null;

  getDeedNo(deedId: string): string {
    const deed: Deed | undefined = this.deedList().find(
      (deed) => deed.deedId === deedId
    );
    return deed?.deedNo || deedId;
  }

  ngOnInit(): void {
    console.log(this.chainDeedDataArray);
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chainDeedDataArray']) {
      // this algo only does 1 parent 1 child no matter the order
      const sortedChainDeedData: ChainDeedData[] = this.chainDeedDataArray.sort(
        (a, b) => a.order - b.order
      );

      let graphData: GraphNode | undefined;
      let graphDataTmpPtr: GraphNode | undefined;
      if (sortedChainDeedData.length) {
        console.log('im here');
        graphData = {
          data: {
            deedId: sortedChainDeedData[0].deedId,
            deedNo: this.getDeedNo(sortedChainDeedData[0].deedId),
          },
          children: [],
        };
        graphDataTmpPtr = graphData;

        if (graphDataTmpPtr) {
          for (let i = 1; i < sortedChainDeedData.length; i++) {
            graphDataTmpPtr.children.push({
              data: {
                deedId: sortedChainDeedData[i].deedId,
                deedNo: this.getDeedNo(sortedChainDeedData[i].deedId),
              },
              children: [],
            });
            graphDataTmpPtr = graphDataTmpPtr?.children[0];
          }
        }
      }
      if(graphData)
        this.graphData = graphData;
    }
  }
}
