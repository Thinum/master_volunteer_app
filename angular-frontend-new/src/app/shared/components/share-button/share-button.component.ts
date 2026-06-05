import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Clipboard, ClipboardModule } from '@angular/cdk/clipboard';
import { VolunteerService } from '../../../services/api/volunteer.service';
import { firstValueFrom } from 'rxjs';

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

  async share() {
    const url = new URL(window.location.href);
    const segments = url.pathname.split('/');
    let urlToCopy;
    if (segments.includes("profile")){
      urlToCopy = await this.generateProfileUrl(url, segments);
    } else {
      urlToCopy = url.toString();
    }
    if(this.clipboard.copy(urlToCopy)) {
      this.showSnackBar('Link with your ID copied to clipboard!');
    } else {
      this.showSnackBar('Could not copy link to clipboard!');
    }
  }

  private async generateProfileUrl(baseUrl: URL, segments: string[]): Promise<string> {
    const lastPathSegment = segments[segments.length - 1];
    let profileUrl = "";
    if (lastPathSegment == "profile") {
      try {
        const user = await firstValueFrom(this.volunteerService.getCurrentUser());

        profileUrl = baseUrl.toString().concat(`/${user.id}`);
        console.log(profileUrl);

      } catch (err) {
        console.error('Could not get current user', err);
      }
    } else {
      profileUrl = baseUrl.toString()
    }
    return profileUrl;
  }

  private showSnackBar(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }
}
