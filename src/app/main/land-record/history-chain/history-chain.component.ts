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

  fx(
    hcData: HistoryChainData[],
    rootNode: HistoryChainData,
    res: HistoryChain
  ) {
    if (rootNode.children.length === 0) return;

    let depth = 1;
    let spread = rootNode.children.length - 1;

    rootNode.children.forEach((child) => {
      let foundIdx = hcData.findIndex((data) => {
        return data.recId === child;
      });

      const childObj = {
        recId: hcData[foundIdx].recId,
        parents: [],
        children: [],
        depth: 0,
        spread: 0,
      };

      res.children.push(childObj);

      this.fx(hcData, hcData[foundIdx], childObj);

      const newDepth = childObj.depth + 1;

      if (newDepth > depth) depth = newDepth;

      if (childObj.spread > 0) spread += childObj.spread;

      console.log('processedChild for ' + res.recId + ': ', hcData[foundIdx]);
    });

    res.spread = spread;
    res.depth = depth;
  }

  ngOnInit(): void {
    const processedData: HistoryChain[] = [];

    let tempNode: HistoryChain;

    hcData.forEach((tmp) => {
      if (!tmp.parents.length) {
        tempNode = {
          recId: tmp.recId,
          parents: [],
          children: [],
          depth: 0,
          spread: 0,
        };
        this.fx(hcData, tmp, tempNode);
        processedData.push(tempNode);
        return;
      }
    });

    console.log('processedData', processedData);
    console.log(this.treeGraphData());
  }
}
