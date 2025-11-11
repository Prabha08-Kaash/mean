import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class Footer {

  constructor(private router:Router){}

goToPrivatePolicy() {
    this.router.navigate(['private-policy']);
    window.scrollTo(0, 0);
  }

  goToAbout() {
    this.router.navigate(['about']);
    window.scrollTo(0, 0);
  }

  goToContactUs() {
    this.router.navigate(['contact-us']);
    window.scrollTo(0, 0);
  }
  
}
