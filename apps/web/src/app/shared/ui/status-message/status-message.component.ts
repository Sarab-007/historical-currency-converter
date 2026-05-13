import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-status-message',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './status-message.component.html',
  styleUrl: './status-message.component.scss',
})
export class StatusMessageComponent {
  readonly icon = input('info');
  readonly title = input.required<string>();
  readonly tone = input<'error' | 'neutral'>('neutral');
}
