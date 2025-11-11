import { CommonModule } from '@angular/common';
import { Component, OnInit, effect, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { Header } from '../../components/header/header';
import { ItemService } from '../../services/item.service';
import { ItemStoreService } from '../../services/item-store-service';
import { LocationService } from '../../services/location.service';
import { UserStoreService } from '../../services/user-store.service';
import { CategoryService } from '../../services/category.service';
import { CategoryStoreService } from '../../services/category-store-service';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-browse-item',
  standalone: true,
  imports: [CommonModule, Header, Footer, FormsModule, ReactiveFormsModule],
  templateUrl: './browse-item.html',
  styleUrl: './browse-item.scss'
})

export class BrowseItem implements OnInit {
  @Input() items: any[] = [];
  allItems: any[] = [];
  categories: any[] = [];
  states: { id: number, name: string, iso2: string }[] = [];

  selectedCategory: string = '';
  searchText: string = '';
  selectedPriceRange: string = '';
  currentUser: string = '';
selectedCategoryName: string = 'All Categories';
selectedPriceRangeLabel: string = 'Price Range';



  currentPage = 1;
  totalPages = 1;
  pagesArray: number[] = [];

  stateMap: Record<string, string> = {
    AP: "Andhra Pradesh", AR: "Arunachal Pradesh", AS: "Assam",
    BR: "Bihar", CG: "Chhattisgarh", DL: "Delhi", GA: "Goa",
    GJ: "Gujarat", HR: "Haryana", HP: "Himachal Pradesh",
    JH: "Jharkhand", JK: "Jammu and Kashmir", KA: "Karnataka",
    KL: "Kerala", MP: "Madhya Pradesh", MH: "Maharashtra",
    MN: "Manipur", ML: "Meghalaya", MZ: "Mizoram", NL: "Nagaland",
    OD: "Odisha", PB: "Punjab", RJ: "Rajasthan", SK: "Sikkim",
    TN: "Tamil Nadu", TS: "Telangana", TR: "Tripura", UP: "Uttar Pradesh",
    UK: "Uttarakhand", WB: "West Bengal"
  };

  constructor(
    private itemService: ItemService,
    private itemStoreService: ItemStoreService,
    private router: Router,
    private locationService: LocationService,
    public userStoreService: UserStoreService,
    private categoryStoreService: CategoryStoreService,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
  ) {
    effect(() => {
      this.allItems = this.itemStoreService.items();
      this.applyFilters();
    });

    effect(() => {
      this.categories = this.categoryStoreService.getCategories()();
    });
  }

  ngOnInit() {
    this.loadCurrentUser()
    this.loadStates()
    this.loadcategories()

    this.route.queryParams.subscribe(params => {
      const categoryFromQuery = params['category'];
      if (categoryFromQuery) {
        this.selectedCategory = categoryFromQuery;
      }
    });

  }

  selectCategory(categoryId: string | null, categoryName: string) {
  this.selectedCategory = categoryId || '';
  this.selectedCategoryName = categoryName;
  this.applyFilters();
}

selectPriceRange(range: string, label: string) {
  this.selectedPriceRange = range;
  this.selectedPriceRangeLabel = label;
  this.applyFilters();
}



  // Load current user (from store or localStorage)
  private loadCurrentUser() {
    let user = this.userStoreService.getCurrentUser()();
    if (!user) {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        user = JSON.parse(userStr);
      }
    }
    this.currentUser = user;
  }

  onCategoryChange() {
    this.applyFilters();
  }

  onSearch() {
    this.applyFilters();
  }

  // Load states (from backend)
  loadStates() {
    this.locationService.getStates().subscribe({
      next: (res: any) => this.states = res.data,
      error: (err) => console.error(err)
    });
  }

  // Load categories (from backend)
  loadcategories() {
    const storedCategories = this.categoryStoreService.getCategories()();
    if (storedCategories.length === 0) {
      this.categoryService.getCategories().subscribe({
        next: (res: any) => this.categoryStoreService.setCategories(res),
        error: (err) => console.error(err)
      });
    } else {
      this.categories = storedCategories;
    }
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.applyFilters(page); // backend call nahi karni, sirf slice update karni hai
    window.scrollTo({ top: 0, behavior: 'smooth' });

  }

  public applyFilters(page: number = 1) {
    let filtered = this.allItems
    // Category filter
    if (this.selectedCategory) {
      filtered = filtered.filter(item => item.category?._id === this.selectedCategory);
    }

    // Search filter
    const text = this.searchText.trim().toLowerCase();
    if (text) {
      filtered = filtered.filter(item => {
        const owner = item.owner || {};
        const titleMatch = item.title?.toLowerCase().includes(text);
        const cityMatch = owner.city?.toLowerCase().includes(text);
        const locationMatch = owner.location?.toLowerCase().includes(text);
        const stateMatch =
          owner.state?.toLowerCase() === text ||
          this.stateMap[owner.state]?.toLowerCase().includes(text);
        return titleMatch || cityMatch || locationMatch || stateMatch;
      });
    }

    // Price filter
    if (this.selectedPriceRange) {
      const [min, max] = this.selectedPriceRange.split('-').map(Number);
      filtered = filtered.filter(item => item.price >= min && item.price <= max);
    }

    // Pagination
    this.totalPages = Math.ceil(filtered.length / 8);
    this.pagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.currentPage = page;
    this.items = filtered.slice((page - 1) * 8, page * 8);
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

  getStateName(code: string): string {
    const state = this.states.find(s => s.iso2 === code);
    return state ? state.name : code;
  }

  goToItemDetail(itemId: string) {
    this.router.navigate(['itemDetail', itemId]);
    window.scrollTo(0, 0);

  }
}
