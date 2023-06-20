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
    public wsService: WebserviceService,
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

  @Output() notifyProductionDone = new EventEmitter();
  @Output() notifyBuy = new EventEmitter<number>();

  _quantiteAchat: number = 1;
  _money = 0;
  isBuyMax = false;
  prixAPayer: number = 0;
  progressBarValue = 0;
  lastUpdate = Date.now();
  busy = false;

  ngOnInit() {
    setInterval(() => {
      this.calcScore();
    }, 100);
  }

  // Pas très jolie
  calcQtProductionforElapseTime(tempsEcoule: number) {
    let nbrProduction = 0;
    if (this.product.managerUnlocked) {
      if (tempsEcoule > this.product.timeleft) {
        var nbr = Math.trunc(
          (tempsEcoule - this.product.timeleft) / this.product.vitesse
        );
        nbrProduction = nbr * this.product.quantite + 1;
        // /!\ on soustrait la vitesse pour avoir le timeleft
        this.product.timeleft =
          this.product.vitesse -
          (tempsEcoule - this.product.timeleft - this.product.vitesse * nbr);
      } else {
        this.product.timeleft = this.product.timeleft - tempsEcoule;
      }
    } else if (this.product.timeleft != 0) {
      // En cours de production manuelle
      if (this.product.timeleft < tempsEcoule) {
        nbrProduction = this.product.quantite;
        this.product.timeleft = 0;
      } else {
        this.product.timeleft -= tempsEcoule;
      }
    }
    return nbrProduction;
  }

  calcScore() {
    const elapsedTime = Date.now() - this.lastUpdate;
    const qteProduit = this.calcQtProductionforElapseTime(elapsedTime);
    if (qteProduit > 0) {
      this.notifyProductionDone.emit({ product: this.product, qteProduit });
    }

    // Vérification si la production est à l'arrêt (manager verouillé et timeleft = 0)
    if (this.product.timeleft <= 0 && !this.product.managerUnlocked) {
      this.progressBarValue = 0;
    } else {
      this.progressBarValue =
        ((this.product.vitesse - this.product.timeleft) /
          this.product.vitesse) *
        100;
    }

    this.lastUpdate = Date.now();
  }

  lancerProduction() {
    if (!this.product.managerUnlocked && this.product.timeleft == 0) {
      this.product.timeleft = this.product.vitesse;
      this.wsService
        .lancerProduction(this.product)
        .catch((reason) => console.log('erreur: ' + reason));
    }
  }

  acheterProduit() {
    if (this._money >= this.prixAPayer) {
      this.busy = true;
      this.wsService
        .acheterQtProduit(this.product, this._quantiteAchat)
        .then(() => (this.busy = false));
      this.product.cout *= Math.pow(
        this.product.croissance,
        this._quantiteAchat
      );
      this.product.quantite += this._quantiteAchat;
      this.notifyBuy.emit(this.prixAPayer);

      // Vérification unlock
      this.product.paliers.forEach((p) => {
        if (!p.unlocked && this.product.quantite >= p.seuil) {
          this.calcUpgrade(p);
        }
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
    if (!p.unlocked) {
      let customMessage = '';
      // On ajoute l'unlock ou l'upgrade
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
