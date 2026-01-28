import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { FormSubmission, FormSubmissionPayload } from '../models/form-submission.model';

const API_URL = 'https://jsonplaceholder.typicode.com';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  submitForm(payload: FormSubmissionPayload): Observable<{ id: number }> {
    return this.http
      .post<{ id: number }>(`${API_URL}/posts`, {
        title: payload.title,
        body: payload.body,
        userId: payload.userId ?? 1
      })
      .pipe(
        catchError((err) => {
          console.error('API submit error', err);
          return throwError(() => err);
        })
      );
  }

  /** Mimic syncing: POST and return success. Images are not sent to JSONPlaceholder. */
  syncSubmission(submission: FormSubmission): Observable<boolean> {
    const payload: FormSubmissionPayload = {
      title: submission.title,
      body: submission.body,
      userId: 1
    };
    return this.submitForm(payload).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }
}
