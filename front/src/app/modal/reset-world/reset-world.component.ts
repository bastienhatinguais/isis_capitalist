import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { WebserviceService } from 'src/app/webservice.service';

@Component({
  selector: 'app-reset-world',
  templateUrl: './reset-world.component.html',
  styleUrls: ['./reset-world.component.css'],
})
export class ResetWorldComponent {
  constructor(
    public wsService: WebserviceService,
    private dialogRef: MatDialogRef<ResetWorldComponent>
  ) {}

  close() {
    this.dialogRef.close();
  }

  resetWorld() {
    this.wsService.resetWorld().then(() => {
      window.location.reload();
    });
  }
}
