import { Component, Inject, Output, EventEmitter } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Palier } from 'src/app/model/palier';
import { World } from 'src/app/model/world';
import { WebserviceService } from 'src/app/webservice.service';

@Component({
  selector: 'app-angel-upgrade',
  templateUrl: './angel-upgrade.component.html',
  styleUrls: ['./angel-upgrade.component.css'],
})
export class AngelUpgradeComponent {
  @Output() notifyBuyAngelUpgrade = new EventEmitter<Palier>();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { world: World; server: string },
    public wsService: WebserviceService
  ) {}

  buyAngelUpgrade(upgrade: Palier) {
    if (this.data.world.activeangels >= upgrade.seuil) {
      this.notifyBuyAngelUpgrade.emit(upgrade);
      this.wsService.buyAngelUpgrade(upgrade);
    }
  }
}
