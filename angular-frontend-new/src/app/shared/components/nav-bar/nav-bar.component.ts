import { Component } from '@angular/core';
import {MatToolbar} from '@angular/material/toolbar';
import {MatIcon} from '@angular/material/icon';
import {MatFabAnchor} from '@angular/material/button';
import {RouterLink, RouterLinkActive} from '@angular/router';

@Component({
  selector: 'app-nav-bar',
  imports: [
    MatToolbar,
    MatIcon,
    MatFabAnchor,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.css'
})
export class NavBarComponent {

}
