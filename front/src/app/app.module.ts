import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ProductComponent } from './product/product.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';
import { ManagerComponent } from './modal/manager/manager.component';
import { MatDialogModule } from '@angular/material/dialog';
import { NumberFormatPipe } from './pipe/number-format/number-format-pipe.pipe';
import { UnlockComponent } from './modal/unlock/unlock.component';
import { SnackbarComponent } from './snackbar/snackbar.component';
import { CustomSnackbarService } from './custom-snackbar.service';
import { CommonModule } from '@angular/common';
import { UpgradeComponent } from './modal/upgrade/upgrade.component';
import { AngelComponent } from './modal/angel/angel.component';
import { AngelUpgradeComponent } from './modal/angel-upgrade/angel-upgrade.component';
import { DiamondComponent } from './diamond/diamond.component';

@NgModule({
  declarations: [
    AppComponent,
    AngelComponent,
    AngelUpgradeComponent,
    ProductComponent,
    ManagerComponent,
    UpgradeComponent,
    NumberFormatPipe,
    UnlockComponent,
    SnackbarComponent,
    UpgradeComponent,
    AngelUpgradeComponent,
    DiamondComponent,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatProgressBarModule,
    MatGridListModule,
    MatCardModule,
    MatButtonModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
