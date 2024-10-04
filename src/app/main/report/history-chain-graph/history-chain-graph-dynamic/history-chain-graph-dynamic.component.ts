import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import {
  DiagramComponent,
  GojsAngularModule,
  PaletteComponent,
} from 'gojs-angular';
import * as go from 'gojs';

@Component({
  selector: 'app-history-chain-graph-dynamic',
  standalone: true,
  imports: [GojsAngularModule],
  templateUrl: './history-chain-graph-dynamic.component.html',
  styleUrls: ['./history-chain-graph-dynamic.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class HistoryChainGraphDynamicComponent {
  @ViewChild('myDiagram', { static: true })
  public myDiagramComponent!: DiagramComponent;
  @ViewChild('myPalette', { static: true })
  public myPaletteComponent!: PaletteComponent;

  // Big object that holds app-level state data
  // As of gojs-angular 2.0, immutability is expected and required of state for ease of change detection.
  // Whenever updating state, immutability must be preserved. It is recommended to use immer for this, a small package that makes working with immutable data easy.
  public state = {
    // Diagram state props
    diagramNodeData: [
      { key: 'Alpha', text: 'Alpha', color: 'lightblue', loc: '0 0' },
      { key: 'Beta', text: 'Beta', color: 'orange', loc: '150 0' },
      { key: 'Gamma', text: 'Gamma', color: 'lightgreen', loc: '0 100' },
      { key: 'Delta', text: 'Delta', color: 'pink', loc: '100 100' },
    ],
    diagramLinkData: [
      { key: -1, from: 'Alpha', to: 'Beta', fromPort: 'r', toPort: 'l' },
      { key: -2, from: 'Alpha', to: 'Gamma', fromPort: 'b', toPort: 't' },
      { key: -3, from: 'Beta', to: 'Beta' },
      { key: -4, from: 'Gamma', to: 'Delta', fromPort: 'r', toPort: 'l' },
      { key: -5, from: 'Delta', to: 'Alpha', fromPort: 't', toPort: 'r' },
    ],
    diagramModelData: { prop: 'value' },
    skipsDiagramUpdate: true,
  };
  public diagramDivClassName = 'myDiagramDiv';

  public initDiagram(): go.Diagram {
    const diagram = new go.Diagram({
      'commandHandler.archetypeGroupData': { key: 'Group', isGroup: true },
      'clickCreatingTool.archetypeNodeData': {
        text: 'new node',
        color: 'lightblue',
      },
      'undoManager.isEnabled': true,
      model: new go.GraphLinksModel({
        linkToPortIdProperty: 'toPort', // want to support multiple ports per node
        linkFromPortIdProperty: 'fromPort',
        linkKeyProperty: 'key', // IMPORTANT! must be defined for merges and data sync when using GraphLinksModel
      }),
    });

    // define the Node template
    diagram.nodeTemplate = new go.Node('Spot', {
      contextMenu: (go.GraphObject.build('ContextMenu') as go.Adornment).add(
        (go.GraphObject.build('ContextMenuButton') as go.Panel).add(
          new go.TextBlock('Group', {
            click: (e, obj) => e.diagram.commandHandler.groupSelection(),
          })
        )
      ),
    })
      .bindTwoWay('location', 'loc', go.Point.parse, go.Point.stringifyFixed(1))
      .add(
        new go.Panel('Auto').add(
          new go.Shape('RoundedRectangle', { strokeWidth: 0.5 }).bind(
            'fill',
            'color'
          ),
          new go.TextBlock({ margin: 8, editable: true }).bindTwoWay('text')
        )
      );

    diagram.linkTemplate = new go.Link({
      curve: go.Curve.JumpOver,
      fromEndSegmentLength: 30,
      toEndSegmentLength: 30,
    }).add(
      new go.Shape({ strokeWidth: 1.5 }),
      new go.Shape({ toArrow: 'Standard' })
    );

    return diagram;
  }
}
