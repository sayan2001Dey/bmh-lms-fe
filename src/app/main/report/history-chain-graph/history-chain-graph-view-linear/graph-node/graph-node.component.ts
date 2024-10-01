import { Component, inject, Input } from '@angular/core';
import { GraphNode } from '../../../../../model/graph-node.model';
import { RouterLink } from '@angular/router';
import { DeedMasterDialogComponent } from '../../../../master/components/deed-master/modal/deed-master-dialog/deed-master-dialog.component';
import { Dialog } from '@angular/cdk/dialog';

@Component({
  selector: 'ul.app-graph-node',
  standalone: true,
  imports: [],
  templateUrl: './graph-node.component.html',
  styleUrl: './graph-node.component.scss',
})
export class GraphNodeComponent {
  @Input() graphNodeArray: GraphNode[] = [];
  private readonly dialog: Dialog = inject(Dialog);

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
