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
  <div class="graph-panel">
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
  </div>
  `,
  styles: [`
    .graph-panel {
      display: grid;
      gap: 16px;
      padding: 18px;
      border: 1px solid rgba(175, 178, 187, 0.35);
      border-radius: 14px;
      background:
        radial-gradient(circle at 82% 10%, rgba(222, 204, 253, 0.34), transparent 34%),
        linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(249, 249, 254, 0.96));
      box-shadow: 0 18px 42px rgba(47, 50, 58, 0.08);
    }

    .cy-container {
      width: 100%;
      height: min(560px, 66vh);
      min-height: 420px;
      border: 1px solid rgba(175, 178, 187, 0.24);
      border-radius: 10px;
      background:
        linear-gradient(rgba(70, 96, 138, 0.045) 1px, transparent 1px),
        linear-gradient(90deg, rgba(70, 96, 138, 0.045) 1px, transparent 1px),
        rgba(255, 255, 255, 0.58);
      background-size: 28px 28px;
      overflow: hidden;
    }

    .legend {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 14px;
      padding: 12px 14px;
      border: 1px solid rgba(175, 178, 187, 0.24);
      border-radius: 10px;
      background-color: rgba(255, 255, 255, 0.72);
      font-family: 'Inter', sans-serif;
    }

    .legend-title {
      font-family: 'Manrope', sans-serif;
      font-size: 0.95rem;
      font-weight: 700;
      color: #2f323a;
      padding-top: 6px;
      white-space: nowrap;
    }

    .legend-items {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: 8px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      max-width: min(100%, 280px);
      padding: 6px 10px;
      border: 1px solid rgba(175, 178, 187, 0.18);
      border-radius: 999px;
      background: rgba(249, 249, 254, 0.82);
      transition: background 0.2s ease, border-color 0.2s ease;
    }

    .legend-item:hover {
      background: #f3f3fa;
      border-color: rgba(70, 96, 138, 0.26);
    }

    .checkbox-input {
      width: 16px;
      height: 16px;
      accent-color: #46608a;
      cursor: pointer;
    }

    .legend-color {
      flex: 0 0 auto;
      width: 12px;
      height: 12px;
      border-radius: 999px;
      box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.9);
    }

    .legend-label {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 0.8rem;
      font-weight: 650;
      color: #5c5f68;
    }

    @media (max-width: 700px) {
      .graph-panel {
        padding: 12px;
      }

      .legend {
        flex-direction: column;
      }

      .legend-items {
        justify-content: flex-start;
      }

      .cy-container {
        min-height: 360px;
        height: 58vh;
      }
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
  private destroyed = false;
  private loadSequence = 0;
  private resizeObserver?: ResizeObserver;
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
      this.loadGraphData();
    }
  }

  private initWhenVisible(): void {
    if (!this.isContainerVisible()) {
      setTimeout(() => this.initWhenVisible(), 100);
      return;
    }

    this.loadGraphData();
  }

  private isContainerVisible(): boolean {
    const rect = this.cyContainer.nativeElement.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  private loadGraphData(): void {
    const requestId = ++this.loadSequence;
    const requestedUserId = this.userId;

    forkJoin({
      activities: this.activityService.getActivitiesByUserParticipation(requestedUserId),
      users: this.volunteerService.getAllVolunteers()
    }).subscribe({
      next: ({ activities, users }) => {
        if (this.destroyed || requestId !== this.loadSequence) return;
        this.activities = activities;
        this.loadedUsers = users;
        this.selectedActivities = new Set<number>(activities.map(a => a.id));

        this.renderGraphElements();
      },
      error: (err) => {
        if (this.destroyed || requestId !== this.loadSequence) return;
        console.warn('Failed to load activities from API, falling back to mock data', err);
        const mockPart = MOCK_ACTIVITIES.filter(act => {
          const participants = act.participants || [];
          return participants.some(p => p.id === requestedUserId);
        });
        this.activities = mockPart;
        this.loadedUsers = MOCK_USERS;
        this.selectedActivities = new Set<number>(mockPart.map(a => a.id));

        this.renderGraphElements();
      }
    });
  }

  private renderGraphElements(): void {
    if (!this.isContainerVisible()) {
      return;
    }

    const elements = this.getGraphElements();
    if (this.cy) {
      this.rebuildCytoscapeElements(elements);
      return;
    }

    this.createCytoscapeGraph(elements);
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
            'width': 66,
            'height': 66,
            'border-width': 4,
            'border-color': '#ffffff',
            'border-opacity': 1,
            'label': 'data(label)',
            'font-size': 12,
            'font-weight': 700,
            'font-family': 'Inter, sans-serif',
            'color': '#2f323a',
            'text-valign': 'bottom',
            'text-margin-y': 10,
            'text-background-color': '#ffffff',
            'text-background-opacity': 0.86,
            'text-background-padding': '4px',
            'text-background-shape': 'roundrectangle',
            'background-color': '#deccfd',
            'overlay-opacity': 0,
            'transition-property': 'width height border-color',
            'transition-duration': 160
          }
        },
        {
          selector: 'node.current-user',
          style: {
            'width': 76,
            'height': 76,
            'border-color': '#46608a',
            'border-width': 5
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
        {
          selector: 'node:selected, node:active',
          style: {
            'border-color': '#7d5b80'
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
            'width': 4.5,
            'opacity': 0.74,
            'line-cap': 'round',
            'label': 'data(activityTitle)',
            'font-size': 10,
            'font-weight': 650,
            'font-family': 'Inter, sans-serif',
            'text-rotation': 'autorotate',
            'text-background-opacity': 0.9,
            'text-background-color': '#ffffff',
            'text-background-padding': '4px',
            'text-background-shape': 'roundrectangle',
            'color': '#2f323a',
            'text-outline-width': 1,
            'text-outline-color': '#ffffff',
            'transition-property': 'opacity width',
            'transition-duration': 160
          }
        },
        {
          selector: 'edge:selected, edge:active',
          style: {
            'opacity': 1,
            'width': 7
          }
        }
      ]
    });

    this.resizeObserver = new ResizeObserver(() => {
      this.cy.resize();
    });
    this.resizeObserver.observe(this.cyContainer.nativeElement);

    this.runStableLayout();

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

    this.cy.ready(() => this.cy.resize());
  }

  private rebuildCytoscapeElements(elements = this.getGraphElements()): void {
    if (!this.cy) return;
    this.stopGraphMotion();
    this.cy.stop();

    this.cy.nodes().forEach((node) => {
      node.removeData('basePosition');
      const nodeId = node.id();
      this.nodeAnimations.set(nodeId, false);
      node.stop();
    });

    this.cy.remove('edge');
    this.cy.remove('node');

    this.cy.add(elements);
    this.runStableLayout();
  }

  private runStableLayout(): void {
    this.stopGraphMotion();
    this.activeLayout = this.cy.layout({
      name: 'cose',
      animate: true,
      animationDuration: 600,
      fit: true,
      padding: 40
    });

    this.activeLayout.one('layoutstop', () => {
      if (this.destroyed || !this.cy) return;
      this.cy.resize();
      this.cy.fit(undefined, 40);
      this.animationRunning = true;
      this.startIdleAnimation(this.cy);
    });

    requestAnimationFrame(() => this.activeLayout?.run());
  }

  private stopGraphMotion(): void {
    this.animationRunning = false;
    this.nodeAnimations.clear();
    this.activeLayout?.stop();
    this.activeLayout = undefined;
    this.cy?.nodes().forEach((node) => {
      node.stop();
    });
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
        classes: user.id === this.userId ? 'current-user' : '',
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
    this.destroyed = true;
    this.animationRunning = false;
    this.nodeAnimations.clear();
    this.resizeObserver?.disconnect();
    this.activeLayout?.stop();
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
