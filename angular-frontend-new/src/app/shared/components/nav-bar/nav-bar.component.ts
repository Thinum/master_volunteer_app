import { NgIf } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { MatToolbar } from '@angular/material/toolbar';
import { MatIcon } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { OrganisationAdminAssignmentService } from '../../../services/api/organisation-admin-assignment.service';

@Component({
  selector: 'app-nav-bar',
  imports: [
    MatToolbar,
    MatIcon,
    NgIf,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.css'
})
export class NavBarComponent implements OnInit {
  hasPlatformAdminAccess = false;
  isMobileMenuOpen = false;

  constructor(private readonly assignmentService: OrganisationAdminAssignmentService) {}

  ngOnInit(): void {
    this.assignmentService.hasAccess().subscribe({
      next: hasAccess => this.hasPlatformAdminAccess = hasAccess,
      error: () => this.hasPlatformAdminAccess = false
    });
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeMobileMenu();
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth > 600) {
      this.closeMobileMenu();
    }
  }
}
