import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LandRecordsService {
  private readonly uri: string = 'http://127.0.0.1:8081/api/landrecord';
  private http: HttpClient = inject(HttpClient);
  private router: Router = inject(Router);

  newLandRecord(formValues: {}): void {
    console.log({ ...formValues });
    this.http.post(this.uri, formValues).subscribe((data) => {
      this.router.navigateByUrl('/land-record');
      console.log(data);
    });
  }

  getLandRecord(id: number): Observable<any> {
    return this.http.get(this.uri + '/' + id);
  }

  getLandRecordList(): Observable<any> {
    return this.http.get(this.uri);
  }

  updateLandRecord(id: number, updatedData: any): void {
    const url = this.uri + '/' + id;
    this.http.patch(url, updatedData).subscribe((data) => {
      this.router.navigateByUrl('/land-record');
      console.log(data);
    });
  }
}
