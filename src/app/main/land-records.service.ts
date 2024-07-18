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

  newLandRecord(formValues: {}, fileObj: any, fileInfoArrayObj: any): void {
    this.http.post(this.uri, formValues).subscribe((data: any) => {
      console.log(data);
      this.uploadMultipleNewFiles(fileInfoArrayObj, fileObj, data.id);
      this.router.navigateByUrl('/land-record');
    });
  }

  getLandRecord(id: number): Observable<any> {
    return this.http.get(this.uri + '/' + id);
  }

  getLandRecordList(): Observable<any> {
    return this.http.get(this.uri);
  }

  updateLandRecord(
    id: number,
    updatedData: any,
    fileObj: any,
    fileInfoArrayObj: any,
    oldFileInfoArray: any
  ): void {
    const url = this.uri + '/' + id;
    this.http.patch(url, updatedData).subscribe((data) => {
      console.log(data);
      this.uploadMultipleNewFiles(fileInfoArrayObj, fileObj, id);
      for (const key of Object.keys(oldFileInfoArray)) {
        oldFileInfoArray[key].forEach(
          (item: { markedForDeletion: any; fileName: string }) => {
            if (item.markedForDeletion)
              this.deleteFile(id, key, item.fileName).subscribe((data) => {
                console.log(data);
              });
          }
        );
      }
      this.router.navigateByUrl('/land-record');
    });
  }

  /**
   * Deletes a file associated with a specific field and ID.
   *
   * @param {string|number} id - The ID of the file.
   * @param {string} fieldName - The name of the field.
   * @param {string} fileName - The name of the file.
   * @return {Observable<any>} An observable that emits the response from the server.
   */
  deleteFile(id: string|number, fieldName: string, fileName: string): Observable<any> {
    return this.http.delete(
      this.uri + '/attachments/' + fieldName + '?id=' + id + '&filename=' + fileName
    );
  }

  private uploadMultipleNewFiles(
    fileInfoArrayObj: any,
    fileObj: any,
    id: number | string
  ): Observable<any> {
    for (const key of Object.keys(fileInfoArrayObj)) {
      for (let index = 0; index < fileObj[key + 'RAW'].length; index++) {
        const fileNameSplitArray = fileInfoArrayObj[key][index].split('.');
        const file = fileNameSplitArray.reduce(
          (acc: string, curVal: string, idx: number) => {
            if (idx < fileNameSplitArray.length - 1)
              acc += (idx ? '.' : '') + curVal;
            return acc;
          },
          ''
        );
        const ext = fileNameSplitArray[fileNameSplitArray.length - 1];
        const fileUploadUri =
          this.uri +
          '/attachments/' +
          key +
          '?id=' +
          id +
          '&file=' +
          file +
          '&ext=' +
          ext;
        this.http
          .post(fileUploadUri, fileObj[key + 'RAW'][index], {
            responseType: 'text',
          })
          .subscribe((data) => {
            console.log(data);
          });
      }
    }
    return new Observable();
  }
}
