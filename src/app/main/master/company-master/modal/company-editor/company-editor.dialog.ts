import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { Component, inject, signal, WritableSignal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Company } from '../../../../../model/company.model';

@Component({
  selector: 'dialog-company',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatIconButton,
    MatDividerModule,
    ReactiveFormsModule,
  ],
  templateUrl: './company-editor.dialog.html',
  styleUrl: './company-editor.dialog.scss',
})
export class DialogCompanyEditorComponent {
  private readonly fb: FormBuilder = inject(FormBuilder);
  readonly dialogRef: DialogRef = inject(DialogRef);

  data: string | undefined = inject(DIALOG_DATA);

  readonly sysIsBusy: WritableSignal<boolean> = signal(true);
  readonly serverUnreachable: WritableSignal<boolean> = signal(false);

  readonly updateMode: WritableSignal<boolean> = signal(!!this.data);

  companyForm: FormGroup<any> = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    username: ['', [Validators.required, Validators.minLength(3)]],
    admin: [false, [Validators.required]],
  });

  get formData(): Company {
    return this.companyForm.value;
  }

  onSubmit(): void {
    this.dialogRef.close();
  }
  
  /**
   *  Closes the dialog.
   *
   *  @return {void} No return value.
   */
  onCancel() {
    this.dialogRef.close();
    this.sysIsBusy.set(false);
  }
}
