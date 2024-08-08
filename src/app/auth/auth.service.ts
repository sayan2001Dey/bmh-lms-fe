import { HttpClient } from '@angular/common/http';
import {
  Injectable,
  WritableSignal,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly uri: string = 'http://127.0.0.1:8081/api/auth/';
  private http: HttpClient = inject(HttpClient);
  private router: Router = inject(Router);

  private authenticated: WritableSignal<boolean> = signal(false);

  get isAuthenticated() {
    if(localStorage.getItem("token")) {
      this.authenticated.set(true);
    }
    return this.authenticated;
  }

  login(username: string, password: string): void {
    this.http
      .post(this.uri + 'login', { username, password })
      .subscribe((data: any) => {
        if(data) Object.keys(data).forEach((key) => localStorage.setItem(key, data[key]));
        this.isAuthenticated.set(true);
        this.router.navigateByUrl('/land-record');
      });
  }

  logout(): void {
    localStorage.clear();
    this.isAuthenticated.set(false);
    this.router.navigateByUrl('/login');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
