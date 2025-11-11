import { Injectable, signal, computed } from '@angular/core';
import { CategoryService } from './category.service';
@Injectable({
  providedIn: 'root'
})
export class CategoryStoreService {
  // ✅ signal banaya (state hold karega)
  private categories = signal<any[]>([]);

  // ✅ agar derived/computed value chahiye toh use computed()
  totalCategories = computed(() => this.categories().length);

  constructor(private categoryService: CategoryService) { }

  // ✅ saari categories set karne ke liye
  setCategories(categories: any[]) {
    this.categories.set(categories);
  }

  // ✅ ek category add karne ke liye
  addCategory(category: any) {
    this.categories.update(current => [...current, category]);
  }

  // ✅ ek category update karne ke liye
  updateCategory(updated: any) {
    this.categories.update(current =>
      current.map(cat => cat._id === updated._id ? updated : cat)
    );
  }

  // ✅ ek category delete karne ke liye
  deleteCategory(categoryId: string) {
    this.categories.update(current =>
      current.filter(cat => cat._id !== categoryId)
    );
  }

  getCategories() {
    return this.categories;
  }

  getCategoryById(id: string) {
    return this.categories().find(cat => cat._id === id);
  }

}
