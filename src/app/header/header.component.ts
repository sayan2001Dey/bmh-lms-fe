import { Component, WritableSignal, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, MatButtonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  currentUrl: WritableSignal<string> = signal('');
  loggedIn: WritableSignal<boolean> = inject(AuthService).isAuthenticated;
  authService: AuthService = inject(AuthService);

  constructor(private router: Router) {}

  onLogout() {
    this.authService.logout();
  }
}
