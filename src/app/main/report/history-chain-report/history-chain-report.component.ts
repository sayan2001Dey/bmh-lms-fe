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
import { ChainDeedData } from '../../../model/chain-deed-data.model';
import { HttpErrorResponse } from '@angular/common/http';
import { TestReportComponent } from "../test-report/test-report.component";

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
    TestReportComponent
],
  templateUrl: './history-chain-report.component.html',
  styleUrl: './history-chain-report.component.scss',
})
export class HistoryChainReportComponent implements OnInit {
  private readonly deedService: DeedMasterService = inject(DeedMasterService);
  private readonly landRecordService: LandRecordsService =
    inject(LandRecordsService);
  readonly searchBar: FormControl<string | null> =
    inject(FormBuilder).control('');
  readonly deedList: WritableSignal<Deed[]> = signal([]);
  readonly sysIsBusy: WritableSignal<boolean> = signal(false);
  readonly serverUnreachable: WritableSignal<boolean> = signal(false);
  readonly chainDeedDataArray: WritableSignal<ChainDeedData[]> = signal([]);
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
    const recId =
      this.deedList().find((deed) => deed.deedNo === searchBarVal)?.recId || '';

    if (recId === '') {
      alert('⛔ ERROR: THIS DEED IS NOT PART OF A RECORD\n\nDeed not found.');
    }

    console.log(recId);
    this.sysIsBusy.set(true);
    this.landRecordService.getLandRecord(recId).subscribe({
      next: (data) => {
        this.serverUnreachable.set(false);
        this.chainDeedDataArray.set(data.chainDeedData);
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 404) {
          alert('⛔ ERROR: LAND RECORD NOT FOUND\n\nPlease try again later.');
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
