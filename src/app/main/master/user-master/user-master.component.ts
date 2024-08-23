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
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UserMasterService } from './user-master.service';
import { Dialog } from '@angular/cdk/dialog';
import { DialogUserComponent } from './modal/user/user.dialog';
import { User } from '../../../model/user.model';

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
  private readonly dialog: Dialog = inject(Dialog);
  userList: WritableSignal<any[]> = signal([]);
  displayedColumns: WritableSignal<string[]> = signal([
    'slno',
    'name',
    'username',
    'admin',
    'action',
  ]);

  onNewUser(): void {
    const dialogRef = this.dialog.open<DialogUserComponent>(DialogUserComponent, {
      maxWidth: '25rem',
      backdropClass: 'light-blur-backdrop',
      disableClose: true,
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
      this.userMasterService.getUserList().subscribe((data) => {
        console.log(data);
        this.userList.set(data);
      });
    });
  }

  onUpdateUser(username: string): void {
    const dialogRef = this.dialog.open<DialogUserComponent>(DialogUserComponent, {
      maxWidth: '25rem',
      backdropClass: 'light-blur-backdrop',
      disableClose: true,
      data: username,
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
      this.userMasterService.getUserList().subscribe((data) => {
        console.log(data);
        this.userList.set(data);
      });
    });
  }

  onDeleteUser(username: string) {
    throw new Error('Method not implemented.');
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
    this.userMasterService.getUserList().subscribe((data) => {
      console.log(data);
      this.userList.set(data);
    });
  }
}
