import { Link, useNavigate } from "react-router-dom";
import FileIcon from "../../icons/FileIcon";
import FolderIcon from "../../icons/FolderIcon";
import "./Sidebar.scss";
import { useContext, useState } from "react";
import { EditorDataContext } from "../../contexts/EditorData";
import { IFolder } from "../../models/Folder.model";
import { IFile } from "../../models/File.model";
import { Button, CloseButton, Form, Modal } from "react-bootstrap";
import RunIcon from "../../icons/RunIcon";
import { EFileType } from "../../constants/FileType.constant";
function Sidebar() {
  const [isCreateFile, setIsCreateFile] = useState(false);
  // const [isCreateNewFolder, setIsCreateNewFolder] = useState(false);

  const { project, socketController, openingFile, setOpeningFile, setProject } =
    useContext(EditorDataContext);
  const navigate = useNavigate();

  const handleCreateFile = (e: any) => {
    e.preventDefault();
    const name = `${e.target.fileName.value}.${
      //@ts-ignore
      EFileType[e.target.fileLang.value].extension
    }`;
    const newFile = {
      id: name,
      name,
      lang: e.target.fileLang.value,
      content: "",
    } as IFile;
    if (project?.files?.[newFile.name]) {
      alert("File already exists.");
      return;
    }
    setIsCreateFile(false);
    setProject(
      project
        ? { ...project, files: { ...project?.files!, [newFile.name]: newFile } }
        : null
    );
    socketController?.emitNewFile(newFile);
    setTimeout(() => {
      navigate(`${project?.name}?file=${newFile.name}`);
    }, 250);
  };
  const handleDeleteFile = (file: IFile) => {
    socketController?.emitDeleteFile(file);
    if (file.name === openingFile?.name) navigate(`${project?.name}`);
  };
  return (
    <>
      <div id='Sidebar'>
        <h3>{project?.name}</h3>
        <div>
          <Button
            onClick={() => socketController?.emitCompile(project?.name!)}
            title='Run'
            variant='outline-success'
            size='sm'
          >
            <RunIcon />
          </Button>{" "}
          {/* <Button title='Add Folder' variant='outline-secondary' size='sm'>
            <FolderIcon />+
          </Button>{" "} */}
          <Button
            title='Add file'
            variant='outline-primary'
            size='sm'
            onClick={() => setIsCreateFile(true)}
          >
            <FileIcon />+
          </Button>
        </div>
        {project?.folders?.map((folder, i) => (
          <Folder projectName={project?.name} key={i} folder={folder} />
        ))}
        {Object.values(project?.files ?? {}).map((file, i) => (
          <File
            projectName={project?.name}
            key={i}
            file={file}
            deleteFile={() => handleDeleteFile(file)}
          />
        ))}
      </div>

      <Modal
        size='sm'
        show={isCreateFile}
        onHide={() => setIsCreateFile(false)}
        aria-labelledby='example-modal-sizes-title-sm'
      >
        <Modal.Header closeButton>
          <Modal.Title id='example-modal-sizes-title-sm'>New file</Modal.Title>
        </Modal.Header>
        <Modal.Body data-bs-theme='dark'>
          <form onSubmit={handleCreateFile}>
            <Form.Label htmlFor='new-file-name'>File Name</Form.Label>
            <Form.Control
              name='fileName'
              type='text'
              pattern='[0-9a-zA-Z_\.]{1,}'
              placeholder='File name'
              id='new-file-name'
              required
            />
            <br />
            <Form.Label>Language</Form.Label>
            <Form.Select
              aria-label='Default select example'
              name='fileLang'
              required
            >
              <option value='java'>Java</option>
              <option value='javascript'>JavaScript</option>
              <option value='typescript'>TypeScript</option>
              <option value='python'>Python</option>
            </Form.Select>
            <br />
            <Button type='submit' variant='primary' size='sm'>
              Submit
            </Button>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default Sidebar;

function Child({ children }: any) {
  return <div className='child'>{children}</div>;
}
function Folder({
  folder,
  projectName,
}: {
  folder: IFolder;
  projectName?: string;
}) {
  return (
    <details>
      <summary>
        <FolderIcon /> {folder.name}
      </summary>
      <Child>
        {folder.folders?.map((folder, i) => (
          <Folder projectName={projectName} folder={folder} key={i} />
        ))}
        {Object.values(folder.files ?? {}).map((file, i) => (
          <File projectName={projectName} file={file} key={i} />
        ))}
      </Child>
    </details>
  );
}
function File({
  file,
  projectName,
  deleteFile,
}: {
  file: IFile;
  projectName?: string;
  deleteFile?: any;
}) {
  return (
    <p className='file'>
      <Link to={`${projectName}?file=${file.name}`}>
        <FileIcon color={EFileType[file.lang!].fileColor} /> {file.name}
      </Link>
      <CloseButton
        onClick={() => {
          if (confirm(`Delete ${file.name}`)) deleteFile();
        }}
      />
    </p>
  );
}
