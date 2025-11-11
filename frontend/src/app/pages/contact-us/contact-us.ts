import { Component } from '@angular/core';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
@Component({
  selector: 'app-contact-us',
  imports: [Header, Footer],
  standalone: true,
  templateUrl: './contact-us.html',
  styleUrl: './contact-us.scss'
})

export class ContactUs {
  small1 = 'images/contact1.jpg';
  small2 = 'images/contact2.jpg';
  small3 = 'images/contact3.jpg';
}
