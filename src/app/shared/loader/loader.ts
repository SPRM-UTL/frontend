import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoaderService } from '../../services/loader.service';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loader.html',
  styleUrl: './loader.css'
})
export class LoaderComponent implements OnInit {

  visible = false;

  constructor(private loaderService: LoaderService) { }

  ngOnInit(): void {

    this.loaderService.loading$
      .subscribe((loading) => {

        this.visible = loading;
      });
  }
}