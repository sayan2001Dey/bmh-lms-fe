import { HttpClient } from '@angular/common/http';
import { Injectable, WritableSignal, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { apiUrl } from '../config/api.config';
import { User } from '../model/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly uri: string = apiUrl + 'auth/';
  private readonly http: HttpClient = inject(HttpClient);
  private readonly router: Router = inject(Router);

  private readonly authenticated: WritableSignal<boolean> = signal(false);
  private readonly name: WritableSignal<string> = signal('--');
  private readonly admin: WritableSignal<boolean> = signal(false);
  private readonly username: WritableSignal<string> = signal('');

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
    if (localStorage.getItem('admin') === 'true' || false) {
      this.admin.set(true);
    }
    return this.admin;
  }

  get getUsername() {
    const username = localStorage.getItem('username');
    this.username.set(username || '');
    if (username == '') this.logout();
    return this.username;
  }

  setUser(data: any): void {
    Object.keys(data).forEach((key) => localStorage.setItem(key, data[key]));
    localStorage.setItem('navState', 'true');
    this.isAuthenticated.set(true);
    this.admin.set(data.admin);
    if (data.name) this.name.set(data.name);
    if (data.username) this.username.set(data.username);
  }

  login(username: string, password: string): void {
    this.http
      .post(this.uri + 'login', { username, password })
      .subscribe((data: any) => {
        if (data) this.setUser(data);
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
