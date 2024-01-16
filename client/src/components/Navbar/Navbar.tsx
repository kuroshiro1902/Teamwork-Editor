import { useContext, useState } from "react";
import { ButtonGroup, CloseButton, ToggleButton } from "react-bootstrap";
import "./Navbar.scss";
// import { Link, useSearchParams } from "react-router-dom";
import { EditorDataContext } from "../../contexts/EditorData";
import { useNavigate } from "react-router-dom";
function Navbar() {
  const {
    openingFile: file,
    setOpeningFile,
    project,
  } = useContext(EditorDataContext);
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState(file);
  // const [searchParams, setSearchParams] = useSearchParams();

  // const handleFileLocationChange = (e: any) => {
  //   setSelectedOption(e.target.value);
  //   setSearchParams({ file: e.target.value });
  // };
  const handleClose = () => {
    navigate(project?.name!);
  };

  return (
    <div id='Navbar'>
      {file && (
        <ButtonGroup>
          {/* <Link to={`${project?.name}?file=${file.name}`}> */}
          <ToggleButton
            id={file.id!}
            type='radio'
            variant='secondary'
            name='radio'
            value={file.id!}
            checked={selectedOption?.id === file.id!}
            // onChange={handleFileLocationChange}
          >
            {file.name}
            <CloseButton onClick={handleClose} />
          </ToggleButton>
          {/* </Link> */}
        </ButtonGroup>
      )}
    </div>
  );
}
export default Navbar;
