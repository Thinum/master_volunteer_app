import { ErrorHandler, Injectable, NgZone } from '@angular/core';
import { ErrorService } from './error.service';

@Injectable()
export class GlobalErrorHandlerService implements ErrorHandler {
  constructor(
    private errorService: ErrorService,
    private ngZone: NgZone
  ) {}

  handleError(error: any): void {
    // Log to console for debugging
    console.error('Global error caught:', error);

    // Use NgZone so UI updates even outside Angular context
    this.ngZone.run(() => {
      this.errorService.showError(
        this.getErrorMessage(error)
      );
    });
  }

  private getErrorMessage(error: any): string {
    if (error?.message) return error.message;
    if (typeof error === 'string') return error;
    return 'An unexpected error occurred';
  }
}
