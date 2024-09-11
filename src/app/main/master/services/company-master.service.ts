import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiUrl } from '../../../config/api.config';
import { Company } from '../../../model/company.model';

@Injectable({
  providedIn: 'root',
})
export class CompanyMasterService {
  public readonly url: string = apiUrl + 'company';

  private readonly http: HttpClient = inject(HttpClient);

  /**
   * Creates a new company master.
   *
   * @param {Company} data - The company data to create.
   * @return {Observable<Company>} An observable that emits the created company master.
   */
  newCompany(data: Company): Observable<Company> {
    return this.http.post<Company>(this.url, data);
  }

  /**
   * Retrieves a list of company masters from the server.
   *
   * @return {Observable<Company[]>} An observable that emits the list of company masters.
   */
  getCompanyList(): Observable<Company[]> {
    return this.http.get<Company[]>(this.url);
  }

  /**
   * Retrieves a company master by its companyId.
   *
   * @param {string} companyId - The companyId of the company master to retrieve.
   * @return {Observable<Company>} An observable that emits the retrieved company master.
   */
  getCompany(companyId: string): Observable<Company> {
    return this.http.get<Company>(this.url + `/${companyId}`);
  }

  /**
   * Updates a company master with the specified companyId.
   *
   * @param {string} companyId - The companyId of the company master to update.
   * @param {Company} updatedCompany - The updated company master data.
   * @return {Observable<Company>} An observable that emits the updated company master.
   */
  updateCompany(
    companyId: string,
    updatedCompany: Company
  ): Observable<Company> {
    return this.http.patch<Company>(this.url + `/${companyId}`, updatedCompany);
  }

  /**
   * Deletes a company master with the specified companyId.
   *
   * @param {string} companyId - The companyId of the company master to delete.
   * @return {Observable<any>} An observable that emits the result of the company master deletion.
   */
  deleteCompany(companyId: string): Observable<any> {
    return this.http.delete(this.url + `/${companyId}`);
  }
}
