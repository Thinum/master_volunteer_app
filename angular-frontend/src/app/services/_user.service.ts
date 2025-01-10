import axios from 'axios';
import { _User } from '../model/_user.model';

const BASE_URL = '/api/users';

export class UserService {
  /**
   * Fetch all users.
   */
  static async getAllUsers(): Promise<_User[]> {
    const response = await axios.get<_User[]>(`${BASE_URL}`);
    return response.data;
  }

  /**
   * Fetch a user by ID.
   */
  static async getUserById(id: number): Promise<_User> {
    const response = await axios.get<_User>(`${BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Create a new user.
   */
  static async createUser(user: _User): Promise<_User> {
    const response = await axios.post<_User>(BASE_URL, user);
    return response.data;
  }

  /**
   * Update an existing user.
   */
  static async updateUser(id: number, user: Partial<_User>): Promise<_User> {
    const response = await axios.put<_User>(`${BASE_URL}/${id}`, user);
    return response.data;
  }

  /**
   * Delete a user by ID.
   */
  static async deleteUser(id: number): Promise<void> {
    await axios.delete(`${BASE_URL}/${id}`);
  }
}
