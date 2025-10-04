import { AfterViewInit, Component, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import cytoscape from 'cytoscape';

@Component({
  selector: 'app-friends-graph',
  template: `<div #cyContainer class="cy-container"></div>`,
  styles: [`
    .cy-container {
      width: 100%;
      height: 500px; /* required */
      border: 1px solid #ccc;
      border-radius: 8px;
    }
  `]
})
export class FriendsGraphComponent implements AfterViewInit, OnDestroy {
  @ViewChild('cyContainer', { static: true }) cyContainer!: ElementRef;
  private animationRunning = false;
  private nodeAnimations = new Map<string, boolean>();

  friends = [
    { name: 'Alice', avatar: 'https://i.pravatar.cc/100?img=1' },
    { name: 'Bob', avatar: 'https://i.pravatar.cc/100?img=2' },
    { name: 'Charlie', avatar: 'https://i.pravatar.cc/100?img=3' },
    { name: 'Heinrich', avatar: 'https://i.pravatar.cc/100?img=4' },
    { name: 'Gunther', avatar: 'https://i.pravatar.cc/100?img=5' },
  ];

  ngAfterViewInit(): void {
    const nodes = this.friends.map((friend, idx) => ({
      data: {
        id: `f${idx}`,
        label: friend.name,
        avatar: friend.avatar ?? null
      }
    }));

    const edges = [
      { data: { source: 'f3', target: 'f0' } },
      { data: { source: 'f3', target: 'f1' } },
      { data: { source: 'f3', target: 'f2' } },
      { data: { source: 'f0', target: 'f4' } },
    ];

    const cy = cytoscape({
      container: this.cyContainer.nativeElement,
      elements: [...nodes, ...edges],
      layout: {
        name: 'cose',
        animate: true,
      },
      style: [
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
            'shape': 'ellipse',
            'background-fit': 'cover',
            'background-clip': 'node',
            'background-image': './test.png',
            // 'background-image': 'data(avatar)' // <-- works if you use local assets corse error otherwise with links
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#bbb',
            'curve-style': 'bezier'
          }
        }
      ]
    });

    // Listen for when user starts dragging - pause animation for that node
    cy.on('grab', 'node', (event: any) => {
      const node = event.target;
      const nodeId = node.id();

      // Stop animation for this specific node
      this.nodeAnimations.set(nodeId, false);

      // Stop any current animation
      node.stop();
    });

    // Listen for drag events to update base positions
    cy.on('dragfree', 'node', (event: any) => {
      const node = event.target;
      const nodeId = node.id();
      const newPosition = node.position();

      // Update the base position when user manually drags a node
      node.data('basePosition', { x: newPosition.x, y: newPosition.y });

      // Resume animation for this node after a short delay
      setTimeout(() => {
        this.nodeAnimations.set(nodeId, true);
        this.startSingleNodeAnimation(node);
      }, 500);
    });

    // Wait for the layout to finish before starting idle animation
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
    // Start animation for each node with staggered timing
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
      // Check if animation should continue for this specific node
      if (!this.animationRunning || !this.nodeAnimations.get(nodeId)) {
        return;
      }

      const currentPos = node.position();
      const basePos = node.data('basePosition') || currentPos;

      // Store original position if first time
      if (!node.data('basePosition')) {
        node.data('basePosition', { x: currentPos.x, y: currentPos.y });
      }

      // Generate small random offset (±15 pixels from base position)
      const offsetX = (Math.random() - 0.5) * 30;
      const offsetY = (Math.random() - 0.5) * 30;

      const newPos = {
        x: basePos.x + offsetX,
        y: basePos.y + offsetY
      };

      // Create and play animation with promise chaining
      node.animation({
        position: newPos
      }, {
        duration: 2000 + Math.random() * 2000, // 2-4 seconds
        easing: 'ease-in-out'
      }).play().promise('complete').then(() => {
        // Continue the loop if animation is still running for this node
        if (this.animationRunning && this.nodeAnimations.get(nodeId)) {
          setTimeout(loopNodeAnimation, 500 + Math.random() * 1500);
        }
      });
    };

    loopNodeAnimation();
  }
}
