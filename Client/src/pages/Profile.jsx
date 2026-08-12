import { useState } from "react";
import { Container, Card, Image, Form, Button, Alert, Row, Col, Badge } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const [photoFile, setPhotoFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!photoFile) return;
    setError("");
    setSuccess("");
    try {
      const formData = new FormData();
      formData.append("photo", photoFile);
      const { data } = await api.post("/auth/profile-photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      localStorage.setItem("smms_user", JSON.stringify(data.user));
      if (refreshUser) refreshUser(data.user);
      setSuccess("Profile photo updated.");
      setPhotoFile(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload photo");
    }
  };

  if (!user) return null;

  return (
    <Container>
      <h3 className="mb-3">My Profile</h3>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Row className="g-3">
        <Col md={4}>
          <Card className="shadow-sm text-center">
            <Card.Body>
              <Image
                src={user.profileImage || "https://via.placeholder.com/150?text=No+Photo"}
                roundedCircle
                width={150}
                height={150}
                style={{ objectFit: "cover" }}
                className="mb-3 border"
              />
              <Form onSubmit={handleUpload}>
                <Form.Group className="mb-2">
                  <Form.Control type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files[0])} />
                </Form.Group>
                <Button type="submit" size="sm" disabled={!photoFile}>Upload Photo</Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        <Col md={8}>
          <Card className="shadow-sm">
            <Card.Body>
              <h5>{user.name} <Badge bg="secondary">{user.role}</Badge></h5>
              <p className="text-muted mb-1">Email: {user.email}</p>
              <p className="text-muted mb-0">Phone: {user.phone || "-"}</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
