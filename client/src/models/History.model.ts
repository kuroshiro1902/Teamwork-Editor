import { IFile } from "./File.model";
import { IUser } from "./User.model";

export interface IHistory {
  file: IFile;
  time: Date;
  user: IUser;
}
