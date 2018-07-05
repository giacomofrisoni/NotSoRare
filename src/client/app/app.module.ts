import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';



//import { HeroesComponent } from './components/heroes.component';
//import { HeroService } from './services/hero.service';
import { HomeComponent } from './pages/home.component';
import { TopBarComponent } from './components/top-bar.component';
import { DivbuttonComponent } from './components/divbutton.component';
import { RootComponent } from './pages/root.component';
import { MenubuttonComponent } from './components/menubutton.component';
import { RegisterComponent } from './pages/register.component';
import { RadiogroupComponent } from './components/radiogroup.component';
import { CountriesSelectorComponent } from './components/countries-selector.component';
import { UserService } from './services/user.service';
import { LoginComponent } from './pages/login.component';

const appRoutes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent }
];

@NgModule({
  declarations: [
    HomeComponent,
    TopBarComponent,
    DivbuttonComponent,
    RootComponent,
    MenubuttonComponent,
    RegisterComponent,
    RadiogroupComponent,
    CountriesSelectorComponent,
    LoginComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    HttpClientModule,
    NgSelectModule,
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: false }    //TRUE to debug routes
    )
  ],
  providers: [UserService],
  bootstrap: [RootComponent]
  //bootstrap: [AppComponent]
})
export class AppModule { }
