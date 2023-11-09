import FileService from "./FileService";
import {User} from "../../../../zadanie/gallery-api/providers/CustomAuthProvider";



export class UserService extends FileService<User> {

  constructor() {
    super('users.json');
  }

}
