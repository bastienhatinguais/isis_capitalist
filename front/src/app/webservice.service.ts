import { Injectable } from '@angular/core';
import { createClient } from '@urql/core';
import {
  ACHETER_QUANTITE_PRODUIT,
  ENGAGER_MANAGER,
  GET_WORLD,
  LANCER_PRODUCTION,
} from './graphql.request';
import { Product } from './model/product';

@Injectable({
  providedIn: 'root',
})
export class WebserviceService {
  server = 'http://localhost:4000';
  // server = 'https://isiscapitalistgraphql.kk.kurasawa.fr';
  user = 'bastien';

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
}
