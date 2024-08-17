import {
  Component,
  Input,
  OnInit,
  WritableSignal,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
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
export class HeaderComponent {
  @Input() navState: WritableSignal<boolean> = signal(true);
  readonly authService: AuthService = inject(AuthService);
  readonly loggedIn: WritableSignal<boolean> = this.authService.isAuthenticated;
  readonly name: WritableSignal<string> = this.authService.getName;
  readonly router: Router = inject(Router);

  constructor() {
    effect(() => {
      if (this.loggedIn()) untracked(() => this.navState.set(true));
      else untracked(() => this.navState.set(false));
    });
  }
  get menuEnabled() {
    return this.loggedIn();
  }

  onToggleNav() {
    this.navState.update((state) => !state);
  }

  onLogout() {
    this.authService.logout();
  }
}
