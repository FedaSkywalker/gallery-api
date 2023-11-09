import {HttpContextContract} from "@ioc:Adonis/Core/HttpContext";
import {User} from "../../Models/User";
import {UserService} from "../../Services/UserService";
import * as console from "console";



export default class UserController {
  public async index({response}: HttpContextContract) {

    const userService = new UserService()

    const users: User[] = [
      {
        id: 1,
        name: 'Patrik',
        age: 18
      },
      {
        id: 1,
        name: 'Patrik',
        age: 18
      }
    ]
  userService.appendItems(users)
    console.log(userService.getByKey("id", 9))
    return response.status(200).json({})
  }
}
