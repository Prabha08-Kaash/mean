import { Component } from '@angular/core';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
@Component({
  selector: 'app-private-policy',
  standalone: true,
  imports: [Header, Footer],
  templateUrl: './private-policy.html',
  styleUrl: './private-policy.scss'
})

export class PrivatePolicy {
  small1 = 'images/private-policy3.jpg';
  small2 = 'images/private-policy2.jpg';
  small3 = 'images/private-policy4.jpg';
  main = 'images/private-policy1.jpg';
}
