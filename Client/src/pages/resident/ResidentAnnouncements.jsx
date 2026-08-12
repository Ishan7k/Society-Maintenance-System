import { useEffect, useState } from "react";
import { Container, Card, Row, Col, Alert } from "react-bootstrap";
import api from "../../api/axios";

const ResidentAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/announcements").then((res) => setAnnouncements(res.data)).catch(() => setError("Failed to load"));
  }, []);

  return (
    <Container>
      <h3 className="mb-3">Announcements</h3>
      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="g-3">
        {announcements.length === 0 && <div className="text-muted">No announcements yet.</div>}
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

export default ResidentAnnouncements;
