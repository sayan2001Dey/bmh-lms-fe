import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiUrl } from '../../../config/api.config';
import { HttpClient } from '@angular/common/http';
import { User } from '../../../model/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserMasterService {
  public readonly url: string = apiUrl + 'user';

  private readonly http: HttpClient = inject(HttpClient);

  /**
   * Creates a new user.
   *
   * @param {User} data - The user data to create.
   * @return {Observable<User>} An observable that emits the created user.
   */
  newUser(data: User): Observable<User> {
    return this.http.post<User>(this.url, data);
  }

  /**
   * Retrieves the list of users.
   *
   * @return {Observable<User[]>} An observable that emits the list of users.
   */
  getUserList(): Observable<User[]> {
    return this.http.get<User[]>(this.url);
  }

  /**
   * Retrieves a user by their username.
   *
   * @param {string} username - The username of the user to retrieve.
   * @return {Observable<User>} An observable that emits the user data.
   */
  getUser(username: string): Observable<User> {
    return this.http.get<User>(this.url + `/${username}`);
  }

  /**
   * Updates a user with the specified username.
   *
   * @param {string} username - The username of the user to update.
   * @param {User} updatedUser - The updated user data.
   * @return {Observable<User>} An observable that emits the updated user.
   */
  updateUser(username: string, updatedUser: User): Observable<User> {
    return this.http.patch<User>(this.url + `/${username}`, updatedUser);
  }

  /**
   * Deletes a user with the specified username.
   *
   * @param {string} username - The username of the user to delete.
   * @return {Observable<any>} An observable that emits the result of the user deletion.
   */
  deleteUser(username: string): Observable<any> {
    return this.http.delete(this.url + `/${username}`);
  }

  changePassword(): Observable<any> {
    return new Observable();
  }
}
