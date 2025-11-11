import { Component, effect, OnInit } from '@angular/core';
import { Header } from '../../components/header/header'
import { CommonModule } from '@angular/common';
import { CategoryService } from '../../services/category.service';
import { ItemService } from '../../services/item.service';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { ItemStoreService } from '../../services/item-store-service';
import { CategoryStoreService } from '../../services/category-store-service';
import { UserStoreService } from '../../services/user-store.service';
import { AuthStoreService } from '../../services/auth-store.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, Header],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss'
})
export class AdminDashboard implements OnInit {
  categories: any[] = []
  items: any[] = []
  users: any[] = []

  constructor(
    private router: Router,
    private categoryService: CategoryService,
    private itemService: ItemService,
    private userService: UserService,
    private itemStoreService: ItemStoreService,
    private categoryStoreService: CategoryStoreService,
    private userStoreService: UserStoreService,
    private authStoreService: AuthStoreService,
    private toast: ToastService,
  ) {

    //fetch categories from storedCategories if available
    effect(() => {
      this.categories = this.categoryStoreService.getCategories()()
    })

    //fetch items from storedItems if available
    effect(() => {
      this.items = this.itemStoreService.items()
      if (this.categories.length > 0 && this.items.length > 0) {
      }
    })

    //fetch user from storedItems if available
    effect(() => {
      this.users = this.userStoreService.getUser()();
    })

  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    // CATEGORY
    const storedCategories = this.categoryStoreService.getCategories()();
    if (storedCategories.length === 0) {
      this.categoryService.getCategories().subscribe({
        next: (res) => this.categoryStoreService.setCategories(res),
        error: (err) => console.error("Error fetching categories:", err),
      });
    }

    // ITEMS
    const storedItems = this.itemStoreService.getItems()();
    if (storedItems.length === 0) {
      this.itemService.getItems().subscribe({
        next: (res) => this.itemStoreService.setItems(res.data),
        error: (err) => console.error(err),
      });
    }

    // USERS
    const storedUsers = this.userStoreService.getUser()();
    if (storedUsers.length === 0) {
      this.userService.getUser().subscribe({
        next: (res) => this.userStoreService.setUsers(res.data),
        error: (err) => console.error(err),
      });
    }

  }

  //delete user
  onDeleteUser(userId: string) {

      this.userService.deleteUser(userId).subscribe({
        next: (res) => {
          this.users = this.users.filter(user => user._id !== userId);
          const currentUser = this.userStoreService.getCurrentUser()(); // signal ki value access

          if(currentUser && currentUser.role !== 'admin'){
                      this.authStoreService.logout();

 if (currentUser?._id) {
            this.userStoreService.removeUser(currentUser._id); // userId pass karo
          }

          }
         
          setTimeout(() => {
            this.toast.showSuccess(res.message || "User deleted Successfully")
          }, 500);

        },
        error: (err) => {
          console.error(err);
          this.toast.showError(err.error?.message);
        }
      })
    
  }

  onDeleteItem(itemId: string) {
  
      this.itemService.deleteItem(itemId).subscribe({
        next: (res) => {
          this.items = this.items.filter(item => item._id !== itemId);

          setTimeout(() => {
            this.toast.showSuccess(res.message || "Item deleted Successfully")
          }, 500);

        },
        error: (err) => {
          console.error(err);
          this.toast.showError(err.error?.message);
        }
      })
    
  }

  onDeleteCategory(categoryId: string) {
      this.categoryService.deleteCategory(categoryId).subscribe({
        next: (res) => {
          this.categories = this.categories.filter(category => category._id !== categoryId);

          setTimeout(() => {
            this.toast.showSuccess(res.message || "Category deleted Successfully")
          }, 500);

        },
   error: (err) => {
        console.error(err);
        this.toast.showError(err.error?.message);
      },      })
    
  }


  create() {
    this.router.navigate(['createCategory']);
    window.scrollTo(0, 0);
  }

  goToAllRequests() {
    this.router.navigate(['allRequests']);
    window.scrollTo(0, 0);
  }

  goToProfile(profileId: string) {
    this.router.navigate(['profile', profileId])
    window.scrollTo(0, 0);
  }

  //navigation to update user
  goToUpdateUser(userId: string) {
    this.router.navigate(['edit-updateProfile', userId]);
    window.scrollTo(0, 0);
  }

  //navigation to update item
  goToUpdateItem(itemId: string) {
    this.router.navigate(['edit-item', itemId]);
    window.scrollTo(0, 0);
  }

  //go to item detail page
  goToItemDetail(itemId: string) {
    this.router.navigate(['itemDetail', itemId])
    window.scrollTo(0, 0);
  }

  //category
  goToUpdateCategory(categoryId: string) {
    this.router.navigate(['createCategory', categoryId]);
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

  getItemCountByCategory(categoryId: string): number {
    return this.items.filter(item => item.category?._id === categoryId).length;
  }


}


