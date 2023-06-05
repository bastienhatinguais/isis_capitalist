import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { World } from 'src/app/model/world';

@Component({
  selector: 'app-unlock',
  templateUrl: './unlock.component.html',
  styleUrls: ['./unlock.component.css'],
})
export class UnlockComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { world: World; server: string }
  ) {}
}
