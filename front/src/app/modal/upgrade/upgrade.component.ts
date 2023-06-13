import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Palier } from 'src/app/model/palier';
import { World } from 'src/app/model/world';
import { WebserviceService } from 'src/app/webservice.service';

@Component({
  selector: 'app-upgrade',
  templateUrl: './upgrade.component.html',
  styleUrls: ['./upgrade.component.css'],
})
export class UpgradeComponent implements OnInit {
  @Output() notifyBuyCashUpgrade = new EventEmitter<Palier>();

  upgrades: Palier[] = [];
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { world: World; server: string },
    private wsService: WebserviceService
  ) {}

  ngOnInit(): void {
    this.upgrades = [...this.data.world.upgrades];
    this.upgrades.map((u) => {
      u.cibleName =
        u.idcible == 0
          ? 'Tous les produits'
          : this.data.world.products.filter((p) => p.id == u.idcible)[0].name;
    });
  }

  buyCashUpgrade(upgrade: Palier) {
    if (this.data.world.money >= upgrade.seuil) {
      this.wsService
        .acheterCashUpgrade(upgrade)
        .catch((error: any) => console.log(error));
      this.notifyBuyCashUpgrade.emit(upgrade);
    }
  }
}
