import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AuthUserDTO} from '../../models/contract/AuthUserDTO';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) {

  }

  public isAuthenticated(){
    return true;
  }

  public login(userName:string, password:string){
    const postArg: AuthUserDTO = {username : userName, password: password}
    return this.http.post<string>('http://localhost:8080/auth/login', postArg);
  }
}
