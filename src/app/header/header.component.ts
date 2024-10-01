import {
  Component,
  EffectRef,
  Input,
  OnDestroy,
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
import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { DialogUserComponent } from '../main/master/components/user-master/modal/user/user.dialog';
import { UserMasterService } from '../main/master/services/user-master.service';
import { User } from '../model/user.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule, MatRippleModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnDestroy {
  @Input() navState: WritableSignal<boolean> = signal(true);
  private readonly dialog: Dialog = inject(Dialog);
  private readonly authService: AuthService = inject(AuthService);
  private readonly userMasterService: UserMasterService =
    inject(UserMasterService);
  readonly sysIsBusy: WritableSignal<boolean> = signal(false);
  readonly serverUnreachable: WritableSignal<boolean> = signal(false);
  readonly loggedIn: WritableSignal<boolean> = this.authService.isAuthenticated;
  readonly name: WritableSignal<string> = this.authService.getName;
  readonly username: WritableSignal<string> = this.authService.getUsername;
  readonly router: Router = inject(Router);
  private readonly navStateEffect: EffectRef = effect(() => {
    if (this.loggedIn())
      untracked(() =>
        this.navState.set(
          localStorage.getItem('navState') === 'true' ? true : false
        )
      );
    else untracked(() => this.navState.set(false));
  });

  get menuEnabled() {
    return this.loggedIn();
  }

  onToggleNav() {
    this.navState.update((state) => !state);
  }

  onLogout() {
    this.authService.logout();
  }

  onEditProfile() {
    const dialogRef: DialogRef<DialogUserComponent> =
      this.dialog.open<DialogUserComponent>(DialogUserComponent, {
        maxWidth: '25rem',
        backdropClass: 'light-blur-backdrop',
        disableClose: true,
        data: this.username(),
      });

    dialogRef.backdropClick.subscribe(() => {
      if (
        window.confirm(
          '⚠ CAUTION: ALL CHANGES WILL BE LOST!\n\nDo you really want to leave?'
        )
      )
        dialogRef.close();
    });

    dialogRef.closed.subscribe(() => {
      this.sysIsBusy.set(true);
      if (!this.authService.isAdmin()) return;

      this.userMasterService.getUser(this.username()).subscribe({
        next: (data: User) => {
          if (data) this.authService.setUser(data);
          else
            alert(
              '⛔ ERROR: CAN NOT GET USER DATA\n\nUnknown error.\n\nFailed to get user data. Please login again.'
            );
          this.sysIsBusy.set(false);
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 404) {
            alert(
              '⛔ ERROR: CAN NOT GET USER DATA\n\nUser not found.\n\nYou will be logged out.'
            );
            this.onLogout();
          } else if (err.status === 401) this.onLogout();
          else if (err.status === 0) this.serverUnreachable.set(true);
          else
            alert(
              '⛔ ERROR: CAN NOT GET USER DATA\n\nUnknown error.\n\nFailed to get user data. Please login again.'
            );
          this.sysIsBusy.set(false);
        },
      });
    });
  }

  ngOnDestroy(): void {
    this.navStateEffect.destroy();
  }
}
