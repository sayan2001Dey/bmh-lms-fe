import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import {
  Component,
  inject,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
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
import { HttpErrorResponse } from '@angular/common/http';

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
  readonly serverUnreachable: WritableSignal<boolean> = signal(false);
  readonly updateMode: WritableSignal<boolean> = signal(!!this.data);
  readonly passwordVisible: WritableSignal<boolean> = signal(true);
  readonly confirmPasswordVisible: WritableSignal<boolean> = signal(true);

  private readonly passwordMatchValidator: (
    control: AbstractControl
  ) => ValidationErrors | null = (
    control: AbstractControl
  ): ValidationErrors | null => {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordsDontMatch: true };
  };

  private readonly passwordValidators: ((
    control: AbstractControl<any, any>
  ) => ValidationErrors | null)[] = [
    Validators.required,
    Validators.minLength(8),
    this.passwordMatchValidator,
  ];

  userForm: FormGroup<any> = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', this.passwordValidators],
    confirmPassword: ['', this.passwordValidators],
    admin: [false, [Validators.required]],
  });

  get formData(): User {
    return this.userForm.value;
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

    if (this.userForm.value.password !== this.userForm.value.confirmPassword) {
      alert('⛔ ERROR: CAN NOT SUBMIT\n\nPasswords do not match.');
      return;
    }

    this.sysIsBusy.set(true);
    if (this.updateMode()) {
      this.userMasterService
        .updateUser(this.data || '', this.formData)
        .subscribe({
          next: () => {
            this.sysIsBusy.set(false);
            this.dialogRef.close();
          },
          error: (err: HttpErrorResponse) => {
            if (err.status === 0) this.serverUnreachable.set(true);
            else if (err.status === 404)
              alert(
                '⛔ ERROR: CAN NOT SUBMIT\n\nUser not found. Press OK to exit.'
              );
            else
              alert(
                '⛔ ERROR: CAN NOT SUBMIT\n\nFailed to update user. Please try again.'
              );
            this.sysIsBusy.set(false);
          },
        });
    } else {
      this.userMasterService.newUser(this.formData).subscribe({
        next: () => {
          this.sysIsBusy.set(false);
          this.dialogRef.close();
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 0) this.serverUnreachable.set(true);
          else
            alert(
              '⛔ ERROR: CAN NOT SUBMIT\n\nFailed to create user. Please try again.'
            );
          this.sysIsBusy.set(false);
        },
      });
    }
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

  updateModePrep(): void {
    this.updateMode.set(true);
    this.userForm.get('username')?.clearValidators();
    this.userForm.get('username')?.disable();
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('confirmPassword')?.clearValidators();
    this.passwordVisible.set(false);
    this.confirmPasswordVisible.set(false);
  }

  generatePassword(length: number): string {
    let result = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  onGeneratePassword(): void {
    this.userForm.get('password')?.get('type')?.setValue('text');

    this.userForm.get('password')?.setValue(this.generatePassword(8));
    this.userForm.get('confirmPassword')?.setValue('');

    this.userForm.get('password')?.clearValidators();
    this.userForm.get('confirmPassword')?.clearValidators();

    this.userForm.get('password')?.disable();

    this.passwordVisible.set(true);
    this.confirmPasswordVisible.set(false);
  }

  onClickEnablePasswordChange(): void {
    this.userForm.get('password')?.get('type')?.setValue('password');

    this.userForm.get('password')?.setValidators(this.passwordValidators);
    this.userForm
      .get('confirmPassword')
      ?.setValidators(this.passwordValidators);

    this.userForm.get('password')?.enable();
    this.userForm.get('confirmPassword')?.enable();

    this.passwordVisible.set(true);
    this.confirmPasswordVisible.set(true);
  }

  ngOnInit(): void {
    if (!this.data) return;
    this.sysIsBusy.set(true);
    this.updateModePrep();
    this.userMasterService.getUser(this.data).subscribe({
      next: (data: User) => {
        this.userForm.patchValue(data);
        this.sysIsBusy.set(false);
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 404) {
          alert(
            '⛔ ERROR: CAN NOT GET USER DATA\n\nUser not found.\n\nPress OK to exit.'
          );
          this.dialogRef.close();
        } else if (err.status === 0) this.serverUnreachable.set(true);
        else
          alert(
            '⛔ ERROR: CAN NOT GET USER DATA\n\nUnknown error.\n\nFailed to get user data. Please try again.'
          );
        this.sysIsBusy.set(false);
      },
    });
  }
}
