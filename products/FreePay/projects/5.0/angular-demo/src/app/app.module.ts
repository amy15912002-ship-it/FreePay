import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DemoShellComponent } from './demo-shell/demo-shell.component';
import { AccountOverviewComponent } from './account-overview/account-overview.component';
import { FundSelectComponent } from './fund-select/fund-select.component';
import { InfoModalComponent } from './info-modal/info-modal.component';
import { ConfirmModalComponent } from './confirm-modal/confirm-modal.component';
import { FreepayIntroComponent } from './freepay-intro/freepay-intro.component';
import { FooterComponent } from './footer/footer.component';
import { SharedNotesComponent } from './shared-notes/shared-notes.component';
import { StepperComponent } from './stepper/stepper.component';
import { TermsContentComponent } from './terms-content/terms-content.component';
import { ThousandsDirective } from './thousands.directive';

@NgModule({
  declarations: [
    AppComponent,
    DemoShellComponent,
    AccountOverviewComponent,
    FundSelectComponent,
    InfoModalComponent,
    ConfirmModalComponent,
    FreepayIntroComponent,
    FooterComponent,
    SharedNotesComponent,
    StepperComponent,
    TermsContentComponent,
    ThousandsDirective
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatRadioModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'zh-TW' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
