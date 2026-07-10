import { AfterViewInit, Component, ElementRef, ViewChild, OnDestroy, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import cytoscape from 'cytoscape';
import { forkJoin } from 'rxjs';

import { MOCK_USERS, MOCK_USER_RELATIONSHIPS, RELATIONSHIP_COLORS } from '../../../../mock/mock-users';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { VolunteerService } from '../../../../services/api/volunteer.service';
import { RelationshipDTO } from '../../../../models/relationship.model';
import { User } from '../../../../models/user.model';

@Component({
  selector: 'app-friends-graph',
  template: `
  <div class="graph-panel">
    <div class="legend">
      <div class="legend-title">Relationship Types</div>
      <div class="legend-items">
        <div class="legend-item" *ngFor="let item of relationshipLegend">
          <span class="legend-color" [style.background]="item.color"></span>
          <span class="legend-label">{{ item.type }}</span>
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
        radial-gradient(circle at 18% 12%, rgba(179, 205, 254, 0.32), transparent 34%),
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
      align-items: center;
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
      padding: 6px 10px;
      border: 1px solid rgba(175, 178, 187, 0.18);
      border-radius: 999px;
      background: rgba(249, 249, 254, 0.82);
    }

    .legend-item:hover {
      background: #f3f3fa;
    }

    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 999px;
      box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.9);
    }

    .legend-label {
      font-size: 0.8rem;
      font-weight: 650;
      color: #5c5f68;
    }

    @media (max-width: 700px) {
      .graph-panel {
        padding: 12px;
      }

      .legend {
        align-items: flex-start;
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

export class FriendsGraphComponent implements AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('cyContainer', { static: true }) cyContainer!: ElementRef;
  @Input() userId = 1;

  private cy!: cytoscape.Core;
  private activeLayout?: cytoscape.Layouts;
  private animationRunning = false;
  private destroyed = false;
  private loadSequence = 0;
  private resizeObserver?: ResizeObserver;
  private nodeAnimations = new Map<string, boolean>();
  private router = inject(Router);
  private volunteerService = inject(VolunteerService);

  private loadedUsers: User[] = [];
  private loadedRelationships: RelationshipDTO[] = [];

  public relationshipLegend: { type: string; color: string }[] = Object.entries(RELATIONSHIP_COLORS).map(
    ([type, color]) => ({ type, color })
  );

  private preloadImage(url: string): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };

      img.onerror = () => {
        console.warn('Failed to load image', url);
        resolve(''); // fallback – no image
      };

      img.src = url;
    });
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
      users: this.volunteerService.getAllVolunteers(),
      relationships: this.volunteerService.getUserRelationships(requestedUserId)
    }).subscribe({
      next: ({ users, relationships }) => {
        if (this.destroyed || requestId !== this.loadSequence) return;
        this.loadedUsers = users;
        this.loadedRelationships = relationships;
        this.renderGraphElements();
      },
      error: (err) => {
        if (this.destroyed || requestId !== this.loadSequence) return;
        console.warn('Failed to load relationships from API, falling back to mock data', err);
        this.loadedUsers = MOCK_USERS;
        this.loadedRelationships = this.getMockRelationshipsAsDTO();
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

  private rebuildCytoscapeElements(elements = this.getGraphElements()): void {
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
            'background-color': '#b3cdfe',
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
        // --- EDGE STYLE WITH WEIGHT BASED ON likeScore ---
        //
        {
          selector: 'edge',
          style: {
            'curve-style': 'bezier',
            'line-color': 'data(color)',
            'opacity': 0.76,
            'line-cap': 'round',
            'target-arrow-shape': 'none',
            'source-arrow-shape': 'none',
            'transition-property': 'opacity width',
            'transition-duration': 160,

            // Scale line width 1px → 8px based on likeScore=0–100
            'width': 'mapData(likeScore, 0, 100, 1.5, 7)',

            // --- ARROWS ---
            //'target-arrow-shape': 'triangle',
            //'target-arrow-color': '#bbb',
            //'arrow-scale': 1.5
          }
        },
        {
          selector: 'edge:selected, edge:active',
          style: {
            'opacity': 1,
            'width': 'mapData(likeScore, 0, 100, 3, 9)'
          }
        }
      ]
    });

    this.resizeObserver = new ResizeObserver(() => {
      this.cy.resize();
    });
    this.resizeObserver.observe(this.cyContainer.nativeElement);

    this.runStableLayout();

    // ----- Icon  logic -----
    this.cy.on('tap', 'node', (event) => {
      const node = event.target;
      const userId = node.data('userId');
      this.router.navigate(['/profile', userId]);
    });

    // ----- Animation logic -----

    this.cy.on('grab', 'node', (event) => {
      const node = event.target;
      const nodeId = node.id();
      this.nodeAnimations.set(nodeId, false);
      node.stop();
    });

    this.cy.on('dragfree', 'node', (event) => {
      const node = event.target;
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
    const currentUserId = this.userId;
    
    const includedUserIds = new Set<number>();
    includedUserIds.add(currentUserId);
    
    for (const rel of this.loadedRelationships) {
      if (rel.fromUserId === currentUserId) {
        includedUserIds.add(rel.toUserId);
      } else if (rel.toUserId === currentUserId) {
        includedUserIds.add(rel.fromUserId);
      }
    }

    const nodes = this.loadedUsers
      .filter(user => includedUserIds.has(user.id))
      .map(user => ({
        classes: user.id === currentUserId ? 'current-user' : '',
        data: {
          id: `u${user.id}`,
          userId: user.id,
          label: user.name,
          avatar: user.profilePicture
        }
      }));

    const pairMap = new Map<string, { scores: number[], types: string[] }>();

    for (const rel of this.loadedRelationships) {
      if (!includedUserIds.has(rel.fromUserId) || !includedUserIds.has(rel.toUserId)) {
        continue;
      }

      const a = Math.min(rel.fromUserId, rel.toUserId);
      const b = Math.max(rel.fromUserId, rel.toUserId);
      const key = `${a}-${b}`;

      if (!pairMap.has(key)) {
        pairMap.set(key, { scores: [], types: [] });
      }

      pairMap.get(key)!.scores.push(rel.likeScore);
      pairMap.get(key)!.types.push(rel.type);
    }

    const edges = Array.from(pairMap.entries()).map(([key, data]) => {
      const [a, b] = key.split('-').map(Number);

      const avgScore = data.scores.reduce((s, v) => s + v, 0) / data.scores.length;

      const strongestIndex = data.scores.indexOf(Math.max(...data.scores));
      const dominantType = data.types[strongestIndex].toUpperCase();

      const relationshipColorsNormalized: Record<string, string> = {};
      for (const [k, v] of Object.entries(RELATIONSHIP_COLORS)) {
        relationshipColorsNormalized[k.toUpperCase()] = v;
      }
      const color = relationshipColorsNormalized[dominantType] || '#ccc';

      return {
        data: {
          id: `e_${a}_${b}`,
          source: `u${a}`,
          target: `u${b}`,
          likeScore: avgScore,
          type: dominantType,
          color: color
        }
      };
    });

    return [...nodes, ...edges];
  }

  private getMockRelationshipsAsDTO(): RelationshipDTO[] {
    const list: RelationshipDTO[] = [];
    let idCounter = 1;
    for (const rel of MOCK_USER_RELATIONSHIPS) {
      const fromUserObj = MOCK_USERS.find(u => u.id === rel.userId);
      for (const f of rel.friends) {
        const toUserObj = MOCK_USERS.find(u => u.id === f.friendId);
        list.push({
          id: idCounter++,
          fromUserId: rel.userId,
          fromUserName: fromUserObj ? fromUserObj.name : `User ${rel.userId}`,
          toUserId: f.friendId,
          toUserName: toUserObj ? toUserObj.name : `User ${f.friendId}`,
          type: f.type.toString().toUpperCase(),
          likeScore: f.likeScore
        });
      }
    }
    return list;
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
