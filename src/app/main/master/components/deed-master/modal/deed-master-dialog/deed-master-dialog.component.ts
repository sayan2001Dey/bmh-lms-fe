import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, Inject, inject } from '@angular/core';
import { DeedMasterComponent } from '../../deed-master.component';

@Component({
  selector: 'app-deed-master-dialog',
  standalone: true,
  imports: [DeedMasterComponent],
  templateUrl: './deed-master-dialog.component.html',
  styleUrl: './deed-master-dialog.component.scss',
})
export class DeedMasterDialogComponent {
  readonly dialogRef: DialogRef = inject(DialogRef);
  readonly data;
  constructor(
    @Inject(DIALOG_DATA)
    data:
      | {
          deedId: string;
          dialogMode: 'none' | 'update' | 'view' | 'new';
        }
      | undefined = undefined
  ) {
    this.data = data;
  }
}
