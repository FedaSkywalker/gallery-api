
import * as console from "console";
import {HttpContextContract} from "@ioc:Adonis/Core/HttpContext";
import {UserService} from "../../Services/UserService";
import {User} from "../../../../../zadanie/gallery-api/providers/CustomAuthProvider";
import View from '@ioc:Adonis/Core/View'

export default class AuthController {

  private readonly userService: UserService

  constructor() {
    this.userService = new UserService()
  }


  //only for demonstration Discord OAuth2 function display simple page secured with session
  async securedPage ( { auth }: HttpContextContract) {
    console.log(auth.user)
    return View.render('home', {user: auth.user})
  }

  //discord oauth handling. See https://github.com/adonisjs/ally/blob/develop/examples/discord.ts
  async redirectToDiscord({ ally }) {
    return ally.use('discord').redirect((request) => {
      request.scopes(['identify', 'guilds'])
    })
  }


  async handleDiscordCallback({ ally,auth, response }) {
    try {
      const discord = ally.use('discord')
      if (discord.accessDenied()) {
        return 'Access was denied'
      }

      if (discord.stateMisMatch()) {
        return 'Request expired. Retry again'
      }

      if (discord.hasError()) {
        return discord.getError()
      }

      const user = await discord.user()

      const loginUser: User = {
        id: user.id,
        avatarUrl: user.avatarUrl,
        name: user.name
      }

      this.userService.appendItems([loginUser])

      await auth.login(loginUser)

      return response.redirect('/auth/sec')
    } catch (error) {
      console.log({ error: error.response })
      throw error
    }
  }

}
