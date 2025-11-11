import { CommonModule } from '@angular/common';
import { Component, OnInit, effect, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStoreService } from '../../services/auth-store.service';
import { UserStoreService } from '../../services/user-store.service';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})

export class Header implements OnInit {
  isProfileOpen = false;
  toggleProfilePanel() {
    this.isProfileOpen = !this.isProfileOpen;
  }

  constructor(
    private router: Router,
    public authStoreService: AuthStoreService,
    public userStoreService: UserStoreService,
    private authService:AuthService,
        private toast: ToastService,

  ) { }

  ngOnInit() {
  }

  login() {
    this.router.navigate(['/auth']);
  }

  logout() {
    this.authService.logout().subscribe({
      next: (res: any) => {

        // Step 1: Clear stores
        this.authStoreService.logout();
        this.userStoreService.clearCurrentUser();

        // Step 2: Redirect to login
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('Logout failed:', err);
        // Even if API fail kare, stores clear kar do
        this.authStoreService.logout();
        this.userStoreService.clearCurrentUser();
      }
    });
  }

  //go to home page
  goToHome() {
    this.router.navigate(['/home']);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const clickedInside = target.closest('.profile-panel') || target.closest('.user-avatar');
    if (!clickedInside) {
      this.isProfileOpen = false;
    }
  }

  //go to browse item page
  goToBrowseItem() {
    this.router.navigate(['browseItem']);
    window.scrollTo(0, 0);
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
       const message =  "Please complete your profile before adding an item.";
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


      
  //go to Admin Dashboard page
  goToAdminDashboard() {
    this.router.navigate(['adminDashboard']);
    window.scrollTo(0, 0);
  }

  //go to User Dashboard page
  goToUserDashboard() {
    this.router.navigate(['userDashboard']);
    window.scrollTo(0, 0);
  }

  //go to Profile page
  goToProfile() {
    this.router.navigate(['profile']);
    window.scrollTo(0, 0);
  }
  

}
