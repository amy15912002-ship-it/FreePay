import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DemoShellComponent } from './demo-shell/demo-shell.component';
import { AccountOverviewComponent } from './account-overview/account-overview.component';
import { FundSelectComponent } from './fund-select/fund-select.component';

const routes: Routes = [
  { path: '', redirectTo: 'demo/flow', pathMatch: 'full' },
  { path: 'demo/overview', component: AccountOverviewComponent },
  { path: 'demo/search', component: FundSelectComponent },
  { path: 'demo/flow', component: DemoShellComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
