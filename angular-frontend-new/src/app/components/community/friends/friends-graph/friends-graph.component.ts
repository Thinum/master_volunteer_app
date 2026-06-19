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
  <div class="legend">
    <div class="legend-title">Relationship Types</div><br />
    <div class="legend-items">
      <div class="legend-item" *ngFor="let item of relationshipLegend">
        <span class="legend-color" [style.background]="item.color"></span>
        <span class="legend-label">{{ item.type }}</span>
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
      max-width: 320px;

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

      padding: 6px 8px;
      border-radius: 8px;

      /* subtle tonal hover layer (optional) */
      transition: background 0.2s ease;
    }

    .legend-item:hover {
      background: #f3f3fa; /* surface-container-low */
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

export class FriendsGraphComponent implements AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('cyContainer', { static: true }) cyContainer!: ElementRef;
  @Input() userId = 1;

  private cy!: cytoscape.Core;
  private activeLayout?: cytoscape.Layouts;
  private animationRunning = false;
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
      this.rebuildGraph();
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
      users: this.volunteerService.getAllVolunteers(),
      relationships: this.volunteerService.getUserRelationships(this.userId)
    }).subscribe({
      next: ({ users, relationships }) => {
        this.loadedUsers = users;
        this.loadedRelationships = relationships;
        const elements = this.getGraphElements();
        this.createCytoscapeGraph(elements);
      },
      error: (err) => {
        console.warn('Failed to load relationships from API, falling back to mock data', err);
        this.loadedUsers = MOCK_USERS;
        this.loadedRelationships = this.getMockRelationshipsAsDTO();
        const elements = this.getGraphElements();
        this.createCytoscapeGraph(elements);
      }
    });
  }

  private rebuildGraph(): void {
    if (!this.cy) return;

    forkJoin({
      users: this.volunteerService.getAllVolunteers(),
      relationships: this.volunteerService.getUserRelationships(this.userId)
    }).subscribe({
      next: ({ users, relationships }) => {
        this.loadedUsers = users;
        this.loadedRelationships = relationships;
        this.rebuildCytoscapeElements();
      },
      error: (err) => {
        console.warn('Failed to load relationships from API, falling back to mock data', err);
        this.loadedUsers = MOCK_USERS;
        this.loadedRelationships = this.getMockRelationshipsAsDTO();
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
        // --- EDGE STYLE WITH WEIGHT BASED ON likeScore ---
        //
        {
          selector: 'edge',
          style: {
            'curve-style': 'bezier',
            'line-color': 'data(color)',

            // Scale line width 1px → 8px based on likeScore=0–100
            'width': 'mapData(likeScore, 0, 100, 1, 8)',

            // --- ARROWS ---
            //'target-arrow-shape': 'triangle',
            //'target-arrow-color': '#bbb',
            //'arrow-scale': 1.5
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

    this.cy.ready(() => {
      setTimeout(() => {
        this.animationRunning = true;
        this.startIdleAnimation(this.cy);
      }, 1000);
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
