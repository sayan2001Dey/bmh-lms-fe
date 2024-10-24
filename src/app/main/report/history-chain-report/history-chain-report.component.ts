import { HistoryChainReportService } from './history-chain-report.service';
import {
  Component,
  inject,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { DeedMasterService } from '../../master/services/deed-master.service';
import { Deed } from '../../../model/deed.model';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { map, Observable, startWith } from 'rxjs';
import { LandRecordsService } from '../../land-record/land-records.service';
import { HistoryChainGraphComponent } from '../history-chain-graph/history-chain-graph.component';
import { HttpErrorResponse } from '@angular/common/http';
import { TestReportComponent } from '../test-report/test-report.component';
import { HistoryChainData } from '../../../model/history-chain-data.model';
import { GraphStateData } from '../../../model/graph-state-data.model';
import { HistoryChainGraphDynamicComponent } from '../history-chain-graph/history-chain-graph-dynamic/history-chain-graph-dynamic.component';

@Component({
  selector: 'app-history-chain-report',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatTooltipModule,
    MatButtonModule,
    MatCardModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    AsyncPipe,
    HistoryChainGraphComponent,
    TestReportComponent,
    HistoryChainGraphDynamicComponent,
  ],
  templateUrl: './history-chain-report.component.html',
  styleUrl: './history-chain-report.component.scss',
})
export class HistoryChainReportComponent implements OnInit {
  private readonly deedService: DeedMasterService = inject(DeedMasterService);
  private readonly historyChainReportService: HistoryChainReportService =
    inject(HistoryChainReportService);
  readonly searchBar: FormControl<string | null> =
    inject(FormBuilder).control('');
  readonly deedList: WritableSignal<Deed[]> = signal([]);
  readonly sysIsBusy: WritableSignal<boolean> = signal(false);
  readonly serverUnreachable: WritableSignal<boolean> = signal(false);
  readonly filteredOptions: Observable<Deed[]> =
    this.searchBar.valueChanges.pipe(
      startWith(''),
      map((value) => {
        const deedNo = typeof value === 'string' ? value : null;
        return deedNo
          ? this._filter(deedNo as string)
          : this.deedList().slice();
      })
    );
  readonly stateSignal: WritableSignal<GraphStateData> = signal({
    diagramNodeData: [],
    diagramLinkData: [],
    diagramModelData: { prop: 'value' },
    skipsDiagramUpdate: true,
  });
  readonly renderDiagramComponent: WritableSignal<boolean> = signal(false);
  private highlightDeedId: string = '';

  setDeedList(): void {
    this.sysIsBusy.set(true);
    this.deedService.getDeedList().subscribe({
      next: (data) => {
        this.serverUnreachable.set(false);
        this.deedList.set(data);
      },
      error: () => {
        this.serverUnreachable.set(true);
        alert('⛔ ERROR: SERVER UNREACHABLE\n\nPlease try again later.');
      },
      complete: () => {
        this.sysIsBusy.set(false);
      },
    });
  }

