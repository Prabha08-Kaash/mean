import { Component, OnInit, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { Header } from '../../components/header/header';
import { UserService } from '../../services/user.service';
import { UserStoreService } from '../../services/user-store.service';
import { LocationService } from '../../services/location.service';
import { ItemStoreService } from '../../services/item-store-service';
import { ItemService } from '../../services/item.service';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, Header, Footer],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile implements OnInit {
  currentUser: any = null;
  viewedUserData: any = null;
  userId: string | null = null;
  items: any[] = [];
  states: { id: number, name: string, iso2: string }[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public userService: UserService,
    public userStoreService: UserStoreService,
    private locationService: LocationService,
    private itemStoreService: ItemStoreService,
    private itemService: ItemService,
  ) {

  }

  ngOnInit() {

    this.loadCurrentUser()

    this.route.paramMap.subscribe((params) => {
      this.userId = params.get('id');
      this.loadProfileData();
    });

    this.loadStates();
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
    this.currentUser = user;
  }

  private loadProfileData() {
    if (this.userId) {
      //  Viewing another user (e.g., owner)
      const allUsers = this.userStoreService.getUser()();
      console.log(allUsers);

      const targetUser = allUsers.find((u: any) => u._id === this.userId);

      if (targetUser) {
        this.viewedUserData = targetUser;

      } else {
        // fallback to backend
        this.userService.getUserById(this.userId).subscribe({
          next: (res: any) => {

            this.viewedUserData = res.data

          },
          error: (err: any) => console.error(err),
        });
      }
    } else {
      this.viewedUserData = this.currentUser;
    }
  }

  // Load states
  private loadStates() {
    this.locationService.getStates().subscribe({
      next: (res: any) => this.states = res.data,
      error: (err) => console.error(err)
    });
  }

  // helper metohd
  getStateName(code: string): string {
    const state = this.states.find(s => s.iso2 === code);
    return state ? state.name : code;
  }

  // ✅ Automatically filter items based on who’s being viewed
  itemsEffect = effect(() => {
    const allItems = this.itemStoreService.getItems()();

    if (this.userId) {
      // If we’re viewing someone else’s profile
      this.items = allItems.filter(item => item.owner?._id === this.userId);
    } else if (this.currentUser) {
      // Viewing current logged-in user's profile
      this.items = allItems.filter(item => item.owner?._id === this.currentUser._id);
    }
  });

  goToItemDetail(itemId: string) {
    this.router.navigate(['itemDetail', itemId]);
    window.scrollTo(0, 0);
  }

   //go to Update Profile page
  goToUpdateProfile() {
    this.router.navigate(['updateProfile']);
    window.scrollTo(0, 0);
  }
}
