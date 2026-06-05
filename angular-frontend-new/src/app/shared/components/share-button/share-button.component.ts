import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Clipboard, ClipboardModule } from '@angular/cdk/clipboard';
import { VolunteerService } from '../../../services/api/volunteer.service';

@Component({
  selector: 'app-share-button',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    ClipboardModule
  ],
  templateUrl: './share-button.component.html',
  styleUrl: './share-button.component.css'
})
export class ShareButtonComponent {
  constructor(
    private volunteerService: VolunteerService,
    private clipboard: Clipboard,
    private snackBar: MatSnackBar
  ) {}

  share() {
    this.volunteerService.getCurrentUser().subscribe({
      next: (user) => {
        const url = new URL(window.location.href);
        // Add user ID to the current URL
        url.searchParams.set('userId', user.id.toString());
        const sharedUrl = url.toString();

        if (this.clipboard.copy(sharedUrl)) {
          this.showSnackBar('Link with your ID copied to clipboard!');
        }
      },
      error: (err) => {
        console.error('Could not get current user', err);
        // Fallback: share current URL without user ID
        if (this.clipboard.copy(window.location.href)) {
          this.showSnackBar('Link copied to clipboard!');
        }
      }
    });
  }

  private showSnackBar(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }
}
