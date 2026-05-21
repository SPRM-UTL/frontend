import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './shared/toast/toast';
import { LoaderComponent } from './shared/loader/loader';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent, LoaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App { }
