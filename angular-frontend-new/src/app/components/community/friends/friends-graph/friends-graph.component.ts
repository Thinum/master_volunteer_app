import { AfterViewInit, Component, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import cytoscape from 'cytoscape';

import { MOCK_USERS, MOCK_USER_RELATIONSHIPS, UserRelationship, RELATIONSHIP_COLORS } from '../../../../mock/mock-users';
import { User } from '../../../../models/user.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-friends-graph',
  template: `
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
  `,
  styles: [`
    .cy-container {
      width: 100%;
      height: 500px;
      border: 1px solid #ccc;
      border-radius: 8px;
    }
    .legend {
      padding: 12px;
      margin-bottom: 12px;
      background: #fafafa;
      border: 1px solid #ccc;
      border-radius: 8px;
      font-family: Arial, sans-serif;
      max-width: 300px;
    }

    .legend-title {
      font-weight: bold;
      margin-bottom: 8px;
      color: #333;
    }

    .legend-items {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .legend-color {
      width: 20px;
      height: 20px;
      border-radius: 4px;
      display: inline-block;
      border: 1px solid #999;
    }

    .legend-label {
      color: #333;
      font-size: 14px;
    }
  `],
  imports: [CommonModule]
})

export class FriendsGraphComponent implements AfterViewInit, OnDestroy {
  @ViewChild('cyContainer', { static: true }) cyContainer!: ElementRef;
  private animationRunning = false;
  private nodeAnimations = new Map<string, boolean>();
  public relationshipLegend: { type: string; color: string }[] = [];

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

    // Initialize legend
    this.relationshipLegend = Object.entries(RELATIONSHIP_COLORS).map(
      ([type, color]) => ({ type, color })
    );

    //
    // --- Convert MOCK_USERS -> Cytoscape Nodes ---
    //
    const nodes = MOCK_USERS.map(user => ({
      data: {
        id: `u${user.id}`,
        label: user.name,
        avatar: user.profilePicture
      }
    }));

    // Collect pair scores + relationship types
    const pairMap = new Map<string, { scores: number[], types: string[] }>();

    for (const rel of MOCK_USER_RELATIONSHIPS) {
      for (const f of rel.friends) {

        const a = Math.min(rel.userId, f.friendId);
        const b = Math.max(rel.userId, f.friendId);
        const key = `${a}-${b}`;

        if (!pairMap.has(key)) {
          pairMap.set(key, { scores: [], types: [] });
        }

        pairMap.get(key)!.scores.push(f.likeScore);
        pairMap.get(key)!.types.push(f.type);
      }
    }

    const edges = Array.from(pairMap.entries()).map(([key, data]) => {
      const [a, b] = key.split('-').map(Number);

      // Average score
      const avgScore = data.scores.reduce((s, v) => s + v, 0) / data.scores.length;

      // Pick the dominant relationship type (max score)
      const strongestIndex = data.scores.indexOf(Math.max(...data.scores));
      const dominantType = data.types[strongestIndex];

      return {
        data: {
          source: `u${a}`,
          target: `u${b}`,
          likeScore: avgScore,
          type: dominantType,
          color: RELATIONSHIP_COLORS[dominantType]
        }
      };
    });

    const cy = cytoscape({
      container: this.cyContainer.nativeElement,
      elements: [...nodes, ...edges],
      layout: {
        name: 'cose',
        animate: true,
      },
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
            'background-fit': 'cover',
            'background-clip': 'node',
            'background-image': 'data(avatar)',
            'background-image-crossorigin': 'null' as any,
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


    // ----- Your existing animation logic (unchanged) -----

    cy.on('grab', 'node', (event: any) => {
      const node = event.target;
      const nodeId = node.id();
      this.nodeAnimations.set(nodeId, false);
      node.stop();
    });

    cy.on('dragfree', 'node', (event: any) => {
      const node = event.target;
      const nodeId = node.id();
      const newPosition = node.position();
      node.data('basePosition', { x: newPosition.x, y: newPosition.y });

      setTimeout(() => {
        this.nodeAnimations.set(nodeId, true);
        this.startSingleNodeAnimation(node);
      }, 500);
    });

    cy.ready(() => {
      setTimeout(() => {
        this.animationRunning = true;
        this.startIdleAnimation(cy);
      }, 1000);
    });
  }

  ngOnDestroy(): void {
    this.animationRunning = false;
    this.nodeAnimations.clear();
  }

  private startIdleAnimation(cy: any): void {
    cy.nodes().forEach((node: any, index: number) => {
      const nodeId = node.id();
      this.nodeAnimations.set(nodeId, true);

      setTimeout(() => {
        if (this.animationRunning) {
          this.startSingleNodeAnimation(node);
        }
      }, index * 300 + Math.random() * 1000);
    });
  }

  private startSingleNodeAnimation(node: any): void {
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

      node.animation({ position: newPos }, {
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
