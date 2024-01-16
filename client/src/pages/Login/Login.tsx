import { Button, Form } from "react-bootstrap";
import { serverENV } from "../../environment";
function Login() {
  const handleSubmit = (e: any) => {
    e.preventDefault();
    const formData = {
      name: e.target.name.value?.trim(),
      projectName: e.target.projectName.value?.trim(),
    };
    fetch(`${serverENV.url}/${formData.projectName}`)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        localStorage.setItem(
          "user",
          JSON.stringify({
            name: formData.name,
            projectName: formData.projectName,
          })
        );
        window.open(formData.projectName);
      });
  };
  return (
    <div className='pt-4 d-flex justify-content-center align-items-center'>
      <Form onSubmit={handleSubmit} style={{ color: "#fff" }}>
        <h3>Join project</h3>
        <Form.Group className='mb-3' controlId='name'>
          <Form.Label>Your name</Form.Label>
          <Form.Control type='text' placeholder='Enter Name' required />
          <Form.Text style={{ color: "#aaa" }}>
            Name to display with others in project.
          </Form.Text>
        </Form.Group>

        <Form.Group className='mb-3' controlId='projectName'>
          <Form.Label>Project's name</Form.Label>
          <Form.Control
            type='text'
            placeholder="Enter project's name"
            required
          />
        </Form.Group>
        <Button variant='primary' type='submit'>
          Join
        </Button>
      </Form>
    </div>
  );
}

export default Login;
