import { Injectable } from '@angular/core';
import {User} from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class VolunteerService {

  private users: User[] = [
    {
      email: 'test@test',
      id: 0,
      joinedAt: new Date(),
      name: 'Heinrich',
      profilePicture: 'https://i.imgur.com/0np9ebl.jpeg'
    },
    {
      email: 'test@test',
      id: 1,
      joinedAt: new Date(),
      name: 'Heinrich1',
      profilePicture: 'https://i.imgur.com/0np9ebl.jpeg'
    },
    {
      email: 'test@test',
      id: 2,
      joinedAt: new Date(),
      name: 'Heinrich2',
      profilePicture: 'https://i.imgur.com/0np9ebl.jpeg'
    }
  ];

  constructor() { }

  public getUsers(): User[]{
    return this.users;
  }
}
