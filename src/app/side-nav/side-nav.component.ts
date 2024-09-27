import {
  Component,
  inject,
  Input,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatListModule } from '@angular/material/list';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { NavItem } from '../model/nav-item.model';

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [MatListModule, MatRippleModule, RouterLink, RouterLinkActive],
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.scss',
})
export class SideNavComponent implements OnInit {
  @Input() navState: WritableSignal<boolean> = signal(true);
  isAdmin: WritableSignal<boolean> = inject(AuthService).isAdmin;
  navItems: WritableSignal<NavItem[]> = signal([]);

  ngOnInit(): void {
    this.navItems.set([
      { title: 'User Master', link: '/master/user', adminOnly: true },
      { title: 'Company Master', link: '/master/company', adminOnly: true },
      { title: 'Group Master', link: '/master/group', adminOnly: true },
      { title: 'Mouza Master', link: '/master/mouza', adminOnly: true },
      { title: 'Deed Master', link: '/master/deed', adminOnly: false },
      { title: 'Land Record', link: '/land-record', adminOnly: false },
      { title: 'Get History Chain Graph', link: '/report/get-history-chain', adminOnly: false },
      // { title: 'Report', link: '/report', adminOnly: false },
    ]);
  }
}
