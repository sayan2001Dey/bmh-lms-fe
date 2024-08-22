import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';

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
export class UserMasterComponent {}
