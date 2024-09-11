import { inject, Injectable } from '@angular/core';
import { apiUrl } from '../../../config/api.config';
import { HttpClient } from '@angular/common/http';
import { Deed } from '../../../model/deed.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DeedMasterService {
  public readonly url: string = apiUrl + 'deed';

  private readonly http: HttpClient = inject(HttpClient);

  /**
   * Creates a new deed master.
   *
   * @param {Deed} data - The deed data to create.
   * @return {Observable<Deed>} An observable that emits the created deed master.
   */
  newDeed(data: Deed): Observable<Deed> {
    return this.http.post<Deed>(this.url, data);
  }

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
   * Updates a deed master with the specified deedId.
   *
   * @param {string} deedId - The deedId of the deed master to update.
   * @param {Deed} updatedDeed - The updated deed master data.
   * @return {Observable<Deed>} An observable that emits the updated deed master.
   */
  updateDeed(
    deedId: string,
    updatedDeed: Deed
  ): Observable<Deed> {
    return this.http.patch<Deed>(this.url + `/${deedId}`, updatedDeed);
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
}
