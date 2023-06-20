import { ComponentType } from '@angular/cdk/portal';
import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ManagerComponent } from './modal/manager/manager.component';
import { UnlockComponent } from './modal/unlock/unlock.component';
import { Product } from './model/product';
import { World } from './model/world';
import { ProductComponent } from './product/product.component';
import { WebserviceService } from './webservice.service';
import { UpgradeComponent } from './modal/upgrade/upgrade.component';
import { Palier } from './model/palier';
import { AngelComponent } from './modal/angel/angel.component';
import { AngelUpgradeComponent } from './modal/angel-upgrade/angel-upgrade.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  @ViewChildren(ProductComponent)
  productsComponent: QueryList<ProductComponent> = new QueryList();
  title = 'front';
  username = '';
  world: World = new World();
  server = '';
  quantitesAchat = [1, 10, 100, -1];
  quantiteAchatIndex = 0;
  constructor(public service: WebserviceService, public dialog: MatDialog) {}

  ngOnInit() {
    this.username = localStorage.getItem('username') ?? 'Isis';
    localStorage.setItem('username', this.username);
    this.server = this.service.server;
    this.service
      .getWorld()
      .then((world) => {
        this.world = world.data.getWorld;
      })
      .catch((error) => {
        console.error('Erreur lors de la récupération du monde.', error);
      });
  }

  changeQuantiteAchat() {
    this.quantiteAchatIndex =
      (this.quantiteAchatIndex + 1) % this.quantitesAchat.length;
  }

  onProductionDone(data: { product: Product; qteProduit: number }) {
    const moneyMade =
      data.product.revenu *
      data.qteProduit *
      (1 + (this.world.activeangels * this.world.angelbonus) / 100);
    this.world.money += moneyMade;
    this.world.score += moneyMade;
  }

  onUsernameChanged(event: any): void {
    const newUsername = event.target.value;
    this.username = newUsername;
    localStorage.setItem('username', newUsername);
    this.service.user = newUsername;
    new Promise((res) => setTimeout(res, 2000)).then(() =>
      this.service
        .getWorld()
        .then((world) => (this.world = world.data.getWorld))
    );
  }

  openModal(type: string) {
    let modalToOpen: ComponentType<any>;
    switch (type) {
      case 'manager':
        modalToOpen = ManagerComponent;
        break;
      case 'unlock':
        modalToOpen = UnlockComponent;
        break;
      case 'upgrade':
        modalToOpen = UpgradeComponent;
        break;
      case 'angel':
        modalToOpen = AngelComponent;
        break;
      case 'angel-upgrade':
        modalToOpen = AngelUpgradeComponent;
        break;
      default:
        // On est pas censé atteindre ce code
        throw 'Erreur dans le type de modal à afficher';
    }
    const modalRef = this.dialog.open(modalToOpen, {
      panelClass: 'custom-dialog-container',
      data: {
        world: this.world,
        server: this.server,
      },
    });

    modalRef.componentInstance.notifyBuyAngelUpgrade?.subscribe(
      (upgrade: Palier) => {
        // Angel déjà vérifié précédemment
        this.world.activeangels -= upgrade.seuil;

        if (upgrade.idcible === 0) {
          // Bonus pour tous les produits
          this.productsComponent.forEach((p) => p.calcUpgrade(upgrade));
        } else if (upgrade.idcible === -1 && upgrade.typeratio === 'ange') {
          this.world.angelbonus += upgrade.ratio;
        }
        upgrade.unlocked = true;
      }
    );

    modalRef.componentInstance.notifyBuyCashUpgrade?.subscribe(
      (upgrade: Palier) => {
        // Argent déjà vérifié précédemment
        this.world.money -= upgrade.seuil;

        if (upgrade.idcible === 0) {
          // Bonus pour tous les produits
          this.productsComponent.forEach((p) => p.calcUpgrade(upgrade));
        } else {
          // Bonus pour un seul produit
          this.productsComponent
            .filter((p) => p.product.id === upgrade.idcible)[0]
            .calcUpgrade(upgrade);
        }
        upgrade.unlocked = true;
      }
    );
  }

  onBuy(totalAchat: number) {
    this.world.money -= totalAchat;

    // On vérifie les allUnlocks
    this.world.allunlocks.forEach((allUnlock) => {
      if (
        !allUnlock.unlocked &&
        this.world.products.filter((p) => p.quantite < allUnlock.seuil)
          .length == 0
      ) {
        this.productsComponent.forEach((p) => {
          p.calcUpgrade(allUnlock);
        });
        allUnlock.unlocked = true;
      }
    });
  }
}
