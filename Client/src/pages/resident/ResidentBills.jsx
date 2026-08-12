import { useEffect, useState } from "react";
import { Container, Table, Badge, Button, Modal, Form, Alert } from "react-bootstrap";
import api from "../../api/axios";

const statusColor = { paid: "success", pending: "warning", overdue: "danger" };

const ResidentBills = () => {
  const [bills, setBills] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [payingBill, setPayingBill] = useState(null);
  const [mode, setMode] = useState("upi");

  const loadBills = () => {
    api.get("/bills").then((res) => setBills(res.data)).catch(() => setError("Failed to load bills"));
  };

  useEffect(loadBills, []);

  const handlePay = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await api.post("/payments", {
        billId: payingBill._id,
        amount: payingBill.amount,
        mode,
        transactionNote: "Paid via SMMS portal",
      });
      setSuccess(`Payment of ₹${payingBill.amount} for ${payingBill.month} recorded successfully.`);
      setPayingBill(null);
      loadBills();
    } catch (err) {
      setError(err.response?.data?.message || "Payment failed");
    }
  };

  return (
    <Container>
      <h3 className="mb-3">My Bills</h3>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Month</th>
            <th>Amount</th>
            <th>Due Date</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {bills.map((b) => (
            <tr key={b._id}>
              <td>{b.month}</td>
              <td>₹{b.amount}</td>
              <td>{new Date(b.dueDate).toLocaleDateString()}</td>
              <td><Badge bg={statusColor[b.status]}>{b.status}</Badge></td>
              <td>
                {b.status !== "paid" ? (
                  <Button size="sm" onClick={() => setPayingBill(b)}>Pay Now</Button>
                ) : (
                  <span className="text-muted small">Paid on {new Date(b.paidOn).toLocaleDateString()}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={!!payingBill} onHide={() => setPayingBill(null)}>
        <Modal.Header closeButton><Modal.Title>Pay Maintenance Bill</Modal.Title></Modal.Header>
        <Form onSubmit={handlePay}>
          <Modal.Body>
            {payingBill && (
              <>
                <p>Month: <strong>{payingBill.month}</strong></p>
                <p>Amount: <strong>₹{payingBill.amount}</strong></p>
                <Form.Group>
                  <Form.Label>Payment Mode (mock — no real gateway)</Form.Label>
                  <Form.Select value={mode} onChange={(e) => setMode(e.target.value)}>
                    <option value="upi">UPI</option>
                    <option value="card">Card</option>
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </Form.Select>
                </Form.Group>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setPayingBill(null)}>Cancel</Button>
            <Button type="submit" variant="success">Confirm Payment</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default ResidentBills;
