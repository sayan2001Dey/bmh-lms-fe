import { Component } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-group-master',
  standalone: true,
  imports: [
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    RouterLink,
    MatInputModule,
    MatIconModule,
    MatDividerModule,
    ReactiveFormsModule,
  ],
  templateUrl: './group-master.component.html',
  styleUrl: './group-master.component.scss'
})
export class GroupMasterComponent {
listMode: any;
viewMode() {
throw new Error('Method not implemented.');
}
companyForm: FormGroup<any> | undefined;
onSubmit() {
throw new Error('Method not implemented.');
}
id() {
throw new Error('Method not implemented.');
}
updateMode() {
throw new Error('Method not implemented.');
}
companyList() {
throw new Error('Method not implemented.');
}
displayedColumns() {
throw new Error('Method not implemented.');
}
onDeleteCompany: any;
onUpdateCompany(arg0: any) {
throw new Error('Method not implemented.');
}

}
