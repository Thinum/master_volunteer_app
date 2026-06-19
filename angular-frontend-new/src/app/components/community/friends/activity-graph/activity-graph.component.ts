import { AfterViewInit, Component, ElementRef, ViewChild, OnDestroy, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import cytoscape from 'cytoscape';
import { forkJoin } from 'rxjs';

import { MOCK_USERS } from '../../../../mock/mock-users';
import { MOCK_ACTIVITIES } from '../../../../mock/mock-activities';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ActivityService } from '../../../../services/api/activity.service';
import { VolunteerService } from '../../../../services/api/volunteer.service';
import { User } from '../../../../models/user.model';
import { Activity } from '../../../../models/activity.model';

@Component({
  selector: 'app-activity-graph',
  standalone: true,
  template: `
  <div class="legend">
    <div class="legend-title">Filter Activities</div>
    <div class="legend-items">
      <div class="legend-item" *ngFor="let act of activities" (click)="toggleActivity(act.id)" tabindex="0" (keydown.enter)="toggleActivity(act.id)">
        <input type="checkbox" [checked]="selectedActivities.has(act.id)" (click)="$event.stopPropagation(); toggleActivity(act.id)" class="checkbox-input" />
        <span class="legend-color" [style.background]="getActivityColor(act.id)"></span>
        <span class="legend-label">{{ act.title }}</span>
      </div>
    </div>
  </div>

  <div #cyContainer class="cy-container"></div>
  `,
  styles: [`
    .cy-container {
      width: 100%;
      height: 500px;
      border-radius: 12px;
      background: transparent;
      padding: 16px;
    }

    /* Contextual Surface */
    .legend {
      padding: 16px;
      margin: 0 auto 16px auto; /* centers horizontally */
      background-color: #E7EDFF;
      border-radius: 12px;
      max-width: 450px;

      box-shadow: 0 20px 40px rgba(47, 50, 58, 0.06);

      font-family: 'Inter', sans-serif;

      text-align: left; /* keeps content left-aligned */
    }

    /* Typography hierarchy */
    .legend-title {
      font-family: 'Manrope', sans-serif;
      font-size: 1.125rem; /* title-md */
      font-weight: 600;
      color: #2f323a; /* on_surface */
      margin-bottom: 12px;
    }

    /* Editorial spacing instead of dividers */
    .legend-items {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    /* Softer alignment */
    .legend-item {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;

      padding: 6px 8px;
      border-radius: 8px;

      /* subtle tonal hover layer (optional) */
      transition: background 0.2s ease;
    }

    .legend-item:hover {
      background: #f3f3fa; /* surface-container-low */
    }

    .checkbox-input {
      cursor: pointer;
    }

    /* Color block */
    .legend-color {
      width: 18px;
      height: 18px;
      border-radius: 6px;

      /* Ghost border fallback */
      outline: 1px solid rgba(175, 178, 187, 0.15);
    }

    /* Label styling */
    .legend-label {
      font-size: 0.875rem;
      color: #5c5f68; /* on_surface_variant */
    }
  `],
  imports: [CommonModule]
})
export class ActivityGraphComponent implements AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('cyContainer', { static: true }) cyContainer!: ElementRef;
  @Input() userId = 1;

  activities: Activity[] = [];
  selectedActivities = new Set<number>();

  private loadedUsers: User[] = [];
  private animationRunning = false;
  private nodeAnimations = new Map<string, boolean>();
  private cy!: cytoscape.Core;
  private activeLayout?: cytoscape.Layouts;
  private router = inject(Router);
  private activityService = inject(ActivityService);
  private volunteerService = inject(VolunteerService);

  // Distinct colors for different activities
  private activityColors: string[] = [
    '#e63946', // Red
    '#2a9d8f', // Teal
    '#457b9d', // Steel Blue
    '#e76f51', // Terracotta
    '#4cc9f0', // Sky Blue
    '#9b5de5', // Purple
    '#f15bb5', // Pink
    '#00bbf9', // Bright Blue
    '#00f5d4', // Mint
    '#ff007f'  // Magenta
  ];

  getActivityColor(id: number): string {
    return this.activityColors[id % this.activityColors.length];
  }

  toggleActivity(id: number): void {
    if (this.selectedActivities.has(id)) {
      this.selectedActivities.delete(id);
    } else {
      this.selectedActivities.add(id);
    }
    this.rebuildCytoscapeElements();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initWhenVisible();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userId'] && !changes['userId'].firstChange) {
      this.fetchDataAndRebuild();
    }
  }

  private initWhenVisible(): void {
    const el = this.cyContainer.nativeElement;

    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      setTimeout(() => this.initWhenVisible(), 100);
      return;
    }

    this.initGraph();
  }

  private initGraph(): void {
    forkJoin({
      activities: this.activityService.getActivitiesByUserParticipation(this.userId),
      users: this.volunteerService.getAllVolunteers()
    }).subscribe({
      next: ({ activities, users }) => {
        this.activities = activities;
        this.loadedUsers = users;
        this.selectedActivities = new Set<number>(activities.map(a => a.id));

        const elements = this.getGraphElements();
        this.createCytoscapeGraph(elements);
      },
      error: (err) => {
        console.warn('Failed to load activities from API, falling back to mock data', err);
        const mockPart = MOCK_ACTIVITIES.filter(act => {
          const participants = act.participants || [];
          return participants.some(p => p.id === this.userId);
        });
        this.activities = mockPart;
        this.loadedUsers = MOCK_USERS;
        this.selectedActivities = new Set<number>(mockPart.map(a => a.id));

        const elements = this.getGraphElements();
        this.createCytoscapeGraph(elements);
      }
    });
  }

  private createCytoscapeGraph(elements: cytoscape.ElementDefinition[]): void {
    this.cy = cytoscape({
      container: this.cyContainer.nativeElement,
      elements: elements,
      style: [
        //
        // --- NODE STYLE ---
        //
        {
          selector: 'node',
          style: {
            'shape': 'ellipse',
            'width': 60,
            'height': 60,
            'border-width': 2,
            'border-color': '#666',
            'label': 'data(label)',
            'font-size': 12,
            'color': '#333',
            'text-valign': 'bottom',
            'text-margin-y': 8,
            'background-color': '#ccc'
          }
        },
        {
          selector: 'node[avatar]',
          style: {
            'background-image': 'data(avatar)',
            'background-fit': 'cover',
            'background-repeat': 'no-repeat',
            'background-clip': 'node',
            'background-opacity': 1,
            'background-image-crossorigin': 'anonymous',
          }
        },

        //
        // --- EDGE STYLE ---
        //
        {
          selector: 'edge',
          style: {
            'curve-style': 'bezier',
            'line-color': 'data(color)',
            'width': 4,
            'label': 'data(activityTitle)',
            'font-size': 10,
            'text-rotation': 'autorotate',
            'text-background-opacity': 0.8,
            'text-background-color': '#ffffff',
            'text-background-padding': '3px',
            'text-background-shape': 'roundrectangle',
            'color': '#222'
          }
        }
      ]
    });

    setTimeout(() => {
      this.cy.resize();
      this.cy.fit();
    }, 100);

    // Save initial layout reference
    this.activeLayout = this.cy.layout({
      name: 'cose',
      animate: true,
    });
    this.activeLayout.run();

    // ----- Icon Navigation Logic -----
    this.cy.on('tap', 'node', (event) => {
      const node = event.target;
      const userId = node.data('userId');
      this.router.navigate(['/profile', userId]);
    });

    // ----- Animation Logic -----
    this.cy.on('grab', 'node', (event) => {
      const node = event.target;
      const nodeId = node.id();
      this.nodeAnimations.set(nodeId, false);
      node.stop();
    });

    this.cy.on('dragfree', 'node', (event) => {
      const node = event.target as cytoscape.NodeSingular;
      const nodeId = node.id();
      const newPosition = node.position();
      node.data('basePosition', { x: newPosition.x, y: newPosition.y });

      setTimeout(() => {
        this.nodeAnimations.set(nodeId, true);
        this.startSingleNodeAnimation(node);
      }, 500);
    });

    requestAnimationFrame(() => {
      this.activeLayout = this.cy.layout({
        name: 'cose',
        animate: true
      });

      this.activeLayout.run();
    });

    this.cy.ready(() => {
      setTimeout(() => {
        this.animationRunning = true;
        this.startIdleAnimation(this.cy);
      }, 1000);
    });
  }

  private fetchDataAndRebuild(): void {
    forkJoin({
      activities: this.activityService.getActivitiesByUserParticipation(this.userId),
      users: this.volunteerService.getAllVolunteers()
    }).subscribe({
      next: ({ activities, users }) => {
        this.activities = activities;
        this.loadedUsers = users;
        this.selectedActivities = new Set<number>(activities.map(a => a.id));
        this.rebuildCytoscapeElements();
      },
      error: (err) => {
        console.warn('Failed to load activities from API, falling back to mock data', err);
        const mockPart = MOCK_ACTIVITIES.filter(act => {
          const participants = act.participants || [];
          return participants.some(p => p && p.id === this.userId);
        });
        this.activities = mockPart;
        this.loadedUsers = MOCK_USERS;
        this.selectedActivities = new Set<number>(mockPart.map(a => a.id));
        this.rebuildCytoscapeElements();
      }
    });
  }

  private rebuildCytoscapeElements(): void {
    if (this.activeLayout) {
      this.activeLayout.stop();
    }
    this.cy.stop();

    this.cy.nodes().forEach((node) => {
      node.removeData('basePosition');
      const nodeId = node.id();
      this.nodeAnimations.set(nodeId, false);
      node.stop();
    });

    const elements = this.getGraphElements();

    this.cy.remove('edge');
    this.cy.remove('node');

    this.cy.add(elements);

    this.activeLayout = this.cy.layout({
      name: 'cose',
      animate: true,
    });
    this.activeLayout.run();

    setTimeout(() => {
      if (this.animationRunning) {
        this.startIdleAnimation(this.cy);
      }
    }, 1000);
  }

  private rebuildGraph(): void {
    this.rebuildCytoscapeElements();
  }

  private getGraphElements(): cytoscape.ElementDefinition[] {
    const filteredActivities = this.activities.filter(act => this.selectedActivities.has(act.id));
    const activeParticipantIds = new Set<number>();

    for (const act of filteredActivities) {
      const participants = act.participants || [];
      for (const p of participants) {
        if (p && p.id) {
          activeParticipantIds.add(p.id);
        }
      }
    }

    const nodes = this.loadedUsers
      .filter(user => activeParticipantIds.has(user.id))
      .map(user => ({
        data: {
          id: `u${user.id}`,
          userId: user.id,
          label: user.name,
          avatar: user.profilePicture
        }
      }));

    const edges: cytoscape.ElementDefinition[] = [];
    const userIds = new Set(this.loadedUsers.map(u => u.id));

    for (const act of filteredActivities) {
      const participants = act.participants || [];
      for (let i = 0; i < participants.length; i++) {
        for (let j = i + 1; j < participants.length; j++) {
          const uA = participants[i];
          const uB = participants[j];
          // Defensively check that both node endpoints exist to prevent invalid edges
          if (uA && uB && userIds.has(uA.id) && userIds.has(uB.id)) {
            edges.push({
              data: {
                id: `e_${act.id}_${uA.id}_${uB.id}`,
                source: `u${uA.id}`,
                target: `u${uB.id}`,
                activityId: act.id,
                activityTitle: act.title,
                color: this.getActivityColor(act.id)
              }
            });
          }
        }
      }
    }

    return [...nodes, ...edges];
  }

  ngOnDestroy(): void {
    this.animationRunning = false;
    this.nodeAnimations.clear();
    if (this.activeLayout) {
      this.activeLayout.stop();
    }
    if (this.cy) {
      this.cy.stop();
      this.cy.destroy();
    }
  }

  private startIdleAnimation(cy: cytoscape.Core): void {
    cy.nodes().forEach((node: cytoscape.NodeSingular, index: number) => {
      const nodeId = node.id();
      this.nodeAnimations.set(nodeId, true);

      setTimeout(() => {
        if (this.animationRunning) {
          this.startSingleNodeAnimation(node);
        }
      }, index * 300 + Math.random() * 1000);
    });
  }

  private startSingleNodeAnimation(node: cytoscape.NodeSingular): void {
    const nodeId = node.id();

    const loopNodeAnimation = () => {
      if (!this.animationRunning || !this.nodeAnimations.get(nodeId)) return;

      const currentPos = node.position();
      const basePos = node.data('basePosition') || currentPos;

      if (!node.data('basePosition')) {
        node.data('basePosition', { x: currentPos.x, y: currentPos.y });
      }

      const offsetX = (Math.random() - 0.5) * 30;
      const offsetY = (Math.random() - 0.5) * 30;

      const newPos = { x: basePos.x + offsetX, y: basePos.y + offsetY };

      (node as unknown as {
        animation(options: {
          position: cytoscape.Position;
          duration: number;
          easing: string;
        }): { play(): { promise(type: string): Promise<void> } }
      }).animation({
        position: newPos,
        duration: 2000 + Math.random() * 2000,
        easing: 'ease-in-out'
      }).play().promise('complete').then(() => {
        if (this.animationRunning && this.nodeAnimations.get(nodeId)) {
          setTimeout(loopNodeAnimation, 500 + Math.random() * 1500);
        }
      });
    };

    loopNodeAnimation();
  }
}
