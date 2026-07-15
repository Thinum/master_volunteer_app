import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class ErrorService {
  constructor(private snackBar: MatSnackBar) {}

  showError(message: string): void {
    const displayMessage = this.toDisplayMessage(message);

    this.snackBar.open(displayMessage, 'Close', {
      duration: 6000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      politeness: 'assertive',
      announcementMessage: displayMessage,
      panelClass: ['error-snackbar']
    });
  }

  private toDisplayMessage(message: string): string {
    const fallback = 'Something went wrong. Please try again.';

    if (!message?.trim()) {
      return fallback;
    }

    const firstLine = message
      .replace(/^uncaught(?: \(in promise\))?:?\s*/i, '')
      .replace(/^error:\s*/i, '')
      .split(/\r?\n|\s+at\s+/)[0]
      .trim();

    // Angular error codes and stack traces are useful in the console, not to users.
    if (!firstLine || /^NG\d{4,}:/.test(firstLine)) {
      return fallback;
    }

    const maxLength = 180;
    return firstLine.length > maxLength
      ? `${firstLine.slice(0, maxLength - 1).replace(/\s+$/, '')}…`
      : firstLine;
  }
}
