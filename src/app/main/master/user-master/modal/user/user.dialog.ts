import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import {
  Component,
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
import { MatDividerModule } from '@angular/material/divider';
import { UserMasterService } from '../../user-master.service';

@Component({
  selector: 'dialog-user',
  standalone: true,
  imports: [
    MatCardModule,
    MatDividerModule,
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
  private readonly fb: FormBuilder = inject(FormBuilder);
  readonly dialogRef: DialogRef = inject(DialogRef);
  private readonly userMasterService: UserMasterService =
    inject(UserMasterService);
  data: string | undefined = inject(DIALOG_DATA);

  readonly sysIsBusy: WritableSignal<boolean> = signal(true);
  readonly updateMode: WritableSignal<boolean> = signal(false);

  userForm: FormGroup<any> = this.fb.group({
    name: ['', Validators.required, Validators.minLength(3)],
    username: ['', Validators.required, Validators.minLength(3)],
    password: ['', Validators.required, Validators.minLength(8)],
    confirmPassword: ['', Validators.required, Validators.minLength(8)],
    admin: [false, Validators.required],
  });

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

    if (this.userForm.value.password !== this.userForm.value.confirmPassword) {
      alert('⛔ ERROR: CAN NOT SUBMIT\n\nPasswords do not match.');
      return;
    }

    this.sysIsBusy.set(true);
    if (this.updateMode()) {
    }
    this.userMasterService.newUser(this.userForm.value).subscribe({
      next: () => {
        this.sysIsBusy.set(false);
        this.dialogRef.close();
      },
      error: () => {
        alert(
          '⛔ ERROR: CAN NOT SUBMIT\n\nFailed to create user. Please try again.'
        );
        this.sysIsBusy.set(false);
      },
    });
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

  ngOnInit(): void {
    // if (this.data)
      
  }
}
