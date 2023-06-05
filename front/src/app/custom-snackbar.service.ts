import { Injectable, NgZone } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from './snackbar/snackbar.component';

@Injectable({
  providedIn: 'root',
})
export class CustomSnackbarService {
  constructor(private _snackBar: MatSnackBar, private zone: NgZone) {}

  public open(message = '', action = 'success', duration = 50000) {
    this.zone.run(() => {
      this._snackBar.openFromComponent(SnackbarComponent, {
        duration: duration,
        data: { message: message, action: action },
      });
    });
  }
}
