import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { apiUrl } from '../../../config/api.config';
import { Observable } from 'rxjs';
import { Mouza } from '../../../model/mouza.model';

@Injectable({
  providedIn: 'root'
})
export class MouzaMasterService {
  public readonly url: string = apiUrl + 'mouza';

  private readonly http: HttpClient = inject(HttpClient);

  /**
   * Creates a new mouza master.
   *
   * @param {Mouza} data - The mouza data to create.
   * @return {Observable<Mouza>} An observable that emits the created mouza master.
   */
  newMouza(data: Mouza): Observable<Mouza> {
    return this.http.post<Mouza>(this.url, data);
  }

  /**
   * Retrieves a list of mouza masters from the server.
   *
   * @return {Observable<Mouza[]>} An observable that emits the list of mouza masters.
   */
  getMouzaList(): Observable<Mouza[]> {
    return this.http.get<Mouza[]>(this.url);
  }

  /**
   * Retrieves a mouza master by its mouzaId.
   *
   * @param {string} mouzaId - The mouzaId of the mouza master to retrieve.
   * @return {Observable<Mouza>} An observable that emits the retrieved mouza master.
   */
  getMouza(mouzaId: string): Observable<Mouza> {
    return this.http.get<Mouza>(this.url + `/${mouzaId}`);
  }

  /**
   * Updates a mouza master with the specified mouzaId.
   *
   * @param {string} mouzaId - The mouzaId of the mouza master to update.
   * @param {Mouza} updatedMouza - The updated mouza master data.
   * @return {Observable<Mouza>} An observable that emits the updated mouza master.
   */
  updateMouza(
    mouzaId: string,
    updatedMouza: Mouza
  ): Observable<Mouza> {
    return this.http.patch<Mouza>(this.url + `/${mouzaId}`, updatedMouza);
  }

  /**
   * Deletes a mouza master with the specified mouzaId.
   *
   * @param {string} mouzaId - The mouzaId of the mouza master to delete.
   * @return {Observable<any>} An observable that emits the result of the mouza master deletion.
   */
  deleteMouza(mouzaId: string): Observable<any> {
    return this.http.delete(this.url + `/${mouzaId}`);
  }
}
