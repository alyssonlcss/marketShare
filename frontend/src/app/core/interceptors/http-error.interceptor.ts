import { Injectable, inject } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { GlobalErrorService } from '../services/global-error.service';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  private readonly globalError = inject(GlobalErrorService);

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        const backendMessage =
          (error.error && (error.error.message || error.error.error || error.error)) || error.message;
        const fallback = 'Ocorreu um erro ao comunicar com o servidor.';
        this.globalError.show(backendMessage || fallback);
        return throwError(() => error);
      }),
    );
  }
}
