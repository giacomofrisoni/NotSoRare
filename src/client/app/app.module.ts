import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

//import { AppComponent } from './app.component';
import { HeroesComponent } from './components/heroes.component';
import { HeroService } from './services/hero.service';
import { HomeComponent } from './pages/home.component';
import { TopBarComponent } from './components/top-bar.component';
import { DivbuttonComponent } from './components/divbutton.component';
import { RootComponent } from './pages/root.component';


@NgModule({
  declarations: [
    //AppComponent,
    HeroesComponent,
    HomeComponent,
    TopBarComponent,
    DivbuttonComponent,
    RootComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [HeroService],
  bootstrap: [RootComponent]
  //bootstrap: [AppComponent]
})
export class AppModule { }
