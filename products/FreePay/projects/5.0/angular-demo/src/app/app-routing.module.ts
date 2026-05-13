import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DemoShellComponent } from './demo-shell/demo-shell.component';
import { AccountOverviewComponent } from './account-overview/account-overview.component';

const routes: Routes = [
  { path: '', redirectTo: 'demo/1', pathMatch: 'full' },
  { path: 'demo/overview', component: AccountOverviewComponent },
  { path: 'demo/:scenarioId', component: DemoShellComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
