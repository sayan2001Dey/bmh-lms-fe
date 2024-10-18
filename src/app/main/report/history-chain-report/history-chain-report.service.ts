import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { apiUrl } from '../../../config/api.config';
import { Observable } from 'rxjs';
import { HistoryChainData } from '../../../model/history-chain-data.model';

@Injectable({
  providedIn: 'root'
})
export class HistoryChainReportService {
  public readonly url: string = apiUrl + 'report/hc';

  private readonly http: HttpClient = inject(HttpClient);

  getHistoryChainReport(deedId: string): Observable<HistoryChainData[]> {
    return this.http.get<HistoryChainData[]>(this.url + '/' + deedId);
  }
}
