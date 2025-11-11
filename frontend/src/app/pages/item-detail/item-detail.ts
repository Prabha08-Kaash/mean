import { Component, OnInit, effect } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ItemService } from '../../services/item.service';
import { ItemStoreService } from '../../services/item-store-service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserStoreService } from '../../services/user-store.service';
import { LocationService } from '../../services/location.service';
import { FormsModule } from '@angular/forms';
import { RentService } from '../../services/rent.service';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';
import { UpdateProfile } from '../update-profile/update-profile';
@Component({
  selector: 'app-item-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, Footer, Header],
  templateUrl: './item-detail.html',
  styleUrl: './item-detail.scss'
})

export class ItemDetail implements OnInit {
  itemId: string | null = null;
  item: any = null
  currentUser: string | null = null;
  currentUserId: string | null = null;
  states: { id: number, name: string, iso2: string }[] = [];
  selectedDuration: number | null = null;
  durationOptions: number[] = [];
  totalPrice: number = 0;
  currentUserRole: string | null = null;
  myRequests: any[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private itemService: ItemService,
    private itemStoreService: ItemStoreService,
    private userStoreService: UserStoreService,
    private locationService: LocationService,
    private rentService: RentService,
    private toast: ToastService,
    private authService: AuthService
  ) {
    effect(() => {
      const allItems = this.itemStoreService.items() // call signal
      this.item = allItems.find(i => i._id === this.itemId)
    })
  }

  ngOnInit() {
    this.loadCurrentUser();
    this.loadStates()
    this.loadAllRequestsByUsers();
    this.checkForEditMode();
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

    if (user) {
      this.currentUserId = user._id;
      this.currentUserRole = user.role;
    }
  }

  // Load states (from backend)
  loadStates() {
    this.locationService.getStates().subscribe({
      next: (res: any) => this.states = res.data,
      error: (err) => console.error(err)
    });
  }

  private loadAllRequestsByUsers() {

    if (this.currentUserId) {
      this.rentService.getAllRequestsByUsers().subscribe({
        next: (res: any) => {
          this.myRequests = res.data.filter((req: any) => req.itemId !== null);

        },
        error: (err) => console.error(err)
      });
    }

  }

  // helper methods
  getStateName(code: string): string {
    const state = this.states.find(s => s.iso2 === code);
    return state ? state.name : code;
  }

  private checkForEditMode() {

    this.route.paramMap.subscribe(params => {
      this.itemId = params.get('id')

      if (this.itemId) {

        const storedItem = this.itemStoreService.getItemById(this.itemId)
        if (!storedItem) {
          // fetch itemById from backend if not in store
          this.itemService.getItemById(this.itemId).subscribe({
            next: (res) => {
              this.itemStoreService.addItem(res.data);
            },
            error: (err) => console.error(err)
          })
        }
      }
    })

  }

  hasRequest(itemId: string | null): any {
    if (!itemId) return null;

    return this.myRequests.find(req => {
      // Handle both string & object formats safely
      const reqItemId = typeof req.itemId === 'object' ? req.itemId._id : req.itemId;
      return reqItemId === itemId;
    });

  }

  //navigation to update item
  goToItem(itemId: string) {
    this.router.navigate(['edit-item', itemId]);
    window.scrollTo(0, 0);
  }

  //navigation to request for rent to an item
  choooseDuration(itemId: string) {
    this.durationOptions = [];

    //generate options based on unit
    if (this.item.unit === 'hour') {
      for (let i = 1; i <= 23; i++) {
        this.durationOptions.push(i);
      }
    } else {
      for (let i = 1; i <= 30; i++) {
        this.durationOptions.push(i);
      }
    }
  }

  calculateTotal() {
    if (this.selectedDuration && this.item?.price) {
      this.totalPrice = this.selectedDuration * this.item.price
    } else {
      this.totalPrice = 0;
    }
  }

  isItemRequestedByAnotherUser(itemId: string): boolean {
    // Find request for this item
    const request = this.myRequests.find(req => {
      const reqItemId = typeof req.itemId === 'object' ? req.itemId._id : req.itemId;
      return reqItemId === itemId;
    });

    // If no request, exit early
    if (!request) return false;

    //  Owner or admin → skip message
    if (this.item.owner?._id === this.currentUserId || this.currentUserRole === 'admin') return false;

    // If current user IS the renter who made this request → skip message
    // (Also covers both object & string formats for renterId)
    const renterId = typeof request.renterId === 'object' ? request.renterId._id : request.renterId;
    if (renterId === this.currentUserId) return false;

    // Show message only for certain statuses
    const validStatuses = ['Pending', 'Active', 'delivered'];
    return validStatuses.includes(request.status);
  }

  sendRequest() {
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
             

          const message = "Please complete your profile before sending a request.";
          this.toast.showError(message);
          this.router.navigate(['/updateProfile']);
        } else {

          this.SendRequestData()
        }
      },
      error: () => {UpdateProfile
        // ⚠️ If not logged in
        const message = "Please login or register to continue.";
        this.toast.showError(message);

        this.router.navigate(['/auth']);
      }
    });

    window.scrollTo(0, 0);
  }

  SendRequestData() {

    // 1️⃣ Take required data
    const requestData = {
      itemId: this.item._id,
      ownerId: this.item.owner._id,
      renterId: this.currentUserId,
      duration: this.selectedDuration,
      unit: this.item.unit,
      status: 'Pending',
      totalPrice: this.totalPrice
    };

    this.myRequests = [...this.myRequests, requestData];

    //  Send data to backend
    this.rentService.createRequest(requestData).subscribe({
      next: (res) => {

        this.myRequests = this.myRequests.map(req =>
          req.itemId === res.data.itemId ? res.data : req
        );
        this.router.navigate(['/userDashboard']);
        this.toast.showSuccess(res.message);
      },
      error: (err) => {
        console.error('Error creating request:', err);
        alert('somthing wirng!');
      }
    });
  }

}

