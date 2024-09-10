import { Component, WritableSignal, inject, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { LandRecordsService } from '../land-records.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { GroupMasterService } from '../../master/group-master/group-master.service';
import { CompanyMasterService } from '../../master/company-master/company-master.service';
import { MouzaMasterService } from '../../master/mouza-master/mouza-master.service';
import { Group } from '../../../model/group.model';
import { Company } from '../../../model/company.model';
import { Mouza } from '../../../model/mouza.model';
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

  displayedColumns: Array<string> = [
    'slno',
    'recordId',
    'companyName',
    'groupName',
    'city',
    'mouza',
    'action',
  ];

  readonly listData: WritableSignal<[]> = signal([]);
  readonly companyList: WritableSignal<Company[]> = signal([]);
  readonly groupList: WritableSignal<Group[]> = signal([]);
  readonly mouzaList: WritableSignal<Mouza[]> = signal([]);

  getLandRecordList(): void {
    this.landRecordsService.getLandRecordList().subscribe((data: any) => {
      console.log('listData: ', data);
      this.listData.set(data);
    });
  }

  getCompanyList(): void {
    this.companyMasterService.getCompanyList().subscribe((data: Company[]) => {
      console.log('companyList: ', data);
      this.companyList.set(data);
    });
  }

  getGroupList(): void {
    this.groupMasterService.getGroupList().subscribe((data: Group[]) => {
      console.log('groupList: ', data);
      this.groupList.set(data);
    });
  }

  getMouzaList(): void {
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
      this.groupList().find((group) => group.groupId === groupId)?.city ||
      ''
    );
  }

  getMouzaName(mouzaId: string): string {
    return (
      this.mouzaList().find((mouza) => mouza.mouzaId === mouzaId)?.mouza ||
      mouzaId
    );
  }

  ngOnInit(): void {
    this.getLandRecordList();
    this.getCompanyList();
    this.getGroupList();
    this.getMouzaList();
  }
}
