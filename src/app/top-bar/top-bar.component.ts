import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AppUser } from '../auth/user.model';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';
import { MatMenuModule } from '@angular/material/menu';


@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatMenuModule],
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.css'
})
export class TopBarComponent implements OnInit, OnDestroy {
  userSignal = signal<AppUser | undefined | null>(null);
  userAuthSubs?: Subscription;
  router = inject(Router);
  authService = inject(AuthService);

  ngOnInit(): void {
    this.userAuthSubs = this.authService.user$.subscribe(user => {
      if (user) {
        this.userSignal.set(user);
      } else {
        this.userSignal.set(null);
      }
    });
  }

  ngOnDestroy(): void {
    this.userAuthSubs?.unsubscribe();
  }
  navToAuth() {
    this.router.navigateByUrl('auth');
  }

  account() {
    this.router.navigateByUrl(`/account/${this.userSignal()?.id}`);
  }

  logout() {
    this.authService.logout();
  }
}
