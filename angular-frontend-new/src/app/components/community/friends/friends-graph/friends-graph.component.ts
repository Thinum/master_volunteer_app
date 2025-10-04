import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
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
export class FriendsGraphComponent implements AfterViewInit {
  @ViewChild('cyContainer', { static: true }) cyContainer!: ElementRef;

  friends = [
    { name: 'Alice', avatar: 'https://i.pravatar.cc/100?img=1' },
    { name: 'Bob', avatar: 'https://i.pravatar.cc/100?img=2' },
    { name: 'Charlie', avatar: 'https://i.pravatar.cc/100?img=3' },
    { name: 'Heinrich', avatar: 'https://i.pravatar.cc/100?img=4'},
    { name: 'Gunther', avatar: 'https://i.pravatar.cc/100?img=5'},
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

    cytoscape({
      container: this.cyContainer.nativeElement,
      elements: [...nodes, ...edges],
      layout: { name: 'circle' },
      style: [
        {
          selector: 'node',
          style: {
            'width': 60,
            'height': 60,
            'border-width': 2,
            'border-color': '#666',
            'label': 'data(label)',
            'font-size': 12,
            'color': '#333',
            'text-valign': 'bottom',
            'text-margin-y': 8,
            'background-color': '#ccc' // fallback color
          }
        },
        {
          selector: 'node[avatar]', // only if avatar is defined
          style: {
            'shape': 'ellipse',
            'background-fit': 'cover',
            'background-clip': 'node',
            'background-image': './test.png',
            //'background-image': 'data(avatar)', //does not work cause of cors
            //TODO: Fix above to have proper avatar either by adding proxy or delete
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
  }
}
