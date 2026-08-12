import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Spinner, Alert, Badge, ListGroup } from "react-bootstrap";
import api from "../../api/axios";

const statusColor = { paid: "success", pending: "warning", overdue: "danger" };

const ResidentDashboard = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/dashboard/resident")
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || "Failed to load dashboard"));
  }, []);

  if (error) return <Container><Alert variant="danger">{error}</Alert></Container>;
  if (!data) return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;

  return (
    <Container>
      <h3 className="mb-4">My Dashboard</h3>
      <Row className="g-3 mb-4">
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="text-muted small">Total Due</div>
              <div className="fs-3 fw-bold text-danger">₹{data.totalDue.toLocaleString()}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="text-muted small">Pending Bills</div>
              <div className="fs-3 fw-bold">{data.pendingBillsCount}</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Card.Title className="fs-6 text-muted">Recent Bills</Card.Title>
          <ListGroup variant="flush">
            {data.recentBills.map((b) => (
              <ListGroup.Item key={b._id} className="d-flex justify-content-between align-items-center">
                <span>{b.month} — ₹{b.amount}</span>
                <Badge bg={statusColor[b.status]}>{b.status}</Badge>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card.Body>
      </Card>

      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title className="fs-6 text-muted">My Complaints</Card.Title>
          <ListGroup variant="flush">
            {data.complaints.length === 0 && <div className="text-muted">No complaints raised yet.</div>}
            {data.complaints.map((c) => (
              <ListGroup.Item key={c._id} className="d-flex justify-content-between align-items-center">
                <span className="text-capitalize">{c.category}: {c.description}</span>
                <Badge bg="secondary">{c.status}</Badge>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ResidentDashboard;
