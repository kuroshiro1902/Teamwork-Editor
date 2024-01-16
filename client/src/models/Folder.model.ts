import { IFile } from "./File.model";
import { IHistory } from "./History.model";

export interface IFolder {
  id?: string;
  name: string;
  files?: { [key: string]: IFile };
  folders?: IFolder[];
  history?: IHistory[];
}
