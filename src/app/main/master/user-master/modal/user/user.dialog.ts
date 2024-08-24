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
import { AuthService } from '../../../../../auth/auth.service';

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
  private readonly authService: AuthService = inject(AuthService);
  data: string | undefined = inject(DIALOG_DATA);

  readonly sysIsBusy: WritableSignal<boolean> = signal(true);
  readonly serverUnreachable: WritableSignal<boolean> = signal(false);
  readonly updateMode: WritableSignal<boolean> = signal(!!this.data);
  readonly normieMode: WritableSignal<boolean> = signal(
    !this.authService.isAdmin()
  );
  readonly passwordVisible: WritableSignal<boolean> = signal(true);
  readonly confirmPasswordVisible: WritableSignal<boolean> = signal(true);
  readonly generatePasswordBtnVisible: WritableSignal<boolean> = signal(true);
  readonly changePasswordBtnVisible: WritableSignal<boolean> = signal(false);
  readonly passwordFieldType: WritableSignal<'password' | 'text'> =
    signal('password');
  readonly passwordGenerated: WritableSignal<boolean> = signal(false);

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
    if (this.normieMode()) {
      if (
        this.confirmPasswordVisible() &&
        this.userForm.value.password !== this.userForm.value.confirmPassword
      ) {
        alert('⛔ ERROR: CAN NOT SUBMIT\n\nPasswords do not match.');
        return;
      }
      if(this.passwordGenerated()){
        if(!confirm(
          '⚠ CAUTION: PASSWORD WILL BE CHANGED AND YOU WILL BE LOGGED OUT!\n\nAre you sure?'
        ))
          return;
      }
      this.sysIsBusy.set(true);
      //TODO: change password request after that logout too.
      return;
    }

    if (!this.userForm.valid) {
      alert(
        '⛔ ERROR: CAN NOT SUBMIT\n\nInvalid form data. Please check and try again'
      );
      return;
    }

    if (
      this.confirmPasswordVisible() &&
      this.userForm.value.password !== this.userForm.value.confirmPassword
    ) {
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

    this.onClickDisablePasswordChange();

    this.changePasswordBtnVisible.set(true);
    this.generatePasswordBtnVisible.set(false);
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
    this.passwordFieldType.set('text');
    this.passwordGenerated.set(true);

    this.userForm.get('password')?.clearValidators();
    this.userForm.get('confirmPassword')?.clearValidators();
    
    this.userForm.get('password')?.setValue(this.generatePassword(8));
    this.userForm.get('confirmPassword')?.setValue('');

    this.userForm.get('password')?.disable();

    this.passwordVisible.set(true);
    this.confirmPasswordVisible.set(false);
  }

  onClickEditPassword(): void {
    this.passwordGenerated.set(false);
    this.onClickEnablePasswordChange();
  }

  onClickEnablePasswordChange(): void {
    this.passwordFieldType.set('password');

    this.userForm.get('password')?.setValidators(this.passwordValidators);
    this.userForm
      .get('confirmPassword')
      ?.setValidators(this.passwordValidators);

    this.userForm.get('password')?.enable();
    this.userForm.get('confirmPassword')?.enable();

    this.passwordVisible.set(true);
    this.confirmPasswordVisible.set(true);

    this.changePasswordBtnVisible.set(false);
    this.generatePasswordBtnVisible.set(true);
  }

  onClickDisablePasswordChange(): void {
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('confirmPassword')?.clearValidators();

    this.userForm.get('password')?.setValue('');
    this.userForm.get('confirmPassword')?.setValue('');

    this.passwordVisible.set(false);
    this.confirmPasswordVisible.set(false);

    this.changePasswordBtnVisible.set(true);
    this.generatePasswordBtnVisible.set(false);
  }

  ngOnInit(): void {
    if (!this.data) return;
    this.sysIsBusy.set(true);
    this.updateModePrep();
    if (this.data === this.authService.getUsername())
      this.userForm.get('admin')?.disable();
    if (this.normieMode()) {
      this.userForm.get('name')?.disable();
      this.userForm.get('name')?.setValue(this.authService.getName());
      this.userForm.get('username')?.disable();
      this.userForm.get('username')?.setValue(this.data);    
      this.passwordVisible.set(true);
      this.confirmPasswordVisible.set(true);
      return;
    }
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
