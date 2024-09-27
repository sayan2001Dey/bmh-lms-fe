import { Component, Input } from '@angular/core';
import { GraphNode } from '../../../../../model/graph-node.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'ul.app-graph-node',
  standalone: true,
  imports: [],
  templateUrl: './graph-node.component.html',
  styleUrl: './graph-node.component.scss',
})
export class GraphNodeComponent {
  @Input() graphNodeArray: GraphNode[] = [];
  onShowDeed(deedId: string) {
    alert('⚠' + deedId + ' loading failed!');
  }
}
