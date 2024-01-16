import fs from "fs/promises";
import util from "util";
import { exec } from "child_process";
import { IFolder } from "../models/Folder.model";
import { ICommandResult } from "../models/CommandResult.model";

export async function compile(project: IFolder) {
  const thisProject = project;
  const projectPath: string = __dirname + "\\projects"; // Đường dẫn đến thư mục của dự án
  const folderName: string = project.name;
  const folderPath: string = `${projectPath}\\${folderName}`;
  const metaInfFolderPath: string = `${folderPath}\\META-INF`;

  // Chạy lệnh kiểm tra thư mục và các lệnh khác sử dụng Promises
  let a = 0;
  const isFolderExist = await folderExists(folderPath);
  if (!isFolderExist) {
    await executeCommand(`mkdir ${folderPath}`);
  }
  process.chdir(folderPath); // Chuyển đến thư mục dự án
  try {
    await createJavaFiles(projectPath, thisProject);
    await executeCommand("javac *.java");
    await executeCommand("mkdir META-INF");
    await createManifestFile(metaInfFolderPath); //Tạo tệp MANIFEST.MF
    await executeCommand("jar cvfm MyProject.jar META-INF/MANIFEST.MF *.class");
    const ans = await executeCommand(`java -jar ${folderPath}\\MyProject.jar`);
    return ans;
    console.log("Java JAR file executed successfully.");
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

// Hàm để kiểm tra xem thư mục đã tồn tại chưa
async function folderExists(path: string): Promise<boolean> {
  return fs
    .access(path)
    .then(() => true)
    .catch(() => false);
}

// Hàm để tạo tệp MANIFEST.MF
function createManifestFile(metaInfFolderPath: string): Promise<void> {
  const manifestPath: string = `${metaInfFolderPath}\\MANIFEST.MF`;
  const manifestContent: string = "Manifest-Version: 1.0\nMain-Class: Main\n";

  return fs.writeFile(manifestPath, manifestContent);
}

// Hàm để thực hiện một lệnh và trả về một Promise
async function executeCommand(command: string): Promise<ICommandResult> {
  return util
    .promisify(exec)(command)
    .then(({ stdout, stderr }: ICommandResult) => {
      if (stderr) {
        console.error(stderr);
        throw new Error(`Error executing command: ${command}`);
      }
      console.log(stdout);
      return { stdout, stderr };
    })
    .catch((error: Error) => {
      console.error(`Error executing command: ${command}`);
      throw error;
    });
}

async function createJavaFiles(
  projectPath: string,
  folder: IFolder
): Promise<void> {
  const folderPath: string = `${projectPath}\\${folder.name}`;
  await fs.mkdir(folderPath, { recursive: true });

  const fileCreationPromises: Promise<void>[] = [];

  if (folder.files) {
    for (const [fileName, file] of Object.entries(folder.files)) {
      const filePath: string = `${folderPath}\\${fileName}`;
      fileCreationPromises.push(fs.writeFile(filePath, file.content));
    }
  }

  if (folder.folders) {
    const subfolderPromises: Promise<void>[] = folder.folders.map((subfolder) =>
      createJavaFiles(projectPath, subfolder)
    );
    fileCreationPromises.push(...subfolderPromises);
  }

  await Promise.all(fileCreationPromises);
}
