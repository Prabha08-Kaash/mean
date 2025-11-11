import { Injectable, signal, WritableSignal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UserStoreService {
  // 🔹 1. Current user (sirf ek banda jo login hua hai)
  private currentUser: WritableSignal<any | null> = signal(null);

  // 🔹 2. Saare users ka list (admin ke liye)
  private users: WritableSignal<any[]> = signal([]);

  constructor() {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUser.set(JSON.parse(storedUser));
    }
  }

  // 🔹 Login ke baad current user save karo
  setCurrentUser(user: any) {
    this.currentUser.set(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  // 🔹 Current user ko read karo (UI me dikhane ke liye)
  getCurrentUser() {
    return this.currentUser;
  }

  // 🔹 Logout ke time clear kar do
  clearCurrentUser() {
    this.currentUser.set(null);
    localStorage.removeItem('currentUser');
  }

   get profileCompleted() {
    const user = this.currentUser();
    return user ? user.profileCompleted : false;
  }
  // ================= All Users Functions =================

  // 🔹 Saare users set karo (jab backend se fetch ho)
  setUsers(users: any[]) {
    this.users.set(users);
  }

  // 🔹 Saare users ko read karo
  getUser() {
    return this.users;
  }

  getUserById(userId: string) {
    return this.users().find(u => u._id === userId)
  }

  // 🔹 Naya user add karo (jaise admin add kare)
  addUser(user: any) {
    this.users.update(current => [...current, user]);
  }

  // 🔹 User update karo (jaise profile update)
  updateUser(updated: any) {
    if (!updated || !updated._id) return;

    this.users.update(current =>
      current.map(u => u._id === updated._id ? updated : u)
    );

    // If updated user is the current user
    const currentUser = this.currentUser();
    if (this.currentUser() && this.currentUser()?._id === updated._id) {
      this.setCurrentUser(updated);
    }
  }

  // 🔹 User delete karo
  removeUser(userId: string) {
    this.users.update(current =>
      current.filter(u => u._id !== userId)
    );

    // Agar delete hone wala banda current user hi tha → logout kar do
    if (this.currentUser() && this.currentUser()?._id === userId) {
      this.clearCurrentUser();
    }
  }
}
