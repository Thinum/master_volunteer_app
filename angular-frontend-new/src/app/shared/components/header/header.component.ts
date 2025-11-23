import {Component, Input, OnInit} from '@angular/core';
import {MatToolbar} from '@angular/material/toolbar';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {filter, map} from 'rxjs';
import {NotificationBarComponent} from '../notification-bar/notification-bar.component';
import {AuthService} from '../../../services/authservice/auth.service';

@Component({
  selector: 'app-header',
  imports: [
    MatToolbar,
    NotificationBarComponent
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit{
  @Input() title : string = ""
  constructor(
    private router: Router, private authService: AuthService
  ) {}

  ngOnInit(){
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => {
          let route: ActivatedRoute = this.router.routerState.root;
          let routeTitle = '';
          while (route!.firstChild) {
            route = route.firstChild;
          }
          if (route.snapshot.data['title']) {
            routeTitle = route!.snapshot.data['title'];
          }
          return routeTitle;
        })
      )
      .subscribe((title: string) => {
        if (title) {
          this.title = title
        }
      });
  }

  public shouldDisplayNotifications(): boolean{
    return this.authService.isAuthenticated()
  }
}
