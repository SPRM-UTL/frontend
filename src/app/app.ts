import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<h1>Hola bue2222</h1>'
})
export class App {
  protected readonly title = signal('frontend');
}
