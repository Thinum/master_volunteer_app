import { Component } from '@angular/core';
import {NavBarComponent} from './shared/components/nav-bar/nav-bar.component';
import {HeaderComponent} from './shared/components/header/header.component';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NavBarComponent, HeaderComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'angular-frontend-new';
}
