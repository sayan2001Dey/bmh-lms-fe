import { inject, Injectable } from '@angular/core';
import { apiUrl } from '../config/api.config';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class FileUploadService {
  private readonly url: string = apiUrl + 'attachments';
  private readonly http: HttpClient = inject(HttpClient);

  /**
   * Uploads a single file based on the provided file information and ID.
   *
   * @param {string} refId - The Ref ID associated with the file.
   * @param {string} fieldName - The name of the field to which the file belongs.
   * @param {string} fileName - The name of the file to be uploaded.
   * @param {File} fileRAW - The raw file data to be uploaded.
   * @param {string} [innerQParam] - The query parameter name for the inner ID.
   * @param {string} [innerId] - The inner ID associated with the file.
   * @return {Observable<string>} An observable for the file upload process.
   */
  uploadFile(
    refId: string,
    fieldName: string,
    fileName: string,
    fileRAW: File,
    innerQParam?: string,
    innerId?: string
  ): Observable<string> {
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
      this.url
    }/${fieldName}?id=${refId}&file=${file}&ext=${ext}${
      innerId && innerQParam ? `&${innerQParam}=${innerId}` : ''
    }`;
    return this.http.post(fileUploadUri, fileRAW, {
      responseType: 'text',
    });
  }

  /**
   * Downloads a file from the attachments directory based on the provided field name and file name.
   *
   * @param {string} fieldName - The name of the field containing the file.
   * @param {string} fileName - The name of the file to download.
   * @return {Observable<Blob>} An observable that emits the blob representing the file.
   */
  getFile(fieldName: string, fileName: string): Observable<Blob> {
    return this.http.get(this.url + '/' + fieldName + '/' + fileName, {
      responseType: 'blob',
    });
  }

  /**
   * Deletes a file associated with a specific field and ID.
   *
   * @param {string} id - The ID of the ref entity.
   * @param {string} fieldName - The name of the field.
   * @param {string} fileName - The name of the file.
   * @return {Observable<any>} An observable that emits the response from the server.
   */
  deleteFile(id: string, fieldName: string, fileName: string): Observable<any> {
    return this.http.delete(
      this.url + '/' + fieldName + '?id=' + id + '&filename=' + fileName
    );
  }
}
