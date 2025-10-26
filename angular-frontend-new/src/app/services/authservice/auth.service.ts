import {EventEmitter, Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AuthUserDTOModel} from '../../models/contract/AuthUserDTO.model';
import {AuthToken} from '../../models/contract/AuthToken.model';

// TODO: Maybe move into own seperate constant class?
export const EXPIRY_DATE_STRING: string= "expiryDate";
export const AUTH_TOKEN_STRING: string= "authToken";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public loggedInEvent: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private http: HttpClient) {

  }

  public isAuthenticated(){
    return true;
  }

  public login(userName:string, password:string){
    const postArg: AuthUserDTOModel = {username : userName, password: password}
    this.http.post<AuthToken>('http://localhost:8080/auth/login', postArg)
      .subscribe(authToken => this.setSession(authToken));
  }

  public logout(){
    localStorage.removeItem(AUTH_TOKEN_STRING);
    localStorage.removeItem(EXPIRY_DATE_STRING);
    this.loggedInEvent.emit(false);
  }

  public isLoggedIn(){
    return new Date().getTime() < this.getExpiration().getTime();
  }

  private setSession(authToken: AuthToken){
    localStorage.setItem(AUTH_TOKEN_STRING, authToken.token);
    localStorage.setItem(EXPIRY_DATE_STRING, authToken.expiryDate.toString());
    this.loggedInEvent.emit(true);
  }

  private getExpiration() {
    return new Date(localStorage.getItem(EXPIRY_DATE_STRING) ?? new Date());
  }
}
