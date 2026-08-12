import { useEffect, useState } from "react";
import { Container, Card, Form, Button, Alert, Row, Col } from "react-bootstrap";
import api from "../../api/axios";

const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");

  const loadAnnouncements = () => {
    api.get("/announcements").then((res) => setAnnouncements(res.data)).catch(() => setError("Failed to load"));
  };

  useEffect(loadAnnouncements, []);

  const handlePost = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/announcements", { title, body });
      setTitle("");
      setBody("");
      loadAnnouncements();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to post announcement");
    }
  };

  return (
    <Container>
      <h3 className="mb-3">Announcements</h3>
      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Card.Title className="fs-6">Post New Announcement</Card.Title>
          <Form onSubmit={handlePost}>
            <Form.Group className="mb-2">
              <Form.Control
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Message"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
              />
            </Form.Group>
            <Button type="submit">Post</Button>
          </Form>
        </Card.Body>
      </Card>

      <Row className="g-3">
        {announcements.map((a) => (
          <Col md={6} key={a._id}>
            <Card className="shadow-sm h-100">
              <Card.Body>
                <Card.Title className="fs-6">{a.title}</Card.Title>
                <Card.Text>{a.body}</Card.Text>
                <small className="text-muted">
                  {a.postedBy?.name} · {new Date(a.createdAt).toLocaleDateString()}
                </small>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default AdminAnnouncements;
