import FileService from "./FileService";
import {User} from "../../providers/CustomAuthProvider";

export class UserService extends FileService<User> {
  constructor() {
    super('users.json');
  }

}
