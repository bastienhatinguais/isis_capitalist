import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Palier } from '../../model/palier';
import { World } from '../../model/world';
import { WebserviceService } from '../../webservice.service';

@Component({
  selector: 'app-modal-manager',
  templateUrl: './manager.component.html',
  styleUrls: ['./manager.component.css'],
})
export class ManagerComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { world: World; server: string },
    public wsService: WebserviceService
  ) {}

  hireManager(manager: Palier) {
    if (this.data.world.money >= manager.seuil) {
      this.data.world.money -= manager.seuil;
      manager.unlocked = true;
      this.data.world.products[manager.idcible - 1].managerUnlocked = true;
      this.wsService
        .engagerManager(manager.name)
        .catch((error) => console.log(error));
    }
  }
}
