import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import {
  HistoryChain,
  HistoryChainData,
} from '../../../model/history-chain.model';
import { hcData } from './data';

@Component({
  selector: 'app-history-chain',
  standalone: true,
  imports: [],
  templateUrl: './history-chain.component.html',
  styleUrl: './history-chain.component.scss',
})
export class HistoryChainComponent implements OnInit {
  readonly recordId: WritableSignal<string> = signal('1');
  readonly treeGraphData: WritableSignal<HistoryChain> = signal({
    recId: this.recordId(),
    parents: [],
    children: [],
    depth: 0,
    spread: 0,
  });
  readonly hcData: WritableSignal<HistoryChainData[]> = signal([]);
  readonly hcLayoutMatrix: WritableSignal<number[][]> = signal([]);

  processTreeGraphRow(
    hcData: HistoryChainData[],
    rows: number[][],
    rowNo: number
  ): void {
    const cols: number[] = [];
    rows[rowNo].forEach((refIdx) => {
      this.processTreeGraphCol(hcData, cols, refIdx);
    });

    if (cols.length) {
      rows.push(cols);
      this.processTreeGraphRow(hcData, rows, rowNo + 1);
    }
  }

  processTreeGraphCol(
    hcData: HistoryChainData[],
    cols: number[],
    refIdx: number
  ): void {
    hcData[refIdx].children.forEach((child) => {
      const childRefIdx = hcData.findIndex((d) => d.recId === child);
      cols.push(childRefIdx);
    });
  }

  prepTreeGraph(hcData: HistoryChainData[]): number[][] {
    const rows: number[][] = [];
    let cols: number[] = [];

    hcData.forEach((d, idx) => {
      if (!d.parents.length) {
        cols.push(idx);
      }
    });
    if (cols.length) rows.push(cols);

    this.processTreeGraphRow(hcData, rows, 0);

    return rows;
  }

  ngOnInit(): void {
    const rows: number[][] = this.prepTreeGraph(hcData);
    this.hcLayoutMatrix.set(rows);
    this.hcData.set(hcData);
    console.log(rows);
    //TODO: Check output?
    console.log()
  }
}
