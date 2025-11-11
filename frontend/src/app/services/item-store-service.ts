import { Injectable, signal, WritableSignal } from '@angular/core';
import { ItemService } from './item.service';
@Injectable({ providedIn: 'root' })
export class ItemStoreService {
  // ✅ All items stored as a signal
  // private items: WritableSignal<any[]> = signal([]);
  items = signal<any[]>([]); // global signal

  constructor(private itemService: ItemService) { }

  // Fetch all items from backend once
  fetchItems() {
    this.itemService.getItems().subscribe({  // increase limit or make API support all
      next: (res) => {

        this.items.set(res.data);

      },
      error: (err) => console.error('❌ Error fetching items:', err)
    });
  }

  refreshItems() {
  this.itemService.getItems().subscribe({
    next: (res) => {
      this.items.set(res.data);
    },
    error: (err) => console.error('❌ Error refreshing items:', err)
  });
}

  // ✅ Set all items (after fetching from backend)
  setItems(items: any[]) {
    this.items.set(items);
  }

  // ✅ Read-only access
  getItems() {
    return this.items;
  }

  // ✅ Add a new item
  addItem(item: any) {
    this.items.update(current => [...current, item]);
  }

  // ✅ Update an existing item
  updateItem(updated: any) {
    this.items.update(current =>
      current.map(i => i._id === updated._id ? updated : i)
    );
  }

  // ✅ Remove an item by ID
  removeItem(itemId: string) {
    this.items.update(current =>
      current.filter(i => i._id !== itemId)
    );
  }

  // ✅ Get a single item by ID
  getItemById(itemId: string) {
    return this.items().find(i => i._id === itemId);
  }
}
