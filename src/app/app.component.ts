import {
  Component,
  OnInit,
  WritableSignal,
  inject,
  signal,
} from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterOutlet,
} from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { filter, map, mergeMap } from 'rxjs';
import { MatSidenavModule } from '@angular/material/sidenav';
import { SideNavComponent } from "./side-nav/side-nav.component";

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [MatSidenavModule, RouterOutlet, HeaderComponent, FooterComponent, SideNavComponent],
})
export class AppComponent implements OnInit {
  private router: Router = inject(Router);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  readonly navState: WritableSignal<boolean> = signal(true);

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => this.activatedRoute),
        map((route) => {
          while (route.firstChild) route = route.firstChild;
          return route;
        }),
        filter((route) => route.outlet === 'primary'),
        mergeMap((route) => route.data)
      )
      .subscribe((data) => {
        // Update page title based on route data
        if (data && data['title']) {
          document.title = data['title'];
        }
      });
  }
}
