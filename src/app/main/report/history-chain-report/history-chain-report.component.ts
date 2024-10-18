import { HistoryChainReportService } from './history-chain-report.service';
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
import { HttpErrorResponse } from '@angular/common/http';
import { TestReportComponent } from '../test-report/test-report.component';
import { HistoryChainData } from '../../../model/history-chain-data.model';
import { GraphStateData } from '../../../model/graph-state-data.model';
import { HistoryChainGraphDynamicComponent } from "../history-chain-graph/history-chain-graph-dynamic/history-chain-graph-dynamic.component";

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
    TestReportComponent,
    HistoryChainGraphDynamicComponent
],
  templateUrl: './history-chain-report.component.html',
  styleUrl: './history-chain-report.component.scss',
})
export class HistoryChainReportComponent implements OnInit {
  private readonly deedService: DeedMasterService = inject(DeedMasterService);
  private readonly landRecordService: LandRecordsService =
    inject(LandRecordsService);
  private readonly historyChainReportService: HistoryChainReportService =
    inject(HistoryChainReportService);
  readonly searchBar: FormControl<string | null> =
    inject(FormBuilder).control('');
  readonly deedList: WritableSignal<Deed[]> = signal([]);
  readonly sysIsBusy: WritableSignal<boolean> = signal(false);
  readonly serverUnreachable: WritableSignal<boolean> = signal(false);
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
  readonly stateSignal: WritableSignal<GraphStateData> = signal({
    diagramNodeData: [],
    diagramLinkData: [],
    diagramModelData: { prop: 'value' },
    skipsDiagramUpdate: true,
  });
  readonly renderDiagramComponent: WritableSignal<boolean> = signal(false);

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
    const deedId =
      this.deedList().find((deed) => deed.deedNo === searchBarVal)?.deedId || '';

    if (deedId === '') {
      alert('⛔ ERROR: UNKNOWN INPUT\n\nDeed not found.');
    }

    this.sysIsBusy.set(true);
    this.renderDiagramComponent.set(false);
    this.historyChainReportService.getHistoryChainReport(deedId).subscribe({
      next: (data) => {
        this.serverUnreachable.set(false);
        this.processData(data);
        this.renderDiagramComponent.set(true);
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 404) {
          alert('⛔ ERROR: DEED NOT FOUND\n\nPlease try again later.');
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

  processData(historyChainDataList: HistoryChainData[]) {
    console.log(historyChainDataList);

    console.log('start process');

    let nodesData: any[] = [];
    let linkData: any[] = [];

    for (let i = 0; i < historyChainDataList.length; i++) {
      let d = historyChainDataList[i];
      nodesData.push({
        key: d.deedId,
        text: this.getDeedNo(d.deedId) + '\n' + d.deedId,
        color: 'lightgreen',
        // TODO
        // loc: '0 150',
      });
      for (const parentId of d.parents) {
        linkData.push({
          key: -linkData.length - 1,
          from: parentId,
          to: d.deedId,
        });
      }
    }

    this.stateSignal.set(
      (() => {
        let d = this.stateSignal();
        d.diagramNodeData = nodesData;
        d.diagramLinkData = linkData;
        return d;
      })()
    );
  }

  getDeedNo(deedId: string): string {
    let d = this.deedList().find((d) => d.deedId === deedId);
    return d ? d.deedNo : deedId;
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
