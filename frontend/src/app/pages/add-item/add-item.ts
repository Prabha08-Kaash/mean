import { CommonModule } from '@angular/common';
import { Component, OnInit, effect } from '@angular/core';
import { Header } from '../../components/header/header';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ItemService } from '../../services/item.service';
import { CategoryService } from '../../services/category.service';
import { UserStoreService } from '../../services/user-store.service';
import { ActivatedRoute } from '@angular/router';
import { ItemStoreService } from '../../services/item-store-service';
import { CategoryStoreService } from '../../services/category-store-service';
import { Router } from '@angular/router';
import { LocationService } from '../../services/location.service';
import { Footer } from '../../components/footer/footer';
import { ToastService } from '../../services/toast.service';



@Component({
  selector: 'app-add-item',
  standalone: true,
  imports: [CommonModule, Header, ReactiveFormsModule, Footer],
  templateUrl: './add-item.html',
  styleUrls: ['./add-item.scss']
})

export class AddItem implements OnInit {
  itemForm!: FormGroup;
  categories: any[] = [];
  itemId: string | null = null;
  previewImage: string | ArrayBuffer | null = null;
  isEditForm = false;
  selectedCategoryName: string | null = null;
selectedCategoryId: string | null = null;
conditions: string[] = ['New', 'Used - Like New', 'Used - Good', 'Used - Fair'];
selectedCondition: string | null = null;
selectedUnit: string = ''; 


  constructor(
    private fb: FormBuilder,
    private itemService: ItemService,
    private categoryService: CategoryService,
    private userStoreService: UserStoreService,
    private route: ActivatedRoute,
    private router: Router,
    private itemStoreService: ItemStoreService,
    private categoryStoreService: CategoryStoreService,
    private locationService: LocationService,
    private toast: ToastService
  ) {
    effect(() => {
      this.categories = this.categoryStoreService.getCategories()();
    });


  }

  ngOnInit() {
    this.initializeForm();
    this.loadCategories();
    this.checkForEditMode();

  }

  capitalizeFirstLetter(controlName: string) {
    const control = this.itemForm.get(controlName);
    const value = control?.value;

    if (value && typeof value === 'string' && value.trim() !== '') {
      const formatted = value.charAt(0).toUpperCase() + value.slice(1);
      control?.setValue(formatted, { emitEvent: false });
    } else if (value === null) {
      control?.setValue('', { emitEvent: false });
    }
  }

  selectCategory(category: any) {
  this.selectedCategoryName = category.name;
  this.selectedCategoryId = category._id;
  this.itemForm.get('category')?.setValue(category._id);
}

// Add this method:
selectCondition(condition: string) {
  this.selectedCondition = condition;
  this.itemForm.get('itemCondition')?.setValue(condition);
}

selectUnit(unit: string) {
  this.selectedUnit = unit;
  this.itemForm.get('unit')?.setValue(unit); // update form value
}



  // Initialize item form with validators
  private initializeForm() {
    this.itemForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(25)]],
      description: ['', [Validators.maxLength(200)]],
      category: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(1)]],
      photo: [null, Validators.required],
      unit: ['', Validators.required],
      itemCondition: ['', Validators.required],
      additionalDetails: ['', [Validators.maxLength(500)]],
    });
  }

  // Load categories (from store or backend)
  private loadCategories() {
    const storedCategories = this.categoryStoreService.getCategories()();
    if (storedCategories.length === 0) {
      this.categoryService.getCategories().subscribe({
        next: (res: any) => this.categoryStoreService.setCategories(res),
  error: (err) => {
        console.error(err);
        // ✅ Directly show error message in toast (no const)
        this.toast.showError(err.error?.message);
      },
          });
    }
  }

  // Check whether form is for editing or adding
  private checkForEditMode() {
    this.route.paramMap.subscribe((params) => {
      this.itemId = params.get('id');
      if (!this.itemId) return;
      this.isEditForm = true;

      const localItem = this.itemStoreService.getItemById(this.itemId);
      if (localItem) {
        this.populateForm(localItem);
      } else {
        this.itemService.getItemById(this.itemId).subscribe({
          next: (res: any) => {
            this.itemStoreService.addItem(res.data);
            this.populateForm(res.data);
          },
  error: (err) => {
        console.error(err);
        this.toast.showError(err.error?.message);
      },        });
      }
    });
  }

  // Populate form with item data
  private populateForm(item: any) {
    if (!item) return;

    this.itemForm.patchValue({
      title: item.title,
      description: item.description || '',
      category: item.category?._id || '',
      price: item.price,
      unit: item.unit,
      itemCondition: item.itemCondition,
      additionalDetails: item.additionalDetails || ''
    });

      // ✅ Show dropdown values
  this.selectedCategoryName = item.category?.name
  this.selectedCondition = item.itemCondition;
  this.selectedUnit = item.unit;
    this.previewImage = item.photo || null;
  }

  // File selection preview
  onFileChange(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.itemForm.patchValue({ photo: file });
    const reader = new FileReader();
    reader.onload = () => {
      this.previewImage = reader.result;
    };
    reader.readAsDataURL(file);
  }

  // Submit handler for both Add and Edit
  onSubmit() {

    const formData = new FormData();
    Object.keys(this.itemForm.value).forEach((key) => {
      if (key !== 'photo') {   // skip photo here
        formData.append(key, this.itemForm.value[key]);
      }
    });

    const currentUser = this.userStoreService.getCurrentUser()();
    if (currentUser._id) formData.append("owner", currentUser._id);

    const photoFile = this.itemForm.get("photo")?.value;
    if (photoFile) formData.append("photo", photoFile);


    if (this.isEditForm && this.itemId) {
      this.updateItem(formData);
    } else {
      this.addItem(formData);
    }
  }

  // ✅ Separate function for updating item
  private updateItem(formData: FormData) {
    this.itemService.updateItem(this.itemId!, formData).subscribe({
      next: (res: any) => {
        this.itemStoreService.updateItem(res.data);
        this.itemStoreService.refreshItems()
        this.toast.showSuccess(res.message || 'Item updated successfully.');
        this.router.navigate(['userDashboard']);
      },
  error: (err) => {
        console.error(err);
        this.toast.showError(err.error?.message);
      },  
      });
  }

  // ✅ Separate function for adding item
  private addItem(formData: FormData) {
    this.itemService.addItems(formData).subscribe({
      next: (res: any) => {
        this.itemStoreService.addItem(res.data);
        this.itemStoreService.refreshItems()

        this.toast.showSuccess(res.message || 'Item added successfully.');
        this.router.navigate(['userDashboard']);
      },
  error: (err) => {
        console.error(err);
        this.toast.showError(err.error?.message);
      },
        });
  }

}

