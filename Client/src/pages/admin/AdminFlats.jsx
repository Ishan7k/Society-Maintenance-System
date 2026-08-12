import { useEffect, useState } from "react";
import { Container, Table, Button, Modal, Form, Alert, Badge } from "react-bootstrap";
import api from "../../api/axios";

const AdminFlats = () => {
  const [flats, setFlats] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [flatForm, setFlatForm] = useState({
    unitNumber: "",
    block: "",
    ownerName: "",
    type: "owner",
    monthlyMaintenanceAmount: 2500,
  });
  const [createResident, setCreateResident] = useState(true);
  const [residentForm, setResidentForm] = useState({ name: "", email: "", password: "", phone: "" });

  // separate modal for linking a resident to a flat that already exists but has no resident yet
  const [linkingFlat, setLinkingFlat] = useState(null);
  const [linkForm, setLinkForm] = useState({ name: "", email: "", password: "", phone: "" });

  const loadFlats = () => {
    api.get("/flats").then((res) => setFlats(res.data)).catch(() => setError("Failed to load flats"));
  };

  useEffect(loadFlats, []);

  const handleCreateFlat = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const { data: flat } = await api.post("/flats", flatForm);

      if (createResident) {
        await api.post("/auth/register", {
          ...residentForm,
          role: "resident",
          flatId: flat._id,
        });
      }

      setSuccess(`Flat ${flat.unitNumber} created successfully.`);
      setShowModal(false);
      setFlatForm({ unitNumber: "", block: "", ownerName: "", type: "owner", monthlyMaintenanceAmount: 2500 });
      setResidentForm({ name: "", email: "", password: "", phone: "" });
      loadFlats();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create flat");
    }
  };

  const handleLinkResident = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await api.post("/auth/register", {
        ...linkForm,
        role: "resident",
        flatId: linkingFlat._id,
      });
      setSuccess(`Resident linked to flat ${linkingFlat.unitNumber}.`);
      setLinkingFlat(null);
      setLinkForm({ name: "", email: "", password: "", phone: "" });
      loadFlats();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to link resident");
    }
  };

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Flats</h3>
        <Button onClick={() => setShowModal(true)}>+ Add Flat</Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Unit</th>
            <th>Block</th>
            <th>Owner</th>
            <th>Type</th>
            <th>Monthly Amount</th>
            <th>Resident Linked</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {flats.map((f) => (
            <tr key={f._id}>
              <td>{f.unitNumber}</td>
              <td>{f.block}</td>
              <td>{f.ownerName}</td>
              <td><Badge bg={f.type === "owner" ? "primary" : "secondary"}>{f.type}</Badge></td>
              <td>₹{f.monthlyMaintenanceAmount}</td>
              <td>{f.residentRef ? f.residentRef.name : <span className="text-muted">Not linked</span>}</td>
              <td>
                {!f.residentRef && (
                  <Button size="sm" variant="outline-primary" onClick={() => setLinkingFlat(f)}>
                    Link Resident
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={!!linkingFlat} onHide={() => setLinkingFlat(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Link Resident to {linkingFlat?.unitNumber}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleLinkResident}>
          <Modal.Body>
            <Form.Group className="mb-2">
              <Form.Label>Resident Name</Form.Label>
              <Form.Control
                value={linkForm.name}
                onChange={(e) => setLinkForm({ ...linkForm, name: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Resident Email</Form.Label>
              <Form.Control
                type="email"
                value={linkForm.email}
                onChange={(e) => setLinkForm({ ...linkForm, email: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Password</Form.Label>
              <Form.Control
                value={linkForm.password}
                onChange={(e) => setLinkForm({ ...linkForm, password: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                value={linkForm.phone}
                onChange={(e) => setLinkForm({ ...linkForm, phone: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setLinkingFlat(null)}>Cancel</Button>
            <Button type="submit">Link Resident</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton><Modal.Title>Add New Flat</Modal.Title></Modal.Header>
        <Form onSubmit={handleCreateFlat}>
          <Modal.Body>
            <Form.Group className="mb-2">
              <Form.Label>Unit Number</Form.Label>
              <Form.Control
                value={flatForm.unitNumber}
                onChange={(e) => setFlatForm({ ...flatForm, unitNumber: e.target.value })}
                placeholder="A-101"
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Block</Form.Label>
              <Form.Control
                value={flatForm.block}
                onChange={(e) => setFlatForm({ ...flatForm, block: e.target.value })}
                placeholder="A"
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Owner Name</Form.Label>
              <Form.Control
                value={flatForm.ownerName}
                onChange={(e) => setFlatForm({ ...flatForm, ownerName: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Type</Form.Label>
              <Form.Select
                value={flatForm.type}
                onChange={(e) => setFlatForm({ ...flatForm, type: e.target.value })}
              >
                <option value="owner">Owner</option>
                <option value="tenant">Tenant</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Monthly Maintenance Amount</Form.Label>
              <Form.Control
                type="number"
                value={flatForm.monthlyMaintenanceAmount}
                onChange={(e) => setFlatForm({ ...flatForm, monthlyMaintenanceAmount: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Check
              type="checkbox"
              label="Also create a resident login for this flat"
              checked={createResident}
              onChange={(e) => setCreateResident(e.target.checked)}
              className="mb-3"
            />

            {createResident && (
              <>
                <Form.Group className="mb-2">
                  <Form.Label>Resident Name</Form.Label>
                  <Form.Control
                    value={residentForm.name}
                    onChange={(e) => setResidentForm({ ...residentForm, name: e.target.value })}
                    required={createResident}
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Resident Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={residentForm.email}
                    onChange={(e) => setResidentForm({ ...residentForm, email: e.target.value })}
                    required={createResident}
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Resident Password</Form.Label>
                  <Form.Control
                    type="text"
                    value={residentForm.password}
                    onChange={(e) => setResidentForm({ ...residentForm, password: e.target.value })}
                    required={createResident}
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    value={residentForm.phone}
                    onChange={(e) => setResidentForm({ ...residentForm, phone: e.target.value })}
                  />
                </Form.Group>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit">Create</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default AdminFlats;
