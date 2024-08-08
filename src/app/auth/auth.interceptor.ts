import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from './auth.service';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService: AuthService = inject(AuthService);
  const router: Router = inject(Router);
  const token = authService.getToken();

  if (token)
    req = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`),
    });

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) authService.logout();
      return throwError(() => error);
    })
  );
};
