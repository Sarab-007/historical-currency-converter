import { Component, input } from '@angular/core';

@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  template: '',
  styleUrl: './loading-skeleton.component.scss',
  host: {
    '[style.width]': 'width()',
    '[style.height]': 'height()',
    '[style.border-radius]': 'radius()',
    'aria-hidden': 'true',
  },
})
export class LoadingSkeletonComponent {
  readonly height = input('1rem');
  readonly radius = input('0.75rem');
  readonly width = input('100%');
}
