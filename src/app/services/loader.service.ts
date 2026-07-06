import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  private loading = new BehaviorSubject<boolean>(false);
  private playSound = new BehaviorSubject<boolean>(false);
  private requestCount = 0;

  loading$ = this.loading.asObservable();
  playSound$ = this.playSound.asObservable();

  show(withSound: boolean = false) {
    this.requestCount++;
    if (this.requestCount === 1) {
      this.playSound.next(withSound);
      this.loading.next(true);
    }
  }

  hide() {
    this.requestCount--;
    if (this.requestCount <= 0) {
      this.requestCount = 0;
      this.loading.next(false);
      this.playSound.next(false);
    }
  }
}
