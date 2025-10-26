import {Injectable, signal, WritableSignal} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LayoutingService {
  public showBottomNavbar: WritableSignal<boolean> = signal(true);
  constructor() { }
}
