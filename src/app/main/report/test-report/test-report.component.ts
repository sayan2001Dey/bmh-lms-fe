import {
  Component,
  inject,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { HistoryChainGraphDynamicComponent } from '../history-chain-graph/history-chain-graph-dynamic/history-chain-graph-dynamic.component';
import { GraphStateData } from '../../../model/graph-state-data.model';
import { historyChainTD } from './lms_test.historyChain';
import { DeedMasterService } from '../../master/services/deed-master.service';
import { Deed } from '../../../model/deed.model';

@Component({
  selector: 'app-test-report',
  standalone: true,
  imports: [HistoryChainGraphDynamicComponent],
  templateUrl: './test-report.component.html',
  styleUrl: './test-report.component.scss',
})
export class TestReportComponent implements OnInit {
  private readonly deedMasterService: DeedMasterService =
    inject(DeedMasterService);
  private readonly deedList: WritableSignal<Deed[]> = signal([]);
  readonly stateSignal: WritableSignal<GraphStateData> = signal({
    diagramNodeData: [],
    diagramLinkData: [],
    diagramModelData: { prop: 'value' },
    skipsDiagramUpdate: true,
  });

  // KEEP FOR NOW PLEASE
  // readonly stateSignal: WritableSignal<GraphStateData> = signal({
  //   diagramNodeData: [
  //     { key: 'Alpha', text: 'Alpha', color: 'lightblue', loc: '0 0' },
  //     { key: 'Beta', text: 'Beta', color: 'orange', loc: '150 0' },
  //     { key: 'Gamma', text: 'Gamma', color: 'lightgreen', loc: '0 100' },
  //     { key: 'Delta', text: 'Delta', color: 'pink', loc: '100 100' },
  //   ],
  //   diagramLinkData: [
  //     { key: -1, from: 'Alpha', to: 'Beta', fromPort: 'r', toPort: 'l' },
  //     { key: -2, from: 'Alpha', to: 'Gamma', fromPort: 'b', toPort: 't' },
  //     { key: -3, from: 'Beta', to: 'Beta' },
  //     { key: -4, from: 'Gamma', to: 'Delta', fromPort: 'r', toPort: 'l' },
  //     { key: -5, from: 'Delta', to: 'Alpha', fromPort: 't', toPort: 'r' },
  //   ],
  //   diagramModelData: { prop: 'value' },
  //   skipsDiagramUpdate: true,
  // });

  readonly renderDiagramComponent: WritableSignal<boolean> = signal(false);

  readonly sysIsBusy: WritableSignal<boolean> = signal(false);
  readonly serverUnreachable: WritableSignal<boolean> = signal(false);
  updateDeedList(): void {
    this.sysIsBusy.set(true);
    this.deedMasterService.getDeedList().subscribe({
      next: (data) => {
        this.deedList.set(data);
      },
      error: () => {
        this.serverUnreachable.set(true);
      },
      complete: () => {
        this.sysIsBusy.set(false);
        console.log('deedFetchComplete: ', this.deedList());
        setTimeout(() => {
          this.processData();
          this.renderDiagramComponent.set(true);
        }, 3000);
      },
    });
  }

  getDeedNo(deedId: string): string {
    let d = this.deedList().find((d) => d.deedId === deedId);
    return d ? d.deedNo : deedId;
  }

  jsonData = historyChainTD;

  processData() {
    console.log(this.jsonData);

    console.log('start process');

    let nodesData: any[] = [];
    let linkData: any[] = [];

    for (let i = 0; i < this.jsonData.length; i++) {
      let d = this.jsonData[i];
      nodesData.push({
        key: d.deedId,
        text: d.deedId,
        color: 'lightgreen',
        // TODO
        // loc: '0 150',
      });
      for (const parentId of d.parents) {
        linkData.push({
          key: -linkData.length - 1,
          from: parentId,
          to: d.deedId,
        });
      }
    }

    this.stateSignal.set(
      (() => {
        let d = this.stateSignal();
        d.diagramNodeData = nodesData;
        d.diagramLinkData = linkData;
        return d;
      })()
    );
  }

  ngOnInit(): void {
    console.log('fetchDeed');
    this.updateDeedList();
  }
}
