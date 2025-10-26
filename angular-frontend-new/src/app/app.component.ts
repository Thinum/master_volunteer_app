import {Component, computed, Signal, signal} from '@angular/core';
import {NavBarComponent} from './shared/components/nav-bar/nav-bar.component';
import {HeaderComponent} from './shared/components/header/header.component';
import {RouterOutlet} from '@angular/router';
import {LayoutingService} from './services/layouting.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NavBarComponent, HeaderComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'angular-frontend-new';
  protected showBottomNavbar: Signal<boolean> = signal(true);

  constructor(layoutingService: LayoutingService) {
    this.showBottomNavbar = computed(() => {
      return layoutingService.showBottomNavbar()
    });
  }
}
