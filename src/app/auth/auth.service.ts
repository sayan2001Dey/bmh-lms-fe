import { HttpClient } from '@angular/common/http';
import { Injectable, WritableSignal, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly uri: string = 'http://127.0.0.1:8081/api/auth/';
  private readonly http: HttpClient = inject(HttpClient);
  private readonly router: Router = inject(Router);

  private readonly authenticated: WritableSignal<boolean> = signal(false);
  private readonly name: WritableSignal<string> = signal('--');
  private readonly admin: WritableSignal<boolean> = signal(false);

  get isAuthenticated() {
    if (localStorage.getItem('token')) {
      this.authenticated.set(true);
    }
    return this.authenticated;
  }

  get getName() {
    this.name.set(localStorage.getItem('name') || '--');
    return this.name;
  }

  get isAdmin() {
    if (localStorage.getItem('admin') === "true" || false ) {
      this.admin.set(true);
    }
    return this.admin;
  }

  login(username: string, password: string): void {
    this.http
      .post(this.uri + 'login', { username, password })
      .subscribe((data: any) => {
        if (data)
          Object.keys(data).forEach((key) =>
            localStorage.setItem(key, data[key])
          );
        this.isAuthenticated.set(true);
        if (data.name) this.name.set(data.name);
        this.router.navigateByUrl('/land-record');
      });
  }

  logout(): void {
    localStorage.clear();
    this.isAuthenticated.set(false);
    this.name.set('--');
    this.router.navigateByUrl('/login');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
