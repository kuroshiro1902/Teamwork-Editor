import { useContext, useState } from "react";
import ListGroup from "react-bootstrap/ListGroup";
import { EditorDataContext } from "../../../contexts/EditorData";
import { Button, Card, Modal } from "react-bootstrap";
import { IHistory } from "../../../models/History.model";
import "./History.css";
import { IFile } from "../../../models/File.model";

function History() {
  const { project, socketController } = useContext(EditorDataContext);
  const [selected, setSelected] = useState<IHistory>();
  const histories = [...(project?.history ?? [])].reverse();
  const handleRevert = (file: IFile) => {
    if (confirm(`Revert ${file.name}?`)) {
      socketController?.emitRevertFile(file);
      setSelected(undefined);
    }
  };
  return (
    <>
      <div
        className='pt-2 border-top border-info overflow-y-auto'
        style={{ maxHeight: 500 }}
      >
        <h6 className='text-info'>History</h6>
        <ListGroup style={{ fontSize: 13, lineHeight: 1.1 }}>
          {histories.map((history, i) => (
            <ListGroup.Item
              key={i}
              style={{ padding: "4px 8px", color: "var(--bs-gray-500)" }}
              action
              onClick={() => setSelected(history)}
            >
              <strong>{history.file.name}</strong> -
              <small>
                by <span className='fw-bold'>{history.user.name}</span>
              </small>
              <p className='mb-0' style={{ lineHeight: 1.2 }}>
                {new Date(history.time).toLocaleString()}
              </p>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </div>
      <Modal
        size='sm'
        show={!!selected}
        onHide={() => setSelected(undefined)}
        aria-labelledby='example-modal-sizes-title-sm'
        style={{ overflow: "auto" }}
      >
        <Modal.Header closeButton>
          <Modal.Title id='example-modal-sizes-title-sm'>History</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Card>
            <Card.Body>
              <Card.Title className='text-info'>
                {selected?.file.name}
              </Card.Title>
              <small style={{ fontSize: 13, color: "#888" }}>
                {new Date(selected?.time!).toLocaleString()}
              </small>
              <Card.Text style={{ color: "#888" }}>
                by <strong>{selected?.user.name}</strong>
              </Card.Text>
              <pre
                className='overflow-auto p-2 border'
                style={{ maxHeight: 300, height: "100%" }}
              >
                {selected?.file.content}
              </pre>
              <Button
                onClick={() => handleRevert(selected?.file!)}
                variant='primary'
              >
                Revert
              </Button>
            </Card.Body>
          </Card>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default History;
