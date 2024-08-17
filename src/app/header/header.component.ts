import { Component, Input, OnInit, WritableSignal, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../auth/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule, MatRippleModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  @Input() navState: WritableSignal<boolean> = signal(true);
  readonly authService: AuthService = inject(AuthService);
  readonly loggedIn: WritableSignal<boolean> = this.authService.isAuthenticated;
  readonly name: WritableSignal<string> = this.authService.getName;
  constructor(private router: Router) {}

  get menuEnabled() {
    return this.loggedIn();
  }

  onToggleNav() {
    this.navState.update((state) => !state);
  }

  onLogout() {
    this.authService.logout();
  }

  ngOnInit(): void {
  }
}
