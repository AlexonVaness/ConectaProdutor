import { Component, Input, OnInit, input } from '@angular/core';
import { IonicSlides } from '@ionic/angular';

@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss'],
})
export class BannerComponent  implements OnInit {

  constructor() { }
  swiperModules = [IonicSlides];
  @Input() bannerImages: any;

  ngOnInit() {}

}
