import { IFile } from "../models/File.model";
import { IFolder } from "../models/Folder.model";
import { IProject } from "../models/Project.model";

export const testProject: IProject = {
  id: "test-project",
  name: "test project",
  folders: [
    {
      id: "folder-1",
      name: "child folder",
      files: [{ id: "file-2", name: "file2" }],
    } as IFolder,
    { id: "file-1", name: "Test.js" } as IFile,
  ],
  files: [{ id: "file-3", name: "Test3.js" }],
};
