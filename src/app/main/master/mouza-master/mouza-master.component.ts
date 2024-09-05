import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
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
   MatButton

  ],
  templateUrl: './mouza-master.component.html',
  styleUrl: './mouza-master.component.scss'
})
export class MouzaMasterComponent {


}