  onSearch() {
    const searchBarVal: string | null = this.searchBar.value;
    if (searchBarVal === null || searchBarVal === '') {
      alert('⛔ ERROR: INVALID INPUT\n\nSearch bar cannot be empty.');
      return;
    }
    const deedId =
      this.deedList().find((deed) => deed.deedNo === searchBarVal)?.deedId ||
      '';

    if (deedId === '') {
      alert('⛔ ERROR: UNKNOWN INPUT\n\nDeed not found.');
    }

    this.sysIsBusy.set(true);
    this.renderDiagramComponent.set(false);
    this.historyChainReportService.getHistoryChainReport(deedId).subscribe({
      next: (data) => {
        this.serverUnreachable.set(false);
        this.highlightDeedId = deedId; //1
        this.processData(data); //2
        this.renderDiagramComponent.set(true);
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 404) {
          alert('⛔ ERROR: DEED NOT FOUND\n\nPlease try again later.');
        } else {
          this.serverUnreachable.set(true);
          alert('⛔ ERROR: SERVER UNREACHABLE\n\nPlease try again later.');
        }
      },
      complete: () => {
        this.sysIsBusy.set(false);
      },
    });
  }

  processData(historyChainDataList: HistoryChainData[]) {
    console.log(historyChainDataList);
    console.log('start process');

    /*
    for (let i = 0; i < historyChainDataList.length; i++) {
      let d = historyChainDataList[i];
      nodesData.push({
        key: d.deedId,
        text: this.getDeedNo(d.deedId) + '\n' + d.deedId,
        color: d.deedId === this.highlightDeedId ? 'orange' : 'lightgreen',
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
    */

    this.stateSignal.set(
      (() => {
        let d = this.stateSignal();
        d.diagramNodeData = this.makeNodesData(
          this.processLayout2(historyChainDataList)
        );
        d.diagramLinkData = this.makeGraphLinks(historyChainDataList);
        return d;
      })()
    );
  }

  makeNodesData(layoutData: HCGraphLayoutTreeNode[], level: number = 0): any[] {
    const D_X = 120;
    const D_Y = 100;
    const nodesData: any[] = [];

    let dy = 0;
    layoutData[0].children.forEach((d) => {
      const x = (level+1) * D_X;
      const y = d.width * D_Y + dy;
      dy = y;
      nodesData.push({
        key: d.deedId,
        text: this.getDeedNo(d.deedId) + '\n' + d.deedId,
        color: d.deedId === this.highlightDeedId ? 'orange' : 'lightgreen',
        loc: y + ' ' + x,
      });
    })

    dy = 0;
    layoutData.forEach((d) => {
      const x = level * D_X;
      const y = (d.width * D_Y + dy)/1.5;
      dy = y;
      nodesData.push({
        key: d.deedId,
        text: this.getDeedNo(d.deedId) + '\n' + d.deedId,
        color: d.deedId === this.highlightDeedId ? 'orange' : 'lightgreen',
        loc: y + ' ' + x,
      });
    })

    // for (let i = 0; i < historyChainDataList.length; i++) {
    //   let d = historyChainDataList[i];
    //   nodesData.push({
    //     key: d.deedId,
    //     text: this.getDeedNo(d.deedId) + '\n' + d.deedId,
    //     color: d.deedId === this.highlightDeedId ? 'orange' : 'lightgreen',
    //     // TODO
    //     // loc: '0 150',
    //   });
    // }
    // for (let i = 0; i < data.length; i++, x++) {
    //   for (let j = 0; j < data[i].length; j++) {
    //     let d = data[i][j];
    //     const node: any = {
    //       key: d.deedId,
    //       text: this.getDeedNo(d.deedId) + '\n' + d.deedId,
    //       color: d.deedId === this.highlightDeedId ? 'orange' : 'lightgreen',
    //       loc: j * 100 + ' ' + i * 120,
    //     };
    //     if (i === 0)
    //       node.loc = (rowLayoutData.maxWidth / 2) * 100 + ' ' + x * 120;
    //     nodesData.push(node);

    //     for (const parentId of d.parents) {
    //       linkData.push({
    //         key: -linkData.length - 1,
    //         from: parentId,
    //         to: d.deedId,
    //       });
    //     }
    //   }
    // }

    return nodesData;
  }

  /**
   * Create a list of links in the graph, based on the parent-child relationships in the given HistoryChainData list.
   * @param historyChainDataList the input list of HistoryChainData
   * @returns a list of link data (from, to, key) in the graph
   */
  makeGraphLinks(historyChainDataList: HistoryChainData[]): any[] {
    const linkData: any[] = [];
    for (let i = 0; i < historyChainDataList.length; i++) {
      let d = historyChainDataList[i];
      for (const parentId of d.parents) {
        linkData.push({
          key: -linkData.length - 1,
          from: parentId,
          to: d.deedId,
        });
      }
    }
    return linkData;
  }

  /**
   * This function takes a HistoryChainData list and does a depth-first search (DFS)
   * to generate a tree structure for the history chain graph. It uses a Set to
   * keep track of the nodes that have been generated to avoid duplicates.
   *
   * The generated tree structure contains the following properties for each node:
   * - deedId: the ID of the deed (string)
   * - depth: the depth of the node (number)
   * - width: the total width of the node and its children (number)
   * - children: an array of child nodes (HCGraphLayoutTreeNode[])
   *
   * @param hcdList the HistoryChainData list
   * @param parentDeedId the parent deed ID (optional)
   * @param incurredNodes a Set of nodes that have been generated (optional)
   * @returns an array of HCGraphLayoutTreeNode
   */
  processLayout2(
    hcdList: HistoryChainData[],
    parentDeedId: string | null = null,
    incurredNodes: Set<string> = new Set()
  ): HCGraphLayoutTreeNode[] {
    const res: HCGraphLayoutTreeNode[] = [];
    for (let i = 0; i < hcdList.length; i++) {
      const hcd = hcdList[i];
      // DEBUG
      // console.log('hcd', hcd);
      if (
        (parentDeedId === null && hcd.parents.length === 0) ||
        (parentDeedId !== null && hcd.parents.includes(parentDeedId))
      ) {
        res.push({
          deedId: hcd.deedId,
          depth: 0,
          width: 0,
          children: [],
        });
        incurredNodes.add(hcd.deedId);
      }
    }

    const dupes: string[] = [];
    for (let i = 0; i < res.length; i++) {
      const tmp = res[i];
      const tmpIncurredNodes: Set<string> = new Set();
      tmp.children = this.processLayout2(hcdList, tmp.deedId, tmpIncurredNodes);
      if (tmp.children.length === 0) {
        tmp.width = 1;
        tmp.depth = 1;
      } else {
        tmp.width = tmp.children.reduce((prev, curr) => prev + curr.width, 0);
        tmp.depth =
          tmp.children.reduce((prev, curr) => {
            return Math.max(prev, curr.depth);
          }, 0) + 1;
        tmpIncurredNodes.forEach((deedId) => {
          if (res.find((node) => node.deedId === deedId)) dupes.push(deedId);
          incurredNodes.add(deedId);
        });
      }
    }

    dupes.forEach((deedId) => {
      const foundIdx = res.findIndex((node) => node.deedId === deedId);
      if (foundIdx != undefined)
        // since 0 is also valid
        res.splice(foundIdx, 1);
    });

    //DEBUG
    // console.clear();
    // console.log(res);
    return res;
  }

  // DEPRECATED
  // processLayout(hcdList: HistoryChainData[]): GraphRowLayoutMatrix {
  //   this.processLayout2(hcdList);
  //   let layoutMatrix: GraphRowLayoutMatrix = {
  //     maxWidth: 0,
  //     data: [],
  //   };
  //   layoutMatrix.data.push([]);

  //   for (let i = 0; i < hcdList.length; i++) {
  //     // row 0
  //     if (hcdList[i].parents.length === 0) {
  //       layoutMatrix.data[0].push(hcdList[i]);
  //       hcdList.splice(i, 1);
  //     }
  //   }
  //   layoutMatrix.maxWidth = layoutMatrix.data[0].length - 1;

  //   if (hcdList.length !== 0) {
  //     layoutMatrix.data.push([]);
  //     layoutMatrix.data[1] = hcdList;
  //   }

  //   layoutMatrix.maxWidth = Math.max(
  //     layoutMatrix.maxWidth,
  //     layoutMatrix.data[1].length - 1
  //   );

  //   return layoutMatrix;
  // }

  getDeedNo(deedId: string): string {
    let d = this.deedList().find((d) => d.deedId === deedId);
    return d ? d.deedNo : deedId;
  }

  /**
   * Private method to filter the list of deeds based on the given name (case
   * insensitive). The filter will return a new list of deeds that have the given
   * name in their deedNo.
   * @param name Name to filter by
   * @returns List of deeds that match the given name
   */
  private _filter(name: string): Deed[] {
    const filterValue = name.toLowerCase();
    return this.deedList().filter((option) =>
      option.deedNo.toLowerCase().includes(filterValue)
    );
  }

  ngOnInit(): void {
    this.setDeedList();
  }
}

interface GraphRowLayoutMatrix {
  maxWidth: number;
  data: HistoryChainData[][];
}

interface HCGraphLayoutTreeNode {
  deedId: string;
  depth: number;
  width: number;
  children: HCGraphLayoutTreeNode[];
}
