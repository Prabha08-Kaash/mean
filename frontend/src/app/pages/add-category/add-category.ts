import { CommonModule } from '@angular/common';
import { Component, effect, OnInit } from '@angular/core';
import { Header } from '../../components/header/header';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { CategoryService } from '../../services/category.service';
import { ActivatedRoute } from '@angular/router';
import { CategoryStoreService } from '../../services/category-store-service';
import { Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';
@Component({
  selector: 'app-add-category',
  standalone: true,
  imports: [CommonModule, Header, ReactiveFormsModule],
  templateUrl: './add-category.html',
  styleUrl: './add-category.scss'
})

export class AddCategory implements OnInit {
  categoryForm!: FormGroup;
  categoryId: string | null = null;
  isEditForm = false

  constructor(private fb: FormBuilder,
    private router: Router,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private categoryStoreService: CategoryStoreService,
    private toast: ToastService,
  ) { }

  ngOnInit() {
    //  Create Form
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      icon: ['', Validators.required],
    })

    // Get Category ID from URL (if editing)
    this.route.paramMap.subscribe(params => {
      this.categoryId = params.get('id');
    })

    if (this.categoryId) {
      this.isEditForm = true;

      // ✅ Check if category exists in Store
      const storeCategory = this.categoryStoreService.getCategoryById(this.categoryId);

      if (!storeCategory) {
        //  Fetch from backend if not found in store
        this.categoryService.getCategoryById(this.categoryId).subscribe({
          next: (res) => {
            this.categoryStoreService.addCategory(res.data);
          },
          error: (err) => console.error(err)
        })
      }
    }
  }

  // ✅ Auto-update form if category data changes
  categoryEffect = effect(() => {
    if (this.categoryId && this.isEditForm) {
      const storeCategories = this.categoryStoreService.getCategories()();
      const storeCategory = storeCategories.find(c => c._id === this.categoryId);

      if (storeCategory) {
        this.categoryForm.patchValue({
          name: storeCategory.name,
          description: storeCategory.description,
          icon: storeCategory.icon
        });
      }

    }
  })


  saveCategory() {

    if (this.isEditForm && this.categoryId) {
      //  Update existing category
      this.categoryService.updateCategory(this.categoryId, this.categoryForm.value).subscribe({
        next: (res) => {
          this.categoryStoreService.updateCategory(res.data);
          this.router.navigate(['adminDashboard'])
          this.toast.showSuccess(res.message);
        },
        error: (err) => {
          console.error(err);
          this.toast.showError(err.error?.message);
        },
      })
    } else {
      this.categoryService.addCategory(this.categoryForm.value).subscribe({
        // Add new category
        next: (res) => {
          this.categoryStoreService.addCategory(res.data);
          this.router.navigate(['adminDashboard'])
          this.categoryForm.reset()
          this.toast.showSuccess(res.message)
        },
        error: (err) => {
          console.error(err);
          this.toast.showError(err.error?.message);
        },
      })
    }

  }

}
