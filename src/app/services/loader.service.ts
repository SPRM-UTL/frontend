import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  private loading = new BehaviorSubject<boolean>(false);
  private requestCount = 0;

  loading$ = this.loading.asObservable();

  show() {
    this.requestCount++;
    if (this.requestCount === 1) {
      this.loading.next(true);
    }
  }

  hide() {
    this.requestCount--;
    if (this.requestCount <= 0) {
      this.requestCount = 0;
      this.loading.next(false);
    }
  }
}
