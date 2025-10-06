import React from 'react';
import { Navbar as BootstrapNavbar, Nav, Container, Button, Dropdown } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  return (
    <BootstrapNavbar expand="lg" className="navbar" variant="dark">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/">
          🏠 House Rental
        </BootstrapNavbar.Brand>
        
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/listings">Browse</Nav.Link>
            {user && <Nav.Link as={Link} to="/favorites">Favorites</Nav.Link>}
            {user?.role === 'user' && <Nav.Link as={Link} to="/user-dashboard">Dashboard</Nav.Link>}
            {user?.role === 'owner' && <Nav.Link as={Link} to="/owner-dashboard">Dashboard</Nav.Link>}
            {user?.role === 'admin' && <Nav.Link as={Link} to="/admin-dashboard">Dashboard</Nav.Link>}
          </Nav>
          
          <Nav className="ms-auto">
            {user ? (
              <>
                <Nav.Link onClick={logout}>Logout ({user.name})</Nav.Link>
                {user?.role === 'owner' && (
                  <Button 
                    as={Link} 
                    to="/owner-add-listing" 
                    variant="success" 
                    size="sm" 
                    className="ms-2"
                  >
                    Post Property FREE
                  </Button>
                )}
              </>
            ) : (
              <>
                <Dropdown align="end">
                  <Dropdown.Toggle variant="outline-light" size="sm">
                    Login
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Header>Choose Login Type</Dropdown.Header>
                    <Dropdown.Item as={Link} to="/user-login">
                      User Login
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/owner-login">
                      Owner Login
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/admin-login">
                      Admin Login
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
                <Button 
                  as={Link} 
                  to="/register" 
                  variant="light" 
                  size="sm" 
                  className="ms-2"
                >
                  Sign Up
                </Button>
              </>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;