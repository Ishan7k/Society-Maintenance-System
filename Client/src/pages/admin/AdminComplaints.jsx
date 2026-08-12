import { useEffect, useState } from "react";
import { Container, Table, Badge, Form, Alert } from "react-bootstrap";
import api from "../../api/axios";

const statusColor = { open: "secondary", "in-progress": "info", resolved: "success" };

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [error, setError] = useState("");

  const loadComplaints = () => {
    api.get("/complaints").then((res) => setComplaints(res.data)).catch(() => setError("Failed to load complaints"));
  };

  useEffect(loadComplaints, []);

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/complaints/${id}`, { status });
      loadComplaints();
    } catch {
      setError("Failed to update complaint status");
    }
  };

  return (
    <Container>
      <h3 className="mb-3">Complaints</h3>
      {error && <Alert variant="danger">{error}</Alert>}

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Flat</th>
            <th>Raised By</th>
            <th>Category</th>
            <th>Description</th>
            <th>Status</th>
            <th>Update Status</th>
          </tr>
        </thead>
        <tbody>
          {complaints.map((c) => (
            <tr key={c._id}>
              <td>{c.flatRef?.unitNumber}</td>
              <td>{c.raisedBy?.name}</td>
              <td className="text-capitalize">{c.category}</td>
              <td>{c.description}</td>
              <td><Badge bg={statusColor[c.status]}>{c.status}</Badge></td>
              <td>
                <Form.Select
                  size="sm"
                  value={c.status}
                  onChange={(e) => handleStatusChange(c._id, e.target.value)}
                >
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </Form.Select>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default AdminComplaints;
