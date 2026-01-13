import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent, LoadingComponent } from './shared/components';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent, LoadingComponent],
  template: `
    <router-outlet></router-outlet>
    <app-toast></app-toast>
    <app-loading></app-loading>
  `,
  styles: []
})
export class AppComponent {
  title = 'E-Loan Must Admin';
}
