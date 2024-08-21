import { Component, inject, Input, signal, WritableSignal } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatListModule } from '@angular/material/list';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [MatListModule, MatRippleModule, RouterLink, RouterLinkActive],
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.scss',
})
export class SideNavComponent {
  @Input() navState: WritableSignal<boolean> = signal(true);
  isAdmin: WritableSignal<boolean> = inject(AuthService).isAdmin;
}