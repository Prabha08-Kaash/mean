import { Component, signal } from '@angular/core';
import { RouterOutlet, Router, Event, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { ItemStoreService } from './services/item-store-service';
import { CommonModule } from '@angular/common';
import { Loader } from './components/loader/loader'; // path change as per your folder

@Component({
  selector: 'app-root',
  standalone:true,
  imports: [ CommonModule, RouterOutlet, Loader],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('frontend');
  loading = signal(false); // signal for reactive state

  constructor(private router: Router, private itemStoreService: ItemStoreService) {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        this.loading.set(true);
      }
      if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.loading.set(false);
      }
    });

     // ✅ fetch items globally when app starts
    this.itemStoreService.fetchItems();
  }
}
