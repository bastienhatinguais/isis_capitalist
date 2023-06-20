import { Injectable } from '@angular/core';
import { createClient } from '@urql/core';
import {
  ACHETER_ANGEL_UPGRADE,
  ACHETER_QUANTITE_PRODUIT,
  ACHETER_UPGRADE,
  ENGAGER_MANAGER,
  GET_WORLD,
  LANCER_PRODUCTION,
  RESET_WORLD,
} from './graphql.request';
import { Product } from './model/product';
import { Palier } from './model/palier';

@Injectable({
  providedIn: 'root',
})
export class WebserviceService {
  // server = 'https://isiscapitalist-bastien-back.azurewebsites.net';
  server = 'http://localhost:4000';
  // server = 'https://isiscapitalistgraphql.kk.kurasawa.fr';
  public user = localStorage.getItem('username') ?? 'Isis';

  constructor() {}

  createClient() {
    return createClient({
      url: this.server + '/graphql',
      fetchOptions: () => {
        return {
          headers: { 'x-user': this.user },
        };
      },
    });
  }

  getWorld() {
    return this.createClient().query(GET_WORLD, {}).toPromise();
  }

  lancerProduction(product: Product) {
    return this.createClient()
      .mutation(LANCER_PRODUCTION, { id: product.id })
      .toPromise();
  }

  acheterQtProduit(product: Product, quantite: number) {
    return this.createClient()
      .mutation(ACHETER_QUANTITE_PRODUIT, {
        id: product.id,
        quantite: quantite,
      })
      .toPromise();
  }

  engagerManager(managerName: string) {
    return this.createClient()
      .mutation(ENGAGER_MANAGER, {
        name: managerName,
      })
      .toPromise();
  }

  acheterCashUpgrade(upgrade: Palier) {
    return this.createClient()
      .mutation(ACHETER_UPGRADE, {
        name: upgrade.name,
      })
      .toPromise();
  }

  resetWorld() {
    return this.createClient().mutation(RESET_WORLD, {}).toPromise();
  }

  buyAngelUpgrade(upgrade: Palier) {
    return this.createClient()
      .mutation(ACHETER_ANGEL_UPGRADE, {
        name: upgrade.name,
      })
      .toPromise();
  }
}
