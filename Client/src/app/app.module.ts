import { InjectionToken, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RegisterComponent } from './Component/register/register.component';
import { LoginComponent } from './Component/login/login.component';
import { provideToastr } from 'ngx-toastr';
import { HttpClientModule } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';
import { ReactiveFormsModule } from '@angular/forms';
import { provideAnimations } from '@angular/platform-browser/animations';
import { TaskComponent } from './Component/task/task.component';
import { NavbarComponent } from './Component/navbar/navbar.component';
import { NgSelectModule } from "@ng-select/ng-select";
import { NotfoundComponent } from './Component/notfound/notfound.component'; 



@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    LoginComponent,
 
    TaskComponent,
    NavbarComponent,
    NotfoundComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
    ToastrModule,
    ReactiveFormsModule,
    ToastrModule.forRoot(
      {
        timeOut: 3000, // Duration for which the toast will be shown (in milliseconds)
        easing: 'ease-in', // Easing type for the animation
      }
    ),
    NgSelectModule
  ],
  providers: [
    provideAnimations(), // required animations providers
    provideToastr(),
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
