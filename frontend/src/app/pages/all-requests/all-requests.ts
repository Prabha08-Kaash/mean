import { Component, OnInit } from '@angular/core';
import { Header } from '../../components/header/header'
import { CommonModule } from '@angular/common';
import { RentService } from '../../services/rent.service';
import { Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';
@Component({
  selector: 'app-all-requests',
  standalone: true,
  imports: [CommonModule, Header],
  templateUrl: './all-requests.html',
  styleUrl: './all-requests.scss'
})
export class AllRequests implements OnInit {
  userRequests: any[] = []
  ownerRequests: any[] = []

  constructor(
    private router: Router,
    private toast: ToastService,
    private rentService: RentService,
  ) { }

  ngOnInit() {

    // get all the request send by the user
    this.rentService.getAllRequestsByUsers().subscribe({
      next: (res: any) => {
        this.userRequests = res.data;
      },
      error: (err) => {
        console.error(err);
        this.toast.showError(err.error?.message);
      },
    });

        // get all request for the owner
  this.rentService.getAllRequestsForOwners().subscribe({
      next: (res: any) => {
        this.ownerRequests = res.data;
      },
      error: (err) => {
        console.error(err);
        this.toast.showError(err.error?.message);
      },
    });

  }

// go to item detail page
  goToItemDetail(itemId: string) {
    this.router.navigate(['itemDetail', itemId]);
    window.scrollTo(0, 0);
  }

}
