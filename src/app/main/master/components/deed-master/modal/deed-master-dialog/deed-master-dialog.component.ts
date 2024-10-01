import { DialogRef } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';
import { DeedMasterComponent } from "../../deed-master.component";

@Component({
  selector: 'app-deed-master-dialog',
  standalone: true,
  imports: [DeedMasterComponent],
  templateUrl: './deed-master-dialog.component.html',
  styleUrl: './deed-master-dialog.component.scss',
})
export class DeedMasterDialogComponent {
  readonly dialogRef: DialogRef = inject(DialogRef);
}
