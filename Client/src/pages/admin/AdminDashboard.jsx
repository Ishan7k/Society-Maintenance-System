import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Spinner, Alert } from "react-bootstrap";
import api from "../../api/axios";

const StatCard = ({ title, value, color }) => (
  <Card className="shadow-sm h-100">
    <Card.Body>
      <div className="text-muted small">{title}</div>
      <div className={`fs-3 fw-bold text-${color}`}>{value}</div>
    </Card.Body>
  </Card>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/dashboard/admin")
      .then((res) => setStats(res.data))
      .catch((err) => setError(err.response?.data?.message || "Failed to load dashboard"));
  }, []);

  if (error) return <Container><Alert variant="danger">{error}</Alert></Container>;
  if (!stats) return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;

  return (
    <Container>
      <h3 className="mb-4">Admin Dashboard</h3>
      <Row className="g-3 mb-4">
        <Col md={3}><StatCard title="Total Flats" value={stats.totalFlats} color="dark" /></Col>
        <Col md={3}><StatCard title="Collected" value={`₹${stats.totalCollected.toLocaleString()}`} color="success" /></Col>
        <Col md={3}><StatCard title="Pending" value={`₹${stats.totalPending.toLocaleString()}`} color="warning" /></Col>
        <Col md={3}><StatCard title="Overdue" value={`₹${stats.totalOverdueAmount.toLocaleString()}`} color="danger" /></Col>
      </Row>

      <Row className="g-3">
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title className="fs-6 text-muted">Overdue Bills</Card.Title>
              <div className="fs-2 fw-bold text-danger">{stats.overdueCount}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={8}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title className="fs-6 text-muted mb-3">Complaint Breakdown</Card.Title>
              <Row>
                <Col><span className="badge bg-secondary">Open: {stats.complaintBreakdown.open}</span></Col>
                <Col><span className="badge bg-info text-dark">In Progress: {stats.complaintBreakdown.inProgress}</span></Col>
                <Col><span className="badge bg-success">Resolved: {stats.complaintBreakdown.resolved}</span></Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;
