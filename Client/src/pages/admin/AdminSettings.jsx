import { useEffect, useState } from "react";
import { Container, Card, Form, Button, Alert, Row, Col, Image } from "react-bootstrap";
import api from "../../api/axios";

const AdminSettings = () => {
  const [society, setSociety] = useState(null);
  const [form, setForm] = useState({ name: "", address: "", contactEmail: "", contactPhone: "" });
  const [logoFile, setLogoFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadSociety = () => {
    api.get("/society").then((res) => {
      setSociety(res.data);
      setForm({
        name: res.data.name || "",
        address: res.data.address || "",
        contactEmail: res.data.contactEmail || "",
        contactPhone: res.data.contactPhone || "",
      });
    });
  };

  useEffect(loadSociety, []);

  const handleSaveDetails = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const { data } = await api.put("/society", form);
      setSociety(data);
      setSuccess("Society details updated.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update details");
    }
  };

  const handleLogoUpload = async (e) => {
    e.preventDefault();
    if (!logoFile) return;
    setError("");
    setSuccess("");
    try {
      const formData = new FormData();
      formData.append("logo", logoFile);
      const { data } = await api.post("/society/logo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSociety(data);
      setSuccess("Logo uploaded successfully.");
      setLogoFile(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload logo");
    }
  };

  if (!society) return null;

  return (
    <Container>
      <h3 className="mb-3">Society Settings</h3>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Row className="g-3">
        <Col md={5}>
          <Card className="shadow-sm">
            <Card.Body className="text-center">
              <Card.Title className="fs-6 text-muted mb-3">Society Logo</Card.Title>
              <Image
                src={society.logoUrl || "https://via.placeholder.com/150?text=No+Logo"}
                roundedCircle
                width={150}
                height={150}
                style={{ objectFit: "cover" }}
                className="mb-3 border"
              />
              <Form onSubmit={handleLogoUpload}>
                <Form.Group className="mb-2">
                  <Form.Control type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files[0])} />
                </Form.Group>
                <Button type="submit" size="sm" disabled={!logoFile}>Upload Logo</Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={7}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title className="fs-6 text-muted mb-3">Society Details</Card.Title>
              <Form onSubmit={handleSaveDetails}>
                <Form.Group className="mb-2">
                  <Form.Label>Society Name</Form.Label>
                  <Form.Control value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Address</Form.Label>
                  <Form.Control value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Contact Email</Form.Label>
                  <Form.Control type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Contact Phone</Form.Label>
                  <Form.Control value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
                </Form.Group>
                <Button type="submit">Save Details</Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminSettings;
