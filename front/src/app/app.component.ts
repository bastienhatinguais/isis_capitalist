import { ComponentType } from '@angular/cdk/portal';
import { Type } from '@angular/compiler';
import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ManagerComponent } from './modal/manager/manager.component';
import { UnlockComponent } from './modal/unlock/unlock.component';
import { Product } from './model/product';
import { World } from './model/world';
import { ProductComponent } from './product/product.component';
import { WebserviceService } from './webservice.service';
import { CustomSnackbarService } from './custom-snackbar.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  @ViewChildren(ProductComponent)
  productsComponent: QueryList<ProductComponent> = new QueryList();
  title = 'front';
  world: World = new World();
  server = '';
  quantitesAchat = [1, 10, 100, -1];
  quantiteAchatIndex = 0;
  constructor(public service: WebserviceService, public dialog: MatDialog) {}

  ngOnInit() {
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

  onProductionDone(p: Product) {
    const moneyMade = p.revenu * p.quantite;
    this.world.money += moneyMade;
    this.world.score += moneyMade;
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
      default:
        // On est pas censé atteindre ce code
        throw 'Erreur dans le type de modal à afficher';
    }
    this.dialog.open(modalToOpen, {
      data: {
        world: this.world,
        server: this.server,
      },
    });
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
        this.productsComponent.forEach((p) => p.calcUpgrade(allUnlock));
      }
    });
  }
}
