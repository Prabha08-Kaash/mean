import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserStoreService } from '../services/user-store.service';

@Injectable({
  providedIn: 'root'
})


@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private router: Router) { }

  canActivate(): boolean {
    const role = localStorage.getItem("role");

    if (role !== "admin") {
      alert("Access Denied: Admins only");
      this.router.navigate(['/auth']);
      return false;
    }
    return true;
  }
}




/*
@Injectable({
  providedIn: 'root'
})
export class ProfileCompleteGuard implements CanActivate {

  constructor(private userStoreService: UserStoreService, private router: Router) { }

  canActivate(): boolean {
    const currentUser = this.userStoreService.getCurrentUser()();
    // ✅ If profile is complete, allow access
    if (currentUser && currentUser.profileCompleted) {
      return true;
    }
    // Else, block and redirect
    else {
      alert('Please complete your profile before adding an item.');
      this.router.navigate(['/updateProfile']);
      return false;
    }
  }

} */

