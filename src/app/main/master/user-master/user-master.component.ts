import {
  Component,
  inject,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserMasterService } from './user-master.service';
import { Dialog } from '@angular/cdk/dialog';
import { DialogUserComponent } from './modal/user/user.dialog';
import { User } from '../../../model/user.model';
import { sys } from 'typescript';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-user-master',
  standalone: true,
  imports: [
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    RouterLink,
  ],
  templateUrl: './user-master.component.html',
  styleUrl: './user-master.component.scss',
})
export class UserMasterComponent implements OnInit {
  private readonly userMasterService: UserMasterService =
    inject(UserMasterService);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly username: WritableSignal<string> =
    inject(AuthService).getUsername;
  private readonly dialog: Dialog = inject(Dialog);
  private readonly router: Router = inject(Router);
  readonly sysIsBusy: WritableSignal<boolean> = signal(true);
  readonly serverUnreachable: WritableSignal<boolean> = signal(false);
  userList: WritableSignal<User[]> = signal([]);
  displayedColumns: WritableSignal<string[]> = signal([
    'slno',
    'name',
    'username',
    'admin',
    'action',
  ]);

  getUserList(): void {
    this.userMasterService.getUserList().subscribe({
      next: (data) => {
        this.userList.set(
          data.filter((user) => user.username !== this.username())
        );
        this.sysIsBusy.set(false);
      },
      error: () => {
        this.sysIsBusy.set(false);
        this.serverUnreachable.set(true);
      },
    });
  }

  onNewUser(): void {
    const dialogRef = this.dialog.open<DialogUserComponent>(
      DialogUserComponent,
      {
        maxWidth: '25rem',
        backdropClass: 'light-blur-backdrop',
        disableClose: true,
      }
    );

    dialogRef.backdropClick.subscribe(() => {
      if (
        window.confirm(
          '⚠ CAUTION: ALL CHANGES WILL BE LOST!\n\nDo you really want to leave?'
        )
      )
        dialogRef.close();
    });

    dialogRef.closed.subscribe(() => {
      this.router.navigate(['master', 'user']);
      this.getUserList();
    });
  }

  onUpdateUser(username: string): void {
    const dialogRef = this.dialog.open<DialogUserComponent>(
      DialogUserComponent,
      {
        maxWidth: '25rem',
        backdropClass: 'light-blur-backdrop',
        disableClose: true,
        data: username,
      }
    );

    dialogRef.backdropClick.subscribe(() => {
      if (
        window.confirm(
          '⚠ CAUTION: ALL CHANGES WILL BE LOST!\n\nDo you really want to leave?'
        )
      )
        dialogRef.close();
    });

    dialogRef.closed.subscribe(() => {
      this.router.navigate(['master', 'user']);
      this.getUserList();
    });
  }

  onDeleteUser(username: string) {
    if (
      window.confirm(
        '⚠ CAUTION: ACTION CANNOT BE UNDONE!\n\nDo you really want to delete this user?'
      )
    ) {
      this.userMasterService.deleteUser(username).subscribe({
        next: () => this.getUserList(),
        error: (err: HttpErrorResponse) => {
          if (err.status === 404) {
            alert('⛔ ERROR: CAN NOT DELETE\n\nUser not found.');
          } else {
            alert(
              '⛔ ERROR: CAN NOT DELETE\n\nFailed to delete user. Please try again.'
            );
          }
        },
      });
    }
  }

  ngOnInit() {
    console.log(this.route.children);
    if (this.route.children[0])
      this.route.children[0].url.subscribe((data) => {
        if (data[0].path == 'new') {
          this.onNewUser();
        } else if (data[0].path == 'update') {
          console.log('update');
          this.route.children[0].params.subscribe((data) => {
            this.onUpdateUser(data['id']);
          });
        }
      });
    this.getUserList();
  }
}
