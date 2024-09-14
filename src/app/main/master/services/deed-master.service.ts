import { FileUploadService } from './../../../services/file-upload.service';
import { inject, Injectable } from '@angular/core';
import { apiUrl } from '../../../config/api.config';
import { HttpClient } from '@angular/common/http';
import { Deed } from '../../../model/deed.model';
import { forkJoin, Observable } from 'rxjs';
import { MortgageData } from '../../../model/mortgage-data.model';

@Injectable({
  providedIn: 'root',
})
export class DeedMasterService {
  public readonly url: string = apiUrl + 'deed';
  private readonly http: HttpClient = inject(HttpClient);
  private readonly fileUploadService: FileUploadService =
    inject(FileUploadService);

  /**
   * Retrieves a list of deed masters from the server.
   *
   * @return {Observable<Deed[]>} An observable that emits the list of deed masters.
   */
  getDeedList(): Observable<Deed[]> {
    return this.http.get<Deed[]>(this.url);
  }

  /**
   * Retrieves a deed master by its deedId.
   *
   * @param {string} deedId - The deedId of the deed master to retrieve.
   * @return {Observable<Deed>} An observable that emits the retrieved deed master.
   */
  getDeed(deedId: string): Observable<Deed> {
    return this.http.get<Deed>(this.url + `/${deedId}`);
  }

  /**
   * Deletes a deed master with the specified deedId.
   *
   * @param {string} deedId - The deedId of the deed master to delete.
   * @return {Observable<any>} An observable that emits the result of the deed master deletion.
   */
  deleteDeed(deedId: string): Observable<any> {
    return this.http.delete(this.url + `/${deedId}`);
  }

  /**
   * Sends a new land record to the server and performs additional actions.
   *
   * @param {object} formValues - The values of the form to be submitted.
   * @param {any} fileObj - The file object to be uploaded.
   * @param {any} fileInfoArrayObj - The array of file information objects.
   * @return {void} This function does not return anything.
   */
  newDeed(
    formValues: any,
    fileObj: any,
    fileInfoArrayObj: any,
    subFnObj?: {
      next?: (data: Partial<Deed>) => void;
      error?: (error?: any) => void;
      complete?: () => void;
    }
  ): void {
    this.http.post(this.url, formValues).subscribe({
      next: (data: Partial<Deed>) => {
        console.log(data);

        const fileObsArr: Observable<string>[] = this.uploadMultipleNewFiles(
          fileInfoArrayObj,
          fileObj,
          data.deedId!
        );

        if (formValues.mortgaged) {
          for (const mort of formValues.mortgagedData) {
            let newMortId: string =
              (data.mortgagedData || []).find((newMort: MortgageData) => {
                return (
                  newMort.mortDate === mort.mortDate &&
                  newMort.mortQty === mort.mortQty &&
                  newMort.party === mort.party
                );
              })?.mortId || '';
            fileObsArr.push(
              this.fileUploadService.uploadFile(
                data.deedId || '',
                'mortDocFile',
                mort.fileRAW.name,
                mort.fileRAW,
                'mort',
                newMortId
              )
            );
          }
        }

        if (subFnObj) {
          if (fileObsArr.length)
            forkJoin(fileObsArr).subscribe({
              next: (uploadResArr: string[]) => {
                uploadResArr.forEach((d) => console.log(d));
                this.getDeed(data.deedId!).subscribe(subFnObj);
              },
              error: subFnObj.error,
            });
          else this.getDeed(data.deedId!).subscribe(subFnObj);
        }
      },
      error: subFnObj?.error,
    });
  }

  /**
   * Updates a deed master on the server by its ID with the provided data and files.
   *
   * @param {string} deedId - The ID of the deed master to update.
   * @param {any} updatedData - The data to update the deed master with.
   * @param {any} fileObj - The file object to be uploaded.
   * @param {any} fileInfoArrayObj - The array of file information objects.
   * @param {any} oldFileInfoArray - The array of old file information objects.
   * @param {subFnObj} subFnObj - Optional object containing next, error, and complete functions to be called after the operation is complete.
   * @return {void} This function does not return anything.
   */
  updateDeed(
    deedId: string,
    updatedData: any,
    fileObj: any,
    fileInfoArrayObj: any,
    oldFileInfoArray: any,
    subFnObj?: {
      next?: (data: Partial<Deed>) => void;
      error?: (error?: any) => void;
      complete?: () => void;
    }
  ): void {
    const url = this.url + '/' + deedId;
    this.http.patch(url, updatedData).subscribe({
      next: (data: any) => {
        console.log(data);

        const fileObsArr: Observable<string>[] = this.uploadMultipleNewFiles(
          fileInfoArrayObj,
          fileObj,
          data.deedId!
        );

        for (const key of Object.keys(oldFileInfoArray)) {
          oldFileInfoArray[key].forEach(
            (item: { markedForDeletion: any; fileName: string }) => {
              if (item.markedForDeletion)
                fileObsArr.push(
                  this.fileUploadService.deleteFile(deedId, key, item.fileName)
                );
            }
          );
        }

        if (updatedData.mortgaged) {
          for (const mort of updatedData.mortgagedData) {
            if (mort.mortId) {
              if (mort.newFile) {
                fileObsArr.push(
                  this.fileUploadService.deleteFile(
                    deedId,
                    'mortDocFile',
                    mort.mortDocFile
                  )
                );
                fileObsArr.push(
                  this.fileUploadService.uploadFile(
                    deedId,
                    'mortDocFile',
                    mort.fileRAW.name,
                    mort.fileRAW,
                    'mort',
                    mort.mortId
                  )
                );
              }
            } else {
              let newMortId: string =
                (data.mortgagedData || []).find((newMort: MortgageData) => {
                  return (
                    newMort.mortDate === mort.mortDate &&
                    newMort.mortQty === mort.mortQty &&
                    newMort.party === mort.party
                  );
                })?.mortId || '';
              fileObsArr.push(
                this.fileUploadService.uploadFile(
                  data.deedId || '',
                  'mortDocFile',
                  mort.fileRAW.name,
                  mort.fileRAW,
                  'mort',
                  newMortId
                )
              );
            }
          }
        }

        if (subFnObj) {
          if (fileObsArr.length)
            forkJoin(fileObsArr).subscribe({
              next: (uploadResArr: string[]) => {
                uploadResArr.forEach((d) => console.log(d));
                console.log(deedId);
                this.getDeed(data.deedId).subscribe(subFnObj);
              },
              error: subFnObj.error,
            });
          else this.getDeed(data.deedId).subscribe(subFnObj);
        }
      },
      error: subFnObj?.error,
    });
  }

  /**
   * Uploads multiple new files based on fileInfoArrayObj and fileObj for a specific ID.
   *
   * @param {Record<string, Array<string>>} fileInfoArrayObj - Object containing file information arrays.
   * @param {Record<string, Array<File>>} fileObj - Object containing raw file data.
   * @param {string} id - The ID associated with the files.
   * @return {Observable<string>[]} An array of observables for the file upload process.
   */
  private uploadMultipleNewFiles(
    fileInfoArrayObj: any,
    fileObj: any,
    id: string
  ): Observable<string>[] {
    const obsArr: Observable<string>[] = [];
    for (const key of Object.keys(fileInfoArrayObj)) {
      for (let index = 0; index < fileObj[key + 'RAW'].length; index++) {
        obsArr.push(
          this.fileUploadService.uploadFile(
            id,
            key,
            fileInfoArrayObj[key][index],
            fileObj[key + 'RAW'][index]
          )
        );
      }
    }
    return obsArr;
  }
}
