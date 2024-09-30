import { Component, WritableSignal, inject, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { LandRecordsService } from '../land-records.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { GroupMasterService } from '../../master/services/group-master.service';
import { CompanyMasterService } from '../../master/services/company-master.service';
import { MouzaMasterService } from '../../master/services/mouza-master.service';
import { Group } from '../../../model/group.model';
import { Company } from '../../../model/company.model';
import { Mouza } from '../../../model/mouza.model';
import { Deed } from '../../../model/deed.model';
import { DeedMasterService } from '../../master/services/deed-master.service';
import { ChainDeedData } from '../../../model/chain-deed-data.model';
import { HttpErrorResponse } from '@angular/common/http';

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
  private readonly landRecordsService: LandRecordsService =
    inject(LandRecordsService);
  private readonly groupMasterService: GroupMasterService =
    inject(GroupMasterService);
  private readonly companyMasterService: CompanyMasterService =
    inject(CompanyMasterService);
  private readonly mouzaMasterService: MouzaMasterService =
    inject(MouzaMasterService);
  private readonly deedMasterService: DeedMasterService =
    inject(DeedMasterService);

  displayedColumns: Array<string> = ['slno', 'recordId', 'deedId', 'action'];

  readonly listData: WritableSignal<any[]> = signal([]);
  readonly deedList: WritableSignal<Deed[]> = signal([]);
  readonly companyList: WritableSignal<Company[]> = signal([]);
  readonly groupList: WritableSignal<Group[]> = signal([]);
  readonly mouzaList: WritableSignal<Mouza[]> = signal([]);
  readonly sysIsBusy: WritableSignal<boolean> = signal(false);

  setLandRecordList(): void {
    this.landRecordsService.getLandRecordList().subscribe((data: any) => {
      console.log('listData: ', data);
      this.listData.set(data);
    });
  }

  setDeedList(): void {
    this.deedMasterService.getDeedList().subscribe((data: Deed[]) => {
      this.deedList.set(data);
    });
  }

  setCompanyList(): void {
    this.companyMasterService.getCompanyList().subscribe((data: Company[]) => {
      console.log('companyList: ', data);
      this.companyList.set(data);
    });
  }

  setGroupList(): void {
    this.groupMasterService.getGroupList().subscribe((data: Group[]) => {
      console.log('groupList: ', data);
      this.groupList.set(data);
    });
  }

  setMouzaList(): void {
    this.mouzaMasterService.getMouzaList().subscribe((data: Mouza[]) => {
      console.log('mouzaList: ', data);
      this.mouzaList.set(data);
    });
  }

  getCompanyName(buyerOwner: string): string {
    return (
      this.companyList().find((company) => company.companyId === buyerOwner)
        ?.companyName || buyerOwner
    );
  }

  getGroupName(groupId: string): string {
    return (
      this.groupList().find((group) => group.groupId === groupId)?.groupName ||
      groupId
    );
  }

  getCityName(groupId: string): string {
    return (
      this.groupList().find((group) => group.groupId === groupId)?.city || ''
    );
  }

  getMouzaName(mouzaId: string): string {
    return (
      this.mouzaList().find((mouza) => mouza.mouzaId === mouzaId)?.mouza ||
      mouzaId
    );
  }

  getDeedNos(idx: number): string[] {
    const listData = this.listData();
    let res: string[] = [];
    if (idx < listData.length && idx > -1) {
      listData[idx].chainDeedData.map((chainDeed: ChainDeedData) =>
        res.push(this.getDeedNo(chainDeed.deedId))
      );
    }
    return res;
  }

  getDeedNo(deedId: string): string {
    const deedList: Deed[] = this.deedList();
    for (const deed of deedList) if (deed.deedId === deedId) return deed.deedNo;

    return deedId;
  }


  onDeleteLandRecord(recId: string) {
    if (
      window.confirm(
        '⚠ CAUTION: ACTION CANNOT BE UNDONE!\n\nDo you really want to delete this land record?'
      )
    ) {
      this.sysIsBusy.set(true);
      this.landRecordsService.deleteLandRecord(recId).subscribe({
        next: () => {
          this.listData.set(
            this.listData().filter(
              (record) => record.recId !== recId
            )
          );
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 404) {
            alert('⛔ ERROR: CAN NOT DELETE\n\nLand record not found.');
          } else {
            alert(
              '⛔ ERROR: CAN NOT DELETE\n\nFailed to delete land record. Please try again.'
            );
          }
        },
        complete: () => {
          this.sysIsBusy.set(false);
        },
      });
    }
  }



  ngOnInit(): void {
    this.setLandRecordList();
    this.setCompanyList();
    this.setGroupList();
    this.setMouzaList();
    this.setDeedList();
  }
}
