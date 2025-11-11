import { Component } from '@angular/core';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
@Component({
  selector: 'app-about',
  standalone: true,
  imports: [Header, Footer],
  templateUrl: './about.html',
  styleUrl: './about.scss'
})
export class About {
  main = 'images/about.jpg';
}
