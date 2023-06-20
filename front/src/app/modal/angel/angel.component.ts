import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Palier } from 'src/app/model/palier';
import { World } from 'src/app/model/world';
import { WebserviceService } from 'src/app/webservice.service';
import { ResetWorldComponent } from '../reset-world/reset-world.component';

@Component({
  selector: 'app-angel',
  templateUrl: './angel.component.html',
  styleUrls: ['./angel.component.css'],
})
export class AngelComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { world: World; server: string },
    public dialog: MatDialog
  ) {}

  angelToClaim =
    Math.floor(150 * Math.sqrt(this.data.world.score / Math.pow(10, 15))) -
    this.data.world.totalangels;

  ngOnInit(): void {
    this.angelToClaim =
      Math.floor(150 * Math.sqrt(this.data.world.score / Math.pow(10, 15))) -
      this.data.world.totalangels;
  }
  resetWorld() {
    this.dialog.open(ResetWorldComponent);
  }
}
