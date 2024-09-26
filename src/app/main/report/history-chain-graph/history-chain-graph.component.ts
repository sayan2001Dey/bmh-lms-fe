import {
  Component,
  computed,
  Input,
  Signal,
  signal,
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
  @Input() chainDeedForms: WritableSignal<FormGroup[]> = signal([]);
  @Input() deedList: WritableSignal<Deed[]> = signal([]);
  readonly graphData: Signal<GraphNode | null> = computed(() => {
    const sortedChainDeedData: ChainDeedData[] = this.chainDeedForms()
      .map((formGroup) => formGroup.value)
      .sort((a, b) => a.order - b.order);

    let graphData: GraphNode | undefined;
    let graphDataTmpPtr: GraphNode | undefined;
    if (sortedChainDeedData.length) {
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

    return graphData ? graphData : null;
  });

  getDeedNo(deedId: string): string {
    const deed: Deed | undefined = this.deedList().find(
      (deed) => deed.deedId === deedId
    );
    return deed?.deedNo || deedId;
  }
}
