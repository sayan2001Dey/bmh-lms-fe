import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiUrl } from '../../../config/api.config';
import { Group } from '../../../model/group.model';

@Injectable({
  providedIn: 'root'
})
export class GroupMasterService {
  public readonly url: string = apiUrl + 'group';

  private readonly http: HttpClient = inject(HttpClient);

  /**
   * Creates a new group master.
   *
   * @param {Group} data - The group data to create.
   * @return {Observable<Group>} An observable that emits the created group master.
   */
  newGroup(data: Group): Observable<Group> {
    return this.http.post<Group>(this.url, data);
  }

  /**
   * Retrieves a list of group masters from the server.
   *
   * @return {Observable<Group[]>} An observable that emits the list of group masters.
   */
  getGroupList(): Observable<Group[]> {
    return this.http.get<Group[]>(this.url);
  }

  /**
   * Retrieves a group master by its groupId.
   *
   * @param {string} groupId - The groupId of the group master to retrieve.
   * @return {Observable<Group>} An observable that emits the retrieved group master.
   */
  getGroup(groupId: string): Observable<Group> {
    return this.http.get<Group>(this.url + `/${groupId}`);
  }

  /**
   * Updates a group master with the specified groupId.
   *
   * @param {string} groupId - The groupId of the group master to update.
   * @param {Group} updatedGroup - The updated group master data.
   * @return {Observable<Group>} An observable that emits the updated group master.
   */
  updateGroup(
    groupId: string,
    updatedGroup: Group
  ): Observable<Group> {
    return this.http.patch<Group>(this.url + `/${groupId}`, updatedGroup);
  }

  /**
   * Deletes a group master with the specified groupId.
   *
   * @param {string} groupId - The groupId of the group master to delete.
   * @return {Observable<any>} An observable that emits the result of the group master deletion.
   */
  deleteGroup(groupId: string): Observable<any> {
    return this.http.delete(this.url + `/${groupId}`);
  }
}
