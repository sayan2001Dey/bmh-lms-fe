import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  Injectable,
  OnInit,
  PLATFORM_ID,
  WritableSignal,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnInit {
  private readonly uri: string = 'http://127.0.0.1:8081/api/';
  private http: HttpClient = inject(HttpClient);
  private router: Router = inject(Router);
  private platformId: Object = inject(PLATFORM_ID);

  private authenticated: WritableSignal<boolean> = signal(false);

  get isAuthenticated() {
    if(isPlatformBrowser(this.platformId) && localStorage.getItem("login")) {
      this.authenticated.set(true);
    }
    return this.authenticated;
  }

  login(email: string, password: string): void {
    this.http
      .post(this.uri + 'login', { email, password })
      .subscribe((data) => {
        console.log(data);
        localStorage.setItem('login', 'true');
        this.isAuthenticated.set(true);
        this.router.navigateByUrl('/land-record');
      });
  }

  register(name: string, email: string, password: string): void {
    this.http
      .post(this.uri + 'register', { name, email, password })
      .subscribe((data) => {
        console.log(data);
        this.router.navigateByUrl('/login');
      });
  }

  logout(): void {
    localStorage.clear();
    this.isAuthenticated.set(false);
    this.router.navigateByUrl('/login');
  }

  ngOnInit(): void {
  }
}
