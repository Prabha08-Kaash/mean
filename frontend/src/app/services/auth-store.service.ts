import { Injectable, signal } from '@angular/core';
@Injectable({ providedIn: 'root' })

export class AuthStoreService {
  isLoggedIn = signal<boolean>(false);
  role = signal<string | null>(null);
  currentUser = signal<any>(null);

  constructor(
  ) {
    const role = localStorage.getItem('role');
    const user = localStorage.getItem('user');

    if (role && user) {
      this.isLoggedIn.set(true);
      this.role.set(role);
            this.currentUser.set(JSON.parse(user));
    }
  }

  //login or signIn
  loginSuccess(user: any) {
    localStorage.setItem('role', user.role);
    localStorage.setItem('user', JSON.stringify(user));

    this.isLoggedIn.set(true);
    this.role.set(user.role);
     this.currentUser.set(user);
  }


  //logout
  logout() {
      localStorage.clear(); // sab ek saath clear ho jaaye

    localStorage.removeItem('role');
    localStorage.removeItem('user');

    // ✅ very important: remove editing user if any
    localStorage.removeItem('editingUser');

    this.isLoggedIn.set(false);
    this.role.set(null);
    this.currentUser.set(null);
  }
  
}
