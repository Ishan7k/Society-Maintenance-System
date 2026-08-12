import { useEffect, useState } from "react";
import { Container, Table, Badge, Card, Form, Button, Alert, Row, Col } from "react-bootstrap";
import api from "../../api/axios";

const statusColor = { open: "secondary", "in-progress": "info", resolved: "success" };

const ResidentComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [category, setCategory] = useState("plumbing");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadComplaints = () => {
    api.get("/complaints").then((res) => setComplaints(res.data)).catch(() => setError("Failed to load complaints"));
  };

  useEffect(loadComplaints, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await api.post("/complaints", { category, description });
      setSuccess("Complaint raised successfully.");
      setDescription("");
      loadComplaints();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to raise complaint");
    }
  };

  return (
    <Container>
      <h3 className="mb-3">My Complaints</h3>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Card.Title className="fs-6">Raise New Complaint</Card.Title>
          <Form onSubmit={handleSubmit}>
            <Row className="g-2">
              <Col md={3}>
                <Form.Select value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="plumbing">Plumbing</option>
                  <option value="electrical">Electrical</option>
                  <option value="security">Security</option>
                  <option value="cleaning">Cleaning</option>
                  <option value="parking">Parking</option>
                  <option value="other">Other</option>
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Control
                  placeholder="Describe the issue..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </Col>
              <Col md={3}>
                <Button type="submit" className="w-100">Submit</Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Category</th>
            <th>Description</th>
            <th>Status</th>
            <th>Raised On</th>
          </tr>
        </thead>
        <tbody>
          {complaints.map((c) => (
            <tr key={c._id}>
              <td className="text-capitalize">{c.category}</td>
              <td>{c.description}</td>
              <td><Badge bg={statusColor[c.status]}>{c.status}</Badge></td>
              <td>{new Date(c.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default ResidentComplaints;
