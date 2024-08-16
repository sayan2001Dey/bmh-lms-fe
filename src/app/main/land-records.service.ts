import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { MortgageData } from '../model/mortgage-data.model';

@Injectable({
  providedIn: 'root',
})
export class LandRecordsService {
  public readonly uri: string = 'http://127.0.0.1:8081/api/landrecord';
  private http: HttpClient = inject(HttpClient);
  private router: Router = inject(Router);

  /**
   * Sends a new land record to the server and performs additional actions.
   *
   * @param {object} formValues - The values of the form to be submitted.
   * @param {any} fileObj - The file object to be uploaded.
   * @param {any} fileInfoArrayObj - The array of file information objects.
   * @return {void} This function does not return anything.
   */
  public newLandRecord(
    formValues: any,
    fileObj: any,
    fileInfoArrayObj: any
  ): void {
    this.http.post(this.uri, formValues).subscribe((data: any) => {
      console.log(data);
      this.uploadMultipleNewFiles(fileInfoArrayObj, fileObj, data.recId);
      if (formValues.mortgaged)
        for (const mort of formValues.mortgagedData) {
          let newMortId: string =
            (data.mortgagedData as Array<MortgageData>).find((newMort) => {
              return (
                newMort.mortDate === mort.mortDate &&
                newMort.mortQty === mort.mortQty &&
                newMort.party === mort.party
              );
            })?.mortId || '';
          this.uploadMortgagedFile(
            data.recId,
            mort.fileRAW,
            newMortId
          ).subscribe((data) => console.log(data));
        }
      this.router.navigateByUrl('/land-record/view/' + data.recId);
    });
  }

  /**
   * Retrieves a land record from the server by its ID.
   *
   * @param {string} id - The ID of the land record to retrieve.
   * @return {Observable<any>} An observable that emits the retrieved land record data.
   */
  public getLandRecord(id: string): Observable<any> {
    return this.http.get(this.uri + '/' + id);
  }

  /**
   * Retrieves a list of land records from the server.
   *
   * @return {Observable<any>} An observable that emits the list of land records.
   */
  public getLandRecordList(): Observable<any> {
    return this.http.get(this.uri);
  }

  /**
   * Updates a land record on the server by its ID with the provided data and files.
   *
   * @param {string} id - The ID of the land record to update.
   * @param {any} updatedData - The data to update the land record with.
   * @param {any} fileObj - The file object to be uploaded.
   * @param {any} fileInfoArrayObj - The array of file information objects.
   * @param {any} oldFileInfoArray - The array of old file information objects.
   * @return {void} This function does not return anything.
   */
  public updateLandRecord(
    id: string,
    updatedData: any,
    fileObj: any,
    fileInfoArrayObj: any,
    oldFileInfoArray: any
  ): void {
    const url = this.uri + '/' + id;
    this.http.patch(url, updatedData).subscribe((data: any) => {
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
      if (updatedData.mortgaged)
        for (const mort of updatedData.mortgagedData) {
          if (mort.mortId) {
            if (mort.newFile) {
              this.deleteFile(id, 'mortDocFile', mort.mortDocFile)
                .subscribe((data) => console.log(data))
                .add(() =>
                  this.uploadMortgagedFile(
                    id,
                    mort.fileRAW,
                    mort.mortId
                  ).subscribe((data) => console.log(data))
                );
            }
          } else {
            let newMortId: string =
              (data.mortgagedData as Array<MortgageData>).find((newMort) => {
                return (
                  newMort.mortDate === mort.mortDate &&
                  newMort.mortQty === mort.mortQty &&
                  newMort.party === mort.party
                );
              })?.mortId || '';
            this.uploadMortgagedFile(id, mort.fileRAW, newMortId).subscribe(
              (data) => console.log(data)
            );
          }
        }

      this.router.navigateByUrl('/land-record/view/' + id);
    });
  }

  public deleteLandRecord(recId: string): void {
    this.http.delete(this.uri + '/' + recId).subscribe((data) => {
      console.log(data);
      this.router.navigateByUrl('/land-record');
    });
  }

  /**
   * Deletes a file associated with a specific field and ID.
   *
   * @param {string} id - The ID of the land record.
   * @param {string} fieldName - The name of the field.
   * @param {string} fileName - The name of the file.
   * @return {Observable<any>} An observable that emits the response from the server.
   */
  deleteFile(id: string, fieldName: string, fileName: string): Observable<any> {
    return this.http.delete(
      this.uri +
        '/attachments/' +
        fieldName +
        '?id=' +
        id +
        '&filename=' +
        fileName
    );
  }

  /**
   * #TODO: REWORK
   * Uploads multiple new files based on fileInfoArrayObj and fileObj for a specific ID.
   *
   * @param {any} fileInfoArrayObj - Object containing file information arrays.
   * @param {any} fileObj - Object containing raw file data.
   * @param {string} id - The ID associated with the files.
   * @return {Observable<any>} An observable for the file upload process.
   */
  private uploadMultipleNewFiles(
    fileInfoArrayObj: any,
    fileObj: any,
    id: string
  ): Observable<any> {
    for (const key of Object.keys(fileInfoArrayObj)) {
      for (let index = 0; index < fileObj[key + 'RAW'].length; index++) {
        this.uploadFile(
          id,
          key,
          fileInfoArrayObj[key][index],
          fileObj[key + 'RAW'][index]
        ).subscribe((data) => {
          console.log(data);
        });
      }
    }
    return new Observable();
  }

  /**
   * Uploads a mortgaged file based on the provided record ID and mortgage data.
   *
   * @param {string} recId - The Record ID associated with the mortgaged file.
   * @param {File} fileRAW - The raw file data to be uploaded.
   * @param {string} mortId - The mortgage ID associated with the mortgaged file.
   * @return {Observable<string>} An observable for the file upload process.
   */
  uploadMortgagedFile(
    recId: string,
    fileRAW: File,
    mortId: string
  ): Observable<string> {
    if (!fileRAW) return new Observable();
    return this.uploadFile(recId, 'mortDocFile', fileRAW.name, fileRAW, mortId);
  }

  /**
   * Uploads a single file based on the provided file information and ID.
   *
   * @param {string} recId - The Record ID associated with the file.
   * @param {string} fieldName - The name of the field to which the file belongs.
   * @param {string} fileName - The name of the file to be uploaded.
   * @param {File} fileRAW - The raw file data to be uploaded.
   * @return {Observable<string>} An observable for the file upload process.
   */
  uploadFile(
    recId: string,
    fieldName: string,
    fileName: string,
    fileRAW: File,
    mortId: string = ''
  ): Observable<string> {
    if (!fileName) return new Observable();
    const fileNameSplitArray = fileName.split('.');
    const file = fileNameSplitArray.reduce(
      (acc: string, curVal: string, idx: number) => {
        if (idx < fileNameSplitArray.length - 1)
          acc += (idx ? '.' : '') + curVal;
        return acc;
      },
      ''
    );
    const ext = fileNameSplitArray[fileNameSplitArray.length - 1];
    const fileUploadUri = `${
      this.uri
    }/attachments/${fieldName}?id=${recId}&file=${file}&ext=${ext}${
      mortId.length ? `&mort=${mortId}` : ''
    }`;
    return this.http.post(fileUploadUri, fileRAW, {
      responseType: 'text',
    });
  }

  getFile(fieldName: string, fileName: string): Observable<any> {
    return this.http.get(
      this.uri + '/attachments/' + fieldName + '/' + fileName,
      {
        responseType: 'blob',
      }
    );
  }
}
