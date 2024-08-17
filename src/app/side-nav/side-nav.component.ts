import { Component, Input, signal, WritableSignal } from '@angular/core';

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [],
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.scss'
})
export class SideNavComponent {
  @Input() navState: WritableSignal<boolean> = signal(true);
}
