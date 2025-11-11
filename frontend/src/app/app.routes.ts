import { Routes } from '@angular/router';
import {  AdminGuard } from './guards/auth.guard';

import { Home } from './pages/home/home';
import { BrowseItem } from './pages/browse-item/browse-item';
import { AddItem } from './pages/add-item/add-item';
import { Auth } from './components/auth/auth';
import { AdminDashboard } from './pages/admin-dashboard/admin-dashboard';
import { UserDashboard } from './pages/user-dashboard/user-dashboard';
import { UpdateProfile } from './pages/update-profile/update-profile';
import { ItemDetail } from './pages/item-detail/item-detail';
import { AddCategory } from './pages/add-category/add-category';
import { Profile } from './pages/profile/profile';
import { AllRequests } from './pages/all-requests/all-requests';
import { PrivatePolicy } from './pages/private-policy/private-policy';
import { About } from './pages/about/about';
import { ContactUs } from './pages/contact-us/contact-us';


export const routes: Routes = [
     { path: 'home', component: Home },
       { path: '', redirectTo: 'home', pathMatch: 'full' },  // ✅ Ye line zaroor honi chahiye

     { path: 'browseItem', component: BrowseItem },
     { path: 'auth', component: Auth },
     { path: 'adminDashboard', component: AdminDashboard },
     { path: 'userDashboard', component: UserDashboard },
     { path: 'private-policy', component: PrivatePolicy },
     { path: 'about', component: About },
     { path: 'contact-us', component: ContactUs },
     { path: 'createCategory', component: AddCategory },
     { path: 'createCategory/:id', component: AddCategory },
     { path: 'allRequests', component: AllRequests },
     { path: 'itemDetail/:id', component: ItemDetail },
     { path: 'addItem', component: AddItem}, //for user and admin to add item
     { path: 'edit-item/:id', component: AddItem }, // for user admin update item
     { path: 'profile', component: Profile },
     { path: 'profile/:id', component: Profile },
     { path: 'updateProfile', component: UpdateProfile },// for normal user
     { path: 'edit-updateProfile/:id', component: UpdateProfile } //for admin
];
