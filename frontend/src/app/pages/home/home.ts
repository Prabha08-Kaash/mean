import { CommonModule } from '@angular/common';
import { Component, OnInit, effect, ViewChild, ElementRef } from '@angular/core';
import { CategoryService } from '../../services/category.service';
import { Header } from '../../components/header/header';
import { CategoryStoreService } from '../../services/category-store-service';
import { Router } from '@angular/router';
import { ItemService } from '../../services/item.service';
import { ItemStoreService } from '../../services/item-store-service';
import { UserStoreService } from '../../services/user-store.service';
import { LocationService } from '../../services/location.service';
import { Footer } from '../../components/footer/footer';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, Header, Footer,],
  standalone: true,
  templateUrl: './home.html',
  styleUrl: './home.scss'
})

export class Home implements OnInit {
  categories: any[] = []
  allItems: any[] = [];
  items: any[] = [];
  currentUserId: string = '';
  states: { id: number, name: string, iso2: string }[] = [];
  boxColors: string[] = ['#E0F7FA', '#FFF3E0', '#E8F5E9', '#F3E5F5', '#FFFDE7']; // light backgrounds
  iconColors: string[] = ['#00ACC1', '#FB8C00', '#43A047', '#8E24AA', '#FDD835']; // slightly darker

  @ViewChild('carousel', { static: false }) carousel!: ElementRef;

  scrollLeft() {
    this.carousel.nativeElement.scrollBy({ left: -300, behavior: 'smooth' });
  }

  scrollRight() {
    this.carousel.nativeElement.scrollBy({ left: 300, behavior: 'smooth' });
  }

  constructor(
    private router: Router,
    private categoryService: CategoryService,
    private categoryStoreService: CategoryStoreService,
    private itemService: ItemService,
    private itemStoreService: ItemStoreService,
    private userStoreService: UserStoreService,
    private locationService: LocationService,
    private authService: AuthService,
    private toast: ToastService,
  ) {
    effect(() => {
      const updatedItems = this.itemStoreService.items();
      this.allItems = updatedItems;
      this.items = this.allItems
    });

    effect(() => {
      this.categories = this.categoryStoreService.getCategories()()
    })
  }

  ngOnInit() {
this.loadLocationData()
    this.loadCategory()
  }

// ✅ Load current user (from store or localStorage)
  private loadCurrentUser() {
    let user = this.userStoreService.getCurrentUser()();
    if (!user) {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        user = JSON.parse(userStr);
      }
    }
    this.currentUserId = user._id;
  }

  // Load states
  private loadLocationData() {
    this.locationService.getStates().subscribe({
      next: res => (this.states = res.data),
      error: err => console.error(err)
    });
  }

  loadCategory() {
    //fetch categories from storedCategories if available
    const storedCategories = this.categoryStoreService.getCategories()() // call signal

    if (storedCategories.length === 0) {
      //if storedCategories empty, fetch categories from backend
      this.categoryService.getCategories().subscribe({
        next: (res) => {
          this.categoryStoreService.setCategories(res);
        },
        error: (err) => console.error("Error fetching categories:", err)
      })
    }
  }

  getRelativeDate(dateStr: string): string {
    const itemDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(itemDate);
    compareDate.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((today.getTime() - compareDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  }

  // go to Add Item page
  goToAddItem() {
    this.authService.checkAuth().subscribe({
      next: (res: any) => {
        const user = res.user;

        if (!user) {
          const message = "Please login or register to continue.";
          this.toast.showError(message);
          this.router.navigate(['/auth']);
          return;
        }

        // ✅ Check profile completeness
        const requiredFields = ['name', 'email', 'phone', 'location', 'state', 'city', 'pincode'];
        const incomplete = requiredFields.some(field => !user[field]);

        if (incomplete) {
          this.authService.redirectAfterProfileComplete = 'addItem';
          const message = "Please complete your profile before adding an item.";
          this.toast.showError(message);
          this.router.navigate(['/updateProfile']);
        } else {
          this.router.navigate(['/addItem']);
        }
      },
      error: () => {
        // ⚠️ If not logged in
        const message = "Please login or register to continue.";
        this.toast.showError(message);

        this.router.navigate(['/auth']);
      }
    });
    window.scrollTo(0, 0);
  }

  goToBrowseItem(categoryId?: string) {
    if (categoryId) {
      // category select karke navigate karo
      this.router.navigate(['/browseItem'], { queryParams: { category: categoryId } });
      window.scrollTo(0, 0);
    } else {
      this.router.navigate(['/browseItem']);
      window.scrollTo(0, 0);
    }
  }

  getStateName(code: string): string {
    const state = this.states.find(s => s.iso2 === code);
    return state ? state.name : code;
  }

  goToItemDetail(itemId: string) {
    this.router.navigate(['itemDetail', itemId]);
    window.scrollTo(0, 0);
  }

}
