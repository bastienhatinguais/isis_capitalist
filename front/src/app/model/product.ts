import { Palier } from './palier';

export class Product {
  id: number = 0;
  name: string = '';
  logo: string = '';
  cout: number = 0;
  croissance: number = 0;
  revenu: number = 0;
  vitesse: number = 0;
  quantite: number = 0;
  timeleft: number = 0;
  managerUnlocked: boolean = false;
  paliers: Palier[];
  constructor() {
    this.paliers = [];
  }
}
