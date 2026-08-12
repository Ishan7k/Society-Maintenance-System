import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar, Nav, Container, Button, Image } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const AppNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [society, setSociety] = useState(null);

  useEffect(() => {
    api.get("/society").then((res) => setSociety(res.data)).catch(() => {});
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) return null;

  const base = user.role === "admin" ? "/admin" : "/resident";

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4 shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to={`${base}/dashboard`} className="d-flex align-items-center gap-2">
          {society?.logoUrl ? (
            <Image src={society.logoUrl} roundedCircle width={32} height={32} style={{ objectFit: "cover" }} />
          ) : (
            <span>🏢</span>
          )}
          <span>{society?.name || "SMMS"}</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to={`${base}/dashboard`}>Dashboard</Nav.Link>
            {user.role === "admin" ? (
              <>
                <Nav.Link as={Link} to="/admin/flats">Flats</Nav.Link>
                <Nav.Link as={Link} to="/admin/bills">Bills</Nav.Link>
                <Nav.Link as={Link} to="/admin/complaints">Complaints</Nav.Link>
                <Nav.Link as={Link} to="/admin/announcements">Announcements</Nav.Link>
                <Nav.Link as={Link} to="/admin/settings">Settings</Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/resident/bills">My Bills</Nav.Link>
                <Nav.Link as={Link} to="/resident/complaints">My Complaints</Nav.Link>
                <Nav.Link as={Link} to="/resident/announcements">Announcements</Nav.Link>
              </>
            )}
          </Nav>
          <Nav className="align-items-center gap-2">
            <Link to="/profile" className="d-flex align-items-center gap-2 text-light text-decoration-none">
              <Image
                src={user.profileImage || "https://via.placeholder.com/32?text=?"}
                roundedCircle
                width={32}
                height={32}
                style={{ objectFit: "cover" }}
              />
              <span>{user.name}</span>
            </Link>
            <Button variant="outline-light" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
