import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SyncService } from '../../services/sync.service';
import { ConnectivityService } from '../../services/connectivity.service';
import { FormSubmission } from '../../models/form-submission.model';

@Component({
  selector: 'app-submissions-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './submissions-list.component.html',
  styleUrl: './submissions-list.component.scss'
})
export class SubmissionsListComponent implements OnInit, OnDestroy {
  private readonly sync = inject(SyncService);
  readonly connectivity = inject(ConnectivityService);
  private readonly destroy$ = new Subject<void>();

  submissions = signal<FormSubmission[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.load();
    this.sync.submissionsUpdated$.pipe(takeUntil(this.destroy$)).subscribe(() => this.load());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  load(): void {
    this.loading.set(true);
    this.sync.getSubmissions().subscribe((list) => {
      this.submissions.set(list);
      this.loading.set(false);
    });
  }
}
