import { CommonModule } from '@angular/common';
import { Component, OnInit, effect } from '@angular/core';
import { Header } from '../../components/header/header';
import { ItemService } from '../../services/item.service';
import { Router } from '@angular/router';
import { ItemStoreService } from '../../services/item-store-service';
import { UserStoreService } from '../../services/user-store.service';
import { RentService } from '../../services/rent.service';
import { ProofModal } from '../../modal/delivery-modal/proof-modal';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-user-dashboard',
  imports: [CommonModule, Header, ProofModal,],
  standalone: true,
  templateUrl: './user-dashboard.html',
  styleUrl: './user-dashboard.scss'
})

export class UserDashboard implements OnInit {
  items: any[] = []
  userRequests: any[] = [];
  myRequests: any[] = [];
  currentUserId: string | null = null;
  isProofModalOpen = false;
  currentRequestId = '';
  receiverEmail = '';
  modalActionType: 'delivery' | 'return' = 'delivery';

  openProofModal(type: 'delivery' | 'return') {
    this.modalActionType = type;
    this.currentRequestId = '123'; // your real request id
    this.receiverEmail = type === 'delivery' ? 'renter@mail.com' : 'owner@mail.com';
    this.isProofModalOpen = true;
  }

  constructor(
    private router: Router,
    private itemService: ItemService,
    private itemStoreService: ItemStoreService,
    public userStoreService: UserStoreService,
    private rentService: RentService,
    private toast: ToastService
  ) {
    //fetch items from storedItems if available
    effect(() => {
      const allItems = this.itemStoreService.items();
      this.items = allItems.filter(item => item.owner?._id === this.currentUserId);
    });
  }

  ngOnInit() {
    this.loadCurrentUser()
    this.loadRequests();
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
    this.currentUserId = user._id;
  }

  loadRequests() {
    if (!this.currentUserId) return;
    this.rentService.getRequestsForOwner(this.currentUserId).subscribe({
      next: (res) => {
        this.userRequests = res.data.filter((req: any) => req.itemId !== null);
      },
      error: (err) => console.error(err)
    });

    this.rentService.getRequestsByUser(this.currentUserId).subscribe({
      next: (res: any) => {
        this.myRequests = res.data.filter((req: any) => req.itemId !== null);
      },
      error: (err) => console.error(err)
    });

    // Restore active tab from localStorage
    const savedTab = localStorage.getItem('activeDashboardTab');
    if (savedTab) {
      setTimeout(() => {
        const tabTrigger = document.querySelector(`[data-bs-target="${savedTab}"]`) as HTMLElement;
        if (tabTrigger) tabTrigger.click();
      }, 0);
    }

    // Listen for tab change and store it in localStorage
    setTimeout(() => {
      const tabButtons = document.querySelectorAll('[data-bs-toggle="tab"]');
      tabButtons.forEach(btn => {
        btn.addEventListener('shown.bs.tab', (event: any) => {
          const target = event.target.getAttribute('data-bs-target');
          if (target) localStorage.setItem('activeDashboardTab', target);
        });
      });
    }, 0);

  }

  //update userRequest status from pending to approved or rejected with instant button hide
  acceptRequest(requestId: string) {
    // 🔹 frontend turant update
    this.userRequests = this.userRequests.map(r =>
      r._id === requestId ? { ...r, status: 'Active' } : r
    );

    // 🔹 backend call async
    this.rentService.updateRequestStatus(requestId, 'Active').subscribe({
      next: (res) =>{
console.log('Request approved on server:', res.data)
              this.toast.showSuccess("You approved request")
      },
      
      
      error: (err) => {
        console.error('Error approving request:', err);
        // rollback agar fail ho jaye
        this.userRequests = this.userRequests.map(r =>
          r._id === requestId ? { ...r, status: 'Pending' } : r
        );
        this.toast.showError("Failed to approve request")
      }
    });
  }

  rejectRequest(requestId: string) {
    // 🔹 frontend turant update
    this.userRequests = this.userRequests.map(r =>
      r._id === requestId ? { ...r, status: 'Rejected' } : r
    );

    // 🔹 backend call async
    this.rentService.rejectRequest(requestId).subscribe({
      next: (res) => {
console.log('Request rejected on server:', res)
              this.toast.showSuccess("You reject request")

      },
      error: (err) => {
        console.error('Error rejecting request:', err);
        // rollback agar fail ho jaye
        this.userRequests = this.userRequests.map(r =>
          r._id === requestId ? { ...r, status: 'Pending' } : r
        );
        this.toast.showError("Failed to reject request")
      }
    });
  }

  updateRequestAfterProof(requestId: string, actionType: 'delivery' | 'return') {
  this.userRequests = this.userRequests.map(r =>
    r._id === requestId
      ? { ...r, status: actionType === 'delivery' ? 'delivered' : 'returned' }
      : r
  );
}


 //Delete item
  onDeleteItem(itemId: string) {
      this.itemService.deleteItem(itemId).subscribe({
        next: (res) => {
          this.items = this.items.filter(item => item._id !== itemId);

          setTimeout(() => {
            this.toast.showSuccess(res.message || "Item deleted successfully")
          }, 500);
        },
        error: (err) => console.error
      })
    }
  

  // Delete request (owner or user)
  deleteRequest(requestId: string, type: 'owner' | 'renter') {
    this.rentService.deleteRequest(requestId).subscribe({
      next: (res: any) => {

        // 🔹 Store & UI update
        if (type === 'owner') {
          this.userRequests = this.userRequests.filter(r => r._id !== requestId);
        } else {
          this.myRequests = this.myRequests.filter(r => r._id !== requestId);
        }

      },
      error: (err) => {
        console.error("Failed to delete request:", err);
this.toast.showError("Failed to delete request")
      }
    });
  }

  //go to Profile page
  goToProfile(profileId: string) {
    this.router.navigate(['profile', profileId])
    window.scrollTo(0, 0);
  }

  //go to Update Profile  page
  goToUpdateProfile() {
    this.router.navigate(['updateProfile']);
    window.scrollTo(0, 0);
  }

  //go to item detail page
  goToItemDetail(itemId: string) {
    this.router.navigate(['itemDetail', itemId])
    window.scrollTo(0, 0);
  }

}
