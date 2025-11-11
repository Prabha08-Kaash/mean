import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../../components/header/header';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { UserStoreService } from '../../services/user-store.service';
import { LocationService } from '../../services/location.service';
import { Footer } from '../../components/footer/footer';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-update-profile',
  imports: [CommonModule, Header, ReactiveFormsModule, Footer],
  standalone: true,
  templateUrl: './update-profile.html',
  styleUrl: './update-profile.scss'
})

export class UpdateProfile implements OnInit {
  profileForm!: FormGroup;
  changePasswordForm!: FormGroup;


  previewImage: string | ArrayBuffer | null = null;
  userId: string | null = null;
  isAdmin = false;
  currentUserData: any = null;
  items: any[] = []

  states: { id: number, name: string, iso2: string }[] = [];
  cities: { id: number, name: string }[] = [];
  pincodes: string[] = [];

  selectedStateCode: string = '';
  selectedCity: string = '';
  selectedPincode: string = '';

  message: string = '';
  success: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService,
    private route: ActivatedRoute,
    public userStoreService: UserStoreService,
    private locationService: LocationService,
    private authService: AuthService,
    private toast: ToastService,
  ) { }

  ngOnInit() {
    this.loadCurrentUser();
    this.initializeForms();
    this.loadLocationData();
    this.handleEditMode();
  }

  capitalizeFirstLetter(controlName: string) {
    const control = this.profileForm.get(controlName);
    const value = control?.value;
    if (value && typeof value === 'string') {
      const formatted = value.charAt(0).toUpperCase() + value.slice(1);
      control?.setValue(formatted, { emitEvent: false });
    }
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
    this.currentUserData = user;
  }


  // initialize both form
  private initializeForms() {
    this.profileForm = this.fb.group({
      name: [''],
      email: [''],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/), Validators.maxLength(10)]],
      location: ['', [Validators.required, Validators.maxLength(40)]],
      state: ['', Validators.required],
      city: ['', Validators.required],
      pincode: ['', Validators.required],
      photo: [null],
      role: ['role'],
      bio: ['', [Validators.maxLength(150)]],
    });

    this.changePasswordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required]],
      confirmPassword: ['', Validators.required]
    });
  }

  // Load states
  private loadLocationData() {
    this.locationService.getStates().subscribe({
      next: res => (this.states = res.data),
      error: err => console.error(err)
    });
  }

  // ✅ Check if admin editing other user or user editing themselves
  private handleEditMode() {
    this.route.paramMap.subscribe(params => {
      this.userId = params.get('id');
      const currentUser = this.currentUserData;
      const isOwnProfile = !this.userId || this.userId === currentUser._id.toString();
      this.isAdmin = currentUser?.role === 'admin' && !isOwnProfile;

      if (this.isAdmin && this.userId) {
        this.loadTargetUserForAdmin();
      } else {
        this.populateForm(currentUser);
      }
    });
  }

  // If admin is editing another user
  private loadTargetUserForAdmin() {
    const storeUser = this.userStoreService.getUserById(this.userId!);

    if (storeUser) {
      this.populateForm(storeUser);
    } else {
      this.userService.getUserById(this.userId!).subscribe({
        next: res => {
          this.userStoreService.updateUser(res.data);
          localStorage.setItem('editingUser', JSON.stringify(res.data));
          this.populateForm(res.data);
        },
        error: err => console.error(err),
      });
    }

    // Fallback after refresh
    const cachedUser = localStorage.getItem('editingUser');
    if (cachedUser) {
      const parsed = JSON.parse(cachedUser);
      if (parsed._id === this.userId) this.populateForm(parsed);
    }
  }

  // ✅ Fill form with user data
  private populateForm(user: any) {
    if (!user) return;

    this.profileForm.patchValue({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      state: user.state,
      city: user.city,
      pincode: user.pincode,
      location: user.location || '',
      bio: user.bio || '',
    });

    this.previewImage = user.photo || null;
    this.selectedPincode = user.pincode;

    if (user.state) {
      this.locationService.getCities(user.state).subscribe((res: any) => {
        this.cities = res.data;
        this.selectedStateCode = user.state;
        this.selectedCity = user.city;

        if (user.city) {
          this.locationService.getPincode(user.city).subscribe((res: any) => {
            this.pincodes = res.pincodes;
          });
        }
      });
    }
  }

  // Helper methods
  getStateName(code: string): string {
    const state = this.states.find(s => s.iso2 === code);
    return state ? state.name : code;
  }

  onStateChange(event: any) {
    const code = event.target.value;
    this.selectedStateCode = code;
    if (code) {
      this.locationService.getCities(code).subscribe(res => {
        this.cities = res.data;
      });
    } else {
      this.cities = [];
      this.pincodes = [];
    }
  }

  onCityChange(event: any) {
    const city = event.target.value;
    this.selectedCity = city;
    if (city) {
      this.locationService.getPincode(city).subscribe(res => {
        this.pincodes = res.pincodes;
      });
    } else {
      this.profileForm.patchValue({ pincode: '' });
    }
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {

      this.profileForm.patchValue({ photo: file });

      const reader = new FileReader();
      reader.onload = () => {
        this.previewImage = reader.result;   // base64 preview
      };
      reader.readAsDataURL(file);
    }
  }

  //save profile
  saveProfile() {
    if (!this.profileForm.valid) return;

    const formData = new FormData();
    Object.keys(this.profileForm.value).forEach((key) => {
      if (key !== 'photo') {   // ✅ skip photo here
        formData.append(key, this.profileForm.value[key]);
      }
    });

    const photoFile = this.profileForm.get("photo")?.value;
    if (photoFile) {
      formData.append("photo", photoFile);
    }

    const currentUser = this.userStoreService.getCurrentUser()();
    if (!currentUser) {
      alert("Session expired! Please log in again.");
      this.router.navigate(['/login']);
      return;
    }

    const targetUserId = this.userId || currentUser._id;

    this.userService.updateUser(targetUserId, formData).subscribe({
      next: (res: any) => {
        const updatedUser = res.data;
        this.userStoreService.updateUser(updatedUser);
        this.populateForm(updatedUser);

        if (currentUser && currentUser._id === updatedUser._id) {
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          this.userStoreService.setCurrentUser(updatedUser);
        }

        // If admin updated another user, also save to editingUser
        if (this.isAdmin && this.userId) {
          localStorage.setItem('editingUser', JSON.stringify(updatedUser));
        }

        this.toast.showSuccess(res.message);

        // ✅ Redirect logic after successful profile update
        const redirectTo = this.authService.redirectAfterProfileComplete;

        if (redirectTo === 'addItem') {
          // Clear flag and navigate to Add Item
          this.authService.redirectAfterProfileComplete = null;
          this.router.navigate(['/addItem']).then(() => window.scrollTo(0, 0));

        } else {
          // Normal redirect for profile editing
          this.router.navigate(['/profile']).then(() => {
            // 🟢 Scroll to top after navigation
            window.scrollTo(0, 0);
          });
        }
      },
      error: (err) => {
        console.error(err);
        // ✅ Directly show error message in toast (no const)
        this.toast.showError(err.error?.message);
      },
    });
  }

  //save password submit
  onSubmit() {
    if (this.changePasswordForm.invalid) return;

    const { currentPassword, newPassword, confirmPassword } = this.changePasswordForm.value;
    if (newPassword !== confirmPassword) {
      this.message = 'New password and confirm password do not match.';
      this.success = false;
      return;
    }

    // ✅ Call AuthService
    this.authService.changePassword(currentPassword, newPassword).subscribe({
      next: (res: any) => {
        this.toast.showSuccess(res.message);
        this.success = true;
        this.changePasswordForm.reset();
      },
      error: (err: any) => {
        this.toast.showError(err.error?.message);
        this.success = false;
      }
    });
  }

}
