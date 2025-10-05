import { Component } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Project} from '../../../models/project.model';
import {ProjectService} from '../../../services/api/project.service';
import {DatePipe, NgForOf, NgIf} from '@angular/common';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle
} from '@angular/material/expansion';
import {MatButton} from '@angular/material/button';
import {MatCard, MatCardActions, MatCardSubtitle, MatCardTitle} from '@angular/material/card';
import {MatChip, MatChipListbox} from '@angular/material/chips';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';

@Component({
  selector: 'app-project-detail',
  imports: [
    MatCard,
    MatIcon,
  ],
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.css'
})
export class ProjectDetailComponent {
  protected detailedProject?: Project;
  private id?: number | null;
  constructor(private route: ActivatedRoute, private projectService: ProjectService) {

  }

  ngOnInit() {
    this.id = parseInt(this.route.snapshot.paramMap.get('id') ?? '-1');
    if(this.id) {
      this.projectService.getProjectById(this.id).subscribe(project => this.detailedProject = project);
    }
  }
}
