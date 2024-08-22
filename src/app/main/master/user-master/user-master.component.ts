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

  onNewUser(): void {}

  onUpdateUser(): void {}

  ngOnInit() {
    console.log(this.route.children);
    if (this.route.children[0])
      this.route.children[0].url.subscribe((data) => {
        console.log(data);
        if (data[0].path == 'new') {
          console.log('new');
        } else if (data[0].path == 'update') {
          console.log('update');
          this.route.children[0].params.subscribe((data) => {
            console.log(data['id']);
          })
        }
      });
    this.userMasterService.getUserList().subscribe((data) => {
      console.log(data);
      this.userList.set(data);
    });
  }
}
