import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Palier } from 'src/app/model/palier';
import { World } from 'src/app/model/world';
import { WebserviceService } from 'src/app/webservice.service';

@Component({
  selector: 'app-angel',
  templateUrl: './angel.component.html',
  styleUrls: ['./angel.component.css'],
})
export class AngelComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { world: World; server: string },
    private wsService: WebserviceService
  ) {}

  angelToClaim =
    Math.floor(150 * Math.sqrt(this.data.world.score / Math.pow(10, 15))) -
    this.data.world.totalangels;

  resetWorld() {
    this.wsService.resetWorld().then(() => {
      window.location.reload();
    });
    //   if (this.data.world.money >= upgrade.seuil) {
    //     this.wsService
    //       .acheterCashUpgrade(upgrade)
    //       .catch((error: any) => console.log(error));
    //     console.log('Emit notify');
    //     this.notifyBuyCashUpgrade.emit(upgrade);
    //   }
  }
}
