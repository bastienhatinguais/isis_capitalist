import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Palier } from '../model/palier';
import { Product } from '../model/product';
import { WebserviceService } from '../webservice.service';
import { CustomSnackbarService } from '../custom-snackbar.service';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css'],
})
export class ProductComponent implements OnInit {
  constructor(
    private wsService: WebserviceService,
    private snackBarService: CustomSnackbarService
  ) {}

  @Input() product = new Product();
  @Input() set quantiteAchat(value: number) {
    this.isBuyMax = false;
    if (value === -1 && this.product) {
      this.isBuyMax = true;
      this._quantiteAchat = this.calcMaxCanBuy();
    } else {
      this._quantiteAchat = value;
    }
    this.prixAPayer = this.calcPrixAPayer();
  }
  @Input() set money(value: number) {
    this._money = value;
    if (this.isBuyMax) {
      this._quantiteAchat = this.calcMaxCanBuy();
      this.prixAPayer = this.calcPrixAPayer();
    }
  }

  @Output() notifyProductionDone = new EventEmitter<Product>();
  @Output() notifyBuy = new EventEmitter<number>();

  _quantiteAchat: number = 1;
  _money = 0;
  isBuyMax = false;
  prixAPayer: number = 0;
  progressBarValue = 0;
  lastUpdate = Date.now();

  ngOnInit() {
    setInterval(() => {
      this.calcScore();
    }, 100);
  }

  calcScore() {
    if (this.product.timeleft <= 0 && !this.product.managerUnlocked) {
      return;
    }
    this.product.timeleft -= Date.now() - this.lastUpdate;
    if (this.product.timeleft <= 0) {
      this.product.timeleft = 0;
      this.progressBarValue = 0;
      this.notifyProductionDone.emit(this.product);
      if (this.product.managerUnlocked) {
        //on relance la production si on a le manager
        this.lancerProduction();
      }
    } else {
      this.progressBarValue =
        ((this.product.vitesse - this.product.timeleft) /
          this.product.vitesse) *
        100;
    }
    this.lastUpdate = Date.now();
  }

  lancerProduction() {
    this.product.timeleft = this.product.vitesse;
    if (!this.product.managerUnlocked) {
      this.wsService
        .lancerProduction(this.product)
        .catch((reason) => console.log('erreur: ' + reason));
    }
  }

  acheterProduit() {
    if (this._money >= this.prixAPayer) {
      this.wsService.acheterQtProduit(this.product, this._quantiteAchat);
      this.product.cout *= Math.pow(
        this.product.croissance,
        this._quantiteAchat
      );
      this.product.quantite += this._quantiteAchat;
      this.notifyBuy.emit(this.prixAPayer);

      // Vérification unlock
      this.product.paliers.forEach((p) => {
        this.calcUpgrade(p);
      });

      // Nouveau prix à payer
      this.prixAPayer = this.calcPrixAPayer();
    }
  }

  calcMaxCanBuy() {
    return Math.floor(
      Math.log(
        1 - (this._money / this.product.cout) * (1 - this.product.croissance)
      ) / Math.log(this.product.croissance)
    );
  }

  calcPrixAPayer() {
    const prixAPayer =
      (this.product.cout *
        (1 - Math.pow(this.product.croissance, this._quantiteAchat))) /
      (1 - this.product.croissance);
    return prixAPayer;
  }

  calcUpgrade(p: Palier) {
    if (!p.unlocked && this.product.quantite >= p.seuil) {
      let customMessage = '';
      // On ajoute l'unlock
      switch (p.typeratio) {
        case 'vitesse':
          this.product.vitesse /= p.ratio;
          this.product.timeleft /= p.ratio;
          customMessage = 'accéléré la vitesse de production par ' + p.ratio;
          break;
        case 'gain':
          this.product.revenu *= p.ratio;
          customMessage = 'augmenté le revenu de la production par ' + p.ratio;
          break;
        default:
          throw 'Le type de ratio ' + p.typeratio + " n'existe pas !";
      }
      p.unlocked = true;
      this.snackBarService.open(
        `L'amélioration ${p.name} du produit ${this.product.name} a ${customMessage} !`,
        '',
        5000
      );
    }
  }
}
