import type { HashContract } from '@ioc:Adonis/Core/Hash'
import type {
  UserProviderContract,
  ProviderUserContract
} from '@ioc:Adonis/Addons/Auth'
import {UserService} from "../../app/Services/UserService";

/**
 * Shape of the user object returned by the "CustomAuthProvider"
 * class. Feel free to change the properties as you want
 */
export type User = {
  id: string
  name: string
  avatarUrl: string
}

/**
 * The shape of configuration accepted by the CustomAuthProvider.
 * At a bare minimum, it needs a driver property
 */
export type CustomAuthProviderConfig = {
  driver: 'custom'
}

/**
 * Provider user works as a bridge between your User provider and
 * the AdonisJS auth module.
 */
class ProviderUser implements ProviderUserContract<User> {

  // @ts-ignore
  constructor(public user: User | null, private hash: HashContract) {}

  public getId() {
    return this.user ? this.user.id : null
  }

  public getRememberMeToken() {
    return null
  }

  // @ts-ignore
  public setRememberMeToken(token: string) {
    return
  }

  // @ts-ignore
  public async verifyPassword(plainPassword: string) {
    return true
  }
}

/**
 * The User provider implementation to lookup a user for different
 * operations
 */
export class CustomAuthProvider implements UserProviderContract<User> {
  private readonly userService: UserService
  constructor(
    public config: CustomAuthProviderConfig,
    private hash: HashContract
  ) {
    this.userService = new UserService()
  }

  public async getUserFor(user: User | null) {
    return new ProviderUser(user, this.hash)
  }

  // @ts-ignore
  public async updateRememberMeToken(user: ProviderUser) {
    return
  }

  public async findById(id: string) {
    const user = this.userService.getByKey('id', id)[0]
    return this.getUserFor(user || null)
  }

  public async findByUid(uidValue: string) {
    const user = this.userService.getByKey('id', uidValue)[0]
    return this.getUserFor(user || null)
  }

  // @ts-ignore
  public async findByRememberMeToken(userId: string | number, token: string) {
    return this.getUserFor( null)
  }
}
