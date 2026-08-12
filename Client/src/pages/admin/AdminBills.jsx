import { useEffect, useState } from "react";
import { Container, Table, Button, Form, Row, Col, Alert, Badge, Card } from "react-bootstrap";
import api from "../../api/axios";

const statusColor = { paid: "success", pending: "warning", overdue: "danger" };

const AdminBills = () => {
  const [bills, setBills] = useState([]);
  const [flats, setFlats] = useState([]);
  const [month, setMonth] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // single-bill form state
  const [singleFlatId, setSingleFlatId] = useState("");
  const [singleMonth, setSingleMonth] = useState("");
  const [singleDueDate, setSingleDueDate] = useState("");
  const [singleAmount, setSingleAmount] = useState("");

  useEffect(() => {
    api.get("/flats").then((res) => setFlats(res.data)).catch(() => {});
  }, []);

  const handleGenerateSingle = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await api.post("/bills/generate-single", {
        flatId: singleFlatId,
        month: singleMonth,
        dueDate: singleDueDate,
        amount: singleAmount || undefined,
      });
      setSuccess(`Bill created for the selected flat for ${singleMonth}.`);
      setSingleFlatId("");
      setSingleMonth("");
      setSingleDueDate("");
      setSingleAmount("");
      loadBills();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate bill");
    }
  };

  const loadBills = () => {
    const params = {};
    if (filterMonth) params.month = filterMonth;
    if (filterStatus) params.status = filterStatus;
    api.get("/bills", { params }).then((res) => setBills(res.data)).catch(() => setError("Failed to load bills"));
  };

  useEffect(loadBills, [filterMonth, filterStatus]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const { data } = await api.post("/bills/generate", { month, dueDate });
      setSuccess(`Generated ${data.created} new bills, skipped ${data.skipped} (already existed) for ${month}.`);
      loadBills();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate bills");
    }
  };

  return (
    <Container>
      <h3 className="mb-3">Bills</h3>

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Card.Title className="fs-6">Generate Monthly Bills</Card.Title>
          <Form onSubmit={handleGenerate}>
            <Row className="g-2 align-items-end">
              <Col md={3}>
                <Form.Label>Month</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="2026-08"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  required
                />
              </Col>
              <Col md={3}>
                <Form.Label>Due Date</Form.Label>
                <Form.Control
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </Col>
              <Col md={3}>
                <Button type="submit">Generate Bills for All Flats</Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Card.Title className="fs-6">Generate Bill for a Single Flat</Card.Title>
          <Form onSubmit={handleGenerateSingle}>
            <Row className="g-2 align-items-end">
              <Col md={3}>
                <Form.Label>Flat</Form.Label>
                <Form.Select value={singleFlatId} onChange={(e) => setSingleFlatId(e.target.value)} required>
                  <option value="">Select flat</option>
                  {flats.map((f) => (
                    <option key={f._id} value={f._id}>{f.unitNumber}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={2}>
                <Form.Label>Month</Form.Label>
                <Form.Control placeholder="2026-08" value={singleMonth} onChange={(e) => setSingleMonth(e.target.value)} required />
              </Col>
              <Col md={2}>
                <Form.Label>Due Date</Form.Label>
                <Form.Control type="date" value={singleDueDate} onChange={(e) => setSingleDueDate(e.target.value)} required />
              </Col>
              <Col md={2}>
                <Form.Label>Amount (optional)</Form.Label>
                <Form.Control type="number" placeholder="default" value={singleAmount} onChange={(e) => setSingleAmount(e.target.value)} />
              </Col>
              <Col md={3}>
                <Button type="submit" variant="outline-primary" className="w-100">Generate Single Bill</Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Row className="g-2 mb-3">
        <Col md={3}>
          <Form.Control
            placeholder="Filter by month (2026-08)"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
          />
        </Col>
        <Col md={3}>
          <Form.Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </Form.Select>
        </Col>
      </Row>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Flat</th>
            <th>Month</th>
            <th>Amount</th>
            <th>Due Date</th>
            <th>Status</th>
            <th>Paid On</th>
          </tr>
        </thead>
        <tbody>
          {bills.map((b) => (
            <tr key={b._id}>
              <td>{b.flatRef?.unitNumber}</td>
              <td>{b.month}</td>
              <td>₹{b.amount}</td>
              <td>{new Date(b.dueDate).toLocaleDateString()}</td>
              <td><Badge bg={statusColor[b.status]}>{b.status}</Badge></td>
              <td>{b.paidOn ? new Date(b.paidOn).toLocaleDateString() : "-"}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default AdminBills;
