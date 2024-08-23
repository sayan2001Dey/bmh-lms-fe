import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import {
  Component,
  Inject,
  inject,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { User } from '../../../../../model/user.model';
import { MatRadioModule } from '@angular/material/radio';

@Component({
  selector: 'dialog-user',
  standalone: true,
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatRadioModule,
    MatInputModule,
    MatButton,
    MatIconModule,
    MatIconButton,
    ReactiveFormsModule,
  ],
  templateUrl: './user.dialog.html',
  styleUrl: './user.dialog.scss',
})
export class DialogUserComponent implements OnInit {
  fb: FormBuilder = inject(FormBuilder);
  sysIsBusy: WritableSignal<boolean> = signal(false);
  userForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    admin: [false, [Validators.required]],
  });
  data: User;
  readonly isUpdate: boolean;

  constructor(
    public dialogRef: DialogRef<string>,
    @Inject(DIALOG_DATA)
    public input: {
      data?: User;
    }
  ) {
    this.data = input.data
      ? { ...input.data }
      : { name: '', username: '', password: '', admin: false };
    this.isUpdate = !!input.data;
  }

  /**
   * Submits the user if they are valid and the sold quantity is not zero.
   *
   * @return {void}
   */
  onSubmit(): void {
    if (!this.userForm.valid) {
      alert(
        '⛔ ERROR: CAN NOT SUBMIT\n\nInvalid form data. Please check and try again'
      );
      return;
    }
    this.dialogRef.close({
      ...this.data,
      ...this.userForm.value,
    });
  }

  /**
   *  Closes the dialog.
   *
   *  @return {void} No return value.
   */
  onCancel() {
    this.dialogRef.close();
  }

  ngOnInit(): void {
    if (this.data)
      this.userForm.patchValue({
        ...this.data,
      });
  }
}
