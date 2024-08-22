import { Component, WritableSignal, inject, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { LandRecordsService } from '../land-records.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-list-land-record',
  standalone: true,
  imports: [
    MatTableModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    RouterLink,
  ],
  templateUrl: './list-land-record.component.html',
  styleUrl: './list-land-record.component.scss',
})
export class ListLandRecordComponent {
  landRecordsService: LandRecordsService = inject(LandRecordsService);

  displayedColumns: Array<string> = [
    'slno',
    'groupName',
    'state',
    'city',
    'mouza',
    'block',
    'action',
  ];

  listData: WritableSignal<[]> = signal([]);

  ngOnInit(): void {
    this.landRecordsService.getLandRecordList().subscribe((data: any) => {
      console.log(data);
      this.listData.set(data);
    });
  }
}
