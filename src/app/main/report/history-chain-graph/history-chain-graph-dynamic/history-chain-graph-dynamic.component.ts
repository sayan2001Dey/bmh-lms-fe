import { Component, inject, Input, ViewChild, ViewEncapsulation } from '@angular/core';
import { DiagramComponent, GojsAngularModule } from 'gojs-angular';
import * as go from 'gojs';
import { GraphStateData } from '../../../../model/graph-state-data.model';
import { Dialog } from '@angular/cdk/dialog';
import { DeedMasterDialogComponent } from '../../../master/components/deed-master/modal/deed-master-dialog/deed-master-dialog.component';

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
  private readonly dialog: Dialog = inject(Dialog);
  public myDiagramComponent!: DiagramComponent;
  private nodeClickHandlerFn = (e: go.InputEvent, obj: go.GraphObject) => {
    const deedId = obj?.part?.data?.key;
    if (deedId) {
      this.onShowDeed(deedId);
    } else {
      alert('⛔ ERROR: UNKNOWN ERROR\n\nImpossible Deed ID.');
    }
  }
  
  // Big object that holds app-level state data
  // As of gojs-angular 2.0, immutability is expected and required of state for ease of change detection.
  // Whenever updating state, immutability must be preserved. It is recommended to use immer for this, a small package that makes working with immutable data easy.
  @Input()
  public state: GraphStateData = {
    diagramNodeData: [],
    diagramLinkData: [],
    diagramModelData: {},
    skipsDiagramUpdate: true,
  };

  public initDiagram(): go.Diagram {
    const diagram = new go.Diagram({
      'commandHandler.archetypeGroupData': { key: 'Group', isGroup: true },
      'undoManager.isEnabled': false,
      initialContentAlignment: go.Spot.Center,
      contentAlignment: go.Spot.Center,
      allowMove: true,
      allowCopy: false,
      allowDelete: false,
      allowDragOut: true,
      allowTextEdit: false,
      allowHorizontalScroll: true,
      allowVerticalScroll: true,
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
      click: (e: any, obj: any) => {
        const deedId = obj?.part?.data?.key;
        if (deedId) {
          alert(deedId);
          console.log(deedId);
          // this.onShowDeed(deedId);
          // global.onShowDeed?.call(null, deedId);
        } else {
          alert('⛔ ERROR: UNKNOWN ERROR\n\nImpossible Deed ID.');
        }
      }
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
      new go.Shape({ toArrow: 'Standard' }),
    );

    return diagram;
  }

  onShowDeed(deedId: string) {
    const dialogRef = this.dialog.open(DeedMasterDialogComponent, {
      backdropClass: 'light-blur-backdrop',
      disableClose: true,
      data: {
        deedId,
        dialogMode: 'view',
      },
    });

    dialogRef.backdropClick.subscribe(() => {
      if (window.confirm('⚠  CONFIRM: EXIT\n\nDo you really want to leave?'))
        dialogRef.close();
    });
  }
}
