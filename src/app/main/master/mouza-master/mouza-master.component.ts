import { Component, signal, WritableSignal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-mouza-master',
  standalone: true,
  imports: [
   MatFormFieldModule,
   MatInputModule,
   ReactiveFormsModule,
   MatDatepickerModule,
   MatSlideToggleModule,
   MatRadioModule,
   MatDividerModule,
   MatListModule,
   MatTableModule,
   MatCardModule,
   MatButton,
   MatIconModule,
   MatSelectModule
  ],
  templateUrl: './mouza-master.component.html',
  styleUrl: './mouza-master.component.scss'
})
export class MouzaMasterComponent {
  readonly viewMode: WritableSignal<boolean> = signal(false);
}
