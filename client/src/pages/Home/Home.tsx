import { Button } from "react-bootstrap";
import Sidebar from "../../components/Sidebar/Sidebar";
import { EditorDataProvider } from "../../contexts/EditorData";
import Controlbar from "../../components/Controlbar/Controlbar";
import Navbar from "../../components/Navbar/Navbar";

function Home() {
  if (!localStorage.getItem("user")) {
    window.open("login", "_self");
    return <></>;
  }
  return (
    <EditorDataProvider>
      <div className='d-flex'>
        <Sidebar />
        <div className='flex-fill'>
          <Navbar />
          <div id='Home' data-bs-theme='dark'>
            <div
              id='Editor'
              style={{
                height: "600px",
              }}
            ></div>
          </div>
        </div>
        <Controlbar />

        <Button
          onClick={() => {
            localStorage.removeItem("user");
            window.open("login", "_self");
          }}
          style={{ position: "fixed", bottom: 10, right: 10 }}
          variant='secondary'
          size='sm'
        >
          Log Out
        </Button>
      </div>
    </EditorDataProvider>
  );
}

export default Home;
