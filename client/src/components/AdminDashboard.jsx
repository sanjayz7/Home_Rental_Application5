import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Table, Modal, Form, Alert, Dropdown, Badge } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [exportType, setExportType] = useState('listings');
  const [exportFormat, setExportFormat] = useState('csv');
  const [useSampleExport, setUseSampleExport] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [alert, setAlert] = useState({ show: false, message: '', type: 'info' });

  // Statistics state
  const [stats, setStats] = useState({
    totalListings: 0,
    verifiedListings: 0,
    totalUsers: 0,
    activeUsers: 0,
    owners: 0,
    totalBookings: 0,
    withImages: 0,
    withLocation: 0
  });

  const showAlert = (message, type = 'info') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: 'info' }), 5000);
  };

  const calculateStats = (listingsData, bookingsData, usersData) => {
    const verifiedListings = listingsData.filter(l => l.verified).length;
    const activeUsers = usersData.filter(u => u.role === 'user').length;
    const owners = usersData.filter(u => u.role === 'owner').length;
    const withImages = Math.floor(listingsData.length * 0.8); // Mock calculation
    const withLocation = Math.floor(listingsData.length * 0.6); // Mock calculation

    setStats({
      totalListings: listingsData.length,
      verifiedListings,
      totalUsers: usersData.length,
      activeUsers,
      owners,
      totalBookings: bookingsData.length,
      withImages,
      withLocation
    });
  };

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      // Load all data in parallel
      const [listingsRes, bookingsRes, usersRes, statsRes] = await Promise.all([
        api.get('/listings'),
        api.get('/admin/bookings'),
        api.get('/admin/users'),
        api.get('/admin/stats')
      ]);

      setListings(listingsRes.data || []);
      setBookings(bookingsRes.data || []);
      setUsers(usersRes.data || []);
      
      // Set statistics from API
      if (statsRes.data) {
        setStats(statsRes.data);
      } else {
        // Fallback to calculating from data
        calculateStats(listingsRes.data || [], bookingsRes.data || [], usersRes.data || []);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      showAlert('Error loading dashboard data', 'danger');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadDashboardData();
    } else {
      navigate('/admin-login');
    }
  }, [user, navigate, loadDashboardData]);


  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Render functions
  const renderBookingsTable = () => {
    if (bookings.length === 0) {
      return (
        <tr>
          <td colSpan="7" className="text-center">No bookings found</td>
        </tr>
      );
    }

    return bookings.map(booking => (
      <tr key={booking.id}>
        <td>#{booking.id}</td>
        <td>{booking.userEmail}</td>
        <td>Listing #{booking.listingId}</td>
        <td>
          <Badge bg="success" className="modern-badge">
            <i className="fas fa-gift me-1"></i>$0.00
          </Badge>
        </td>
        <td>{booking.date}</td>
        <td>
          <span className={`badge bg-${booking.status === 'confirmed' ? 'success' : 'warning'}`}>
            {booking.status}
          </span>
        </td>
        <td>
          <Button 
            variant="outline-info" 
            size="sm"
            onClick={() => viewBookingDetails(booking.id)}
          >
            <i className="fas fa-eye"></i>
          </Button>
        </td>
      </tr>
    ));
  };

  const renderListingsTable = () => {
    if (listings.length === 0) {
      return (
        <tr>
          <td colSpan="7" className="text-center">No listings found</td>
        </tr>
      );
    }

    return listings.map(listing => (
      <tr key={listing.id}>
        <td>#{listing.id}</td>
        <td>{listing.title}</td>
        <td>{listing.address}</td>
        <td>{listing.rent?.toLocaleString()}</td>
        <td>{listing.ownerEmail}</td>
        <td>
          <Badge 
            bg={listing.verified ? 'success' : 'warning'} 
            className="modern-badge"
          >
            <i className={`fas fa-${listing.verified ? 'shield-check' : 'clock'} me-1`}></i>
            {listing.verified ? 'Verified' : 'Pending'}
          </Badge>
        </td>
        <td>
          <Dropdown className="modern-dropdown">
            <Dropdown.Toggle variant="outline-primary" size="sm">
              <i className="fas fa-ellipsis-v"></i>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => createZeroBooking(listing.id)}>
                <i className="fas fa-handshake me-2 text-success"></i>Create Free Booking
              </Dropdown.Item>
              <Dropdown.Item onClick={() => viewListing(listing.id)}>
                <i className="fas fa-eye me-2 text-info"></i>View Details
              </Dropdown.Item>
              <Dropdown.Item onClick={() => editListing(listing.id)}>
                <i className="fas fa-edit me-2 text-warning"></i>Edit Property
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item 
                className="text-danger" 
                onClick={() => deleteListing(listing.id)}
              >
                <i className="fas fa-trash me-2"></i>Delete Property
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </td>
      </tr>
    ));
  };

  const renderRecentActivity = () => {
    const activities = [
      { type: 'success', icon: 'plus-circle', text: 'New property listing added', time: '5 min ago' },
      { type: 'info', icon: 'handshake', text: 'Zero-fee booking created', time: '12 min ago' },
      { type: 'warning', icon: 'shield-check', text: 'Property verification completed', time: '28 min ago' },
      { type: 'primary', icon: 'envelope', text: 'Bulk email campaign sent', time: '1 hour ago' },
      { type: 'success', icon: 'user-plus', text: 'New owner registration', time: '2 hours ago' }
    ];

    return activities.map((activity, index) => (
      <div key={index} className="activity-item">
        <div className="activity-time">
          <i className={`fas fa-${activity.icon} me-1 text-${activity.type}`}></i>
          {activity.time}
        </div>
        <div className="activity-content">{activity.text}</div>
      </div>
    ));
  };

  // Action functions
  const createZeroFeeBooking = async () => {
    try {
      const newBooking = {
        listingId: listings[0]?.id || 1,
        userEmail: user?.email || 'admin@example.com',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        status: 'confirmed'
      };

      await api.post('/admin/bookings', newBooking);
      showAlert('Zero-fee booking created successfully!', 'success');
      loadDashboardData();
    } catch (error) {
      console.error('Error creating booking:', error);
      showAlert('Error creating booking', 'danger');
    }
  };

  const createZeroBooking = async (listingId) => {
    try {
      const newBooking = {
        listingId: listingId,
        userEmail: user?.email || 'admin@example.com',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        status: 'confirmed'
      };

      await api.post('/admin/bookings', newBooking);
      showAlert(`Zero-fee booking created for listing #${listingId}!`, 'success');
      loadDashboardData();
    } catch (error) {
      console.error('Error creating booking:', error);
      showAlert('Error creating booking', 'danger');
    }
  };

  const verifyAllListings = async () => {
    try {
      const unverifiedListings = listings.filter(l => !l.verified);
      await Promise.all(
        unverifiedListings.map(listing => 
          api.put(`/listings/${listing.id}`, { verified: true })
        )
      );
      showAlert('All listings have been verified!', 'success');
      loadDashboardData();
    } catch (error) {
      console.error('Error verifying listings:', error);
      showAlert('Error verifying listings', 'danger');
    }
  };

  const sendWelcomeEmails = async () => {
    try {
      const response = await api.post('/admin/send-welcome-emails');
      showAlert(`Welcome emails sent to ${response.data.recipients || users.length} users!`, 'info');
    } catch (error) {
      console.error('Error sending emails:', error);
      showAlert('Error sending emails', 'danger');
    }
  };

  const viewBookingDetails = (bookingId) => {
    showAlert(`Viewing details for booking #${bookingId}`, 'info');
  };

  const viewListing = (listingId) => {
    showAlert(`Viewing listing #${listingId}`, 'info');
  };

  const editListing = (listingId) => {
    showAlert(`Editing listing #${listingId}`, 'info');
  };

  const deleteListing = async (listingId) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await api.delete(`/listings/${listingId}`);
        showAlert('Listing deleted successfully!', 'warning');
        loadDashboardData();
      } catch (error) {
        console.error('Error deleting listing:', error);
        showAlert('Error deleting listing', 'danger');
      }
    }
  };

  const refreshListings = () => {
    loadDashboardData();
    showAlert('Listings refreshed!', 'info');
  };

  // Export functionality
  const performExport = () => {
    exportData(exportType, exportFormat, useSampleExport);
    setShowExportModal(false);
  };

  const exportData = async (type, format, mock = false) => {
    try {
      let data = [];
      let filename = '';
      const mockQuery = mock ? '?mock=1' : '';

      // Fetch data from API for export
      let response;
      switch (type) {
        case 'listings':
          response = await api.get(`/admin/export/listings${mockQuery}`);
          data = response.data;
          filename = 'listings_report';
          break;
        case 'bookings':
          response = await api.get(`/admin/export/bookings${mockQuery}`);
          data = response.data;
          filename = 'bookings_report';
          break;
        case 'users':
          response = await api.get(`/admin/export/users${mockQuery}`);
          data = response.data;
          filename = 'users_report';
          break;
      }

      if (format === 'csv') {
        downloadCSV(convertToCSV(data), `${filename}.csv`);
      } else if (format === 'json') {
        downloadJSON(data, `${filename}.json`);
      }

      showAlert(`${type} report exported successfully!`, 'success');
    } catch (error) {
      console.error('Error exporting data:', error);
      showAlert('Error exporting data', 'danger');
    }
  };

  const convertToCSV = (data) => {
    if (!data.length) return '';
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(',')
    );
    return [csvHeaders, ...csvRows].join('\n');
  };

  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    downloadFile(blob, filename);
  };

  const downloadJSON = (data, filename) => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    downloadFile(blob, filename);
  };

  const downloadFile = (blob, filename) => {
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Email functionality
  const sendBulkEmail = async () => {
    if (!emailSubject || !emailBody) {
      showAlert('Please fill in both subject and message fields', 'warning');
      return;
    }

    try {
      const response = await api.post('/admin/send-bulk-email', {
        subject: emailSubject,
        body: emailBody
      });
      showAlert(`Bulk email sent successfully to ${response.data.recipients || users.length} users!`, 'success');
      setShowEmailModal(false);
      setEmailSubject('');
      setEmailBody('');
    } catch (error) {
      console.error('Error sending bulk email:', error);
      showAlert('Error sending bulk email', 'danger');
    }
  };

  if (loading) {
    return (
      <div className="modern-loading">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <h5 className="mt-3 text-dark fw-bold">Loading Admin Dashboard...</h5>
          <p className="text-muted">Gathering system insights and analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-dashboard admin-dashboard">
      {/* Alert */}
      {alert.show && (
        <Alert 
          variant={alert.type} 
          dismissible 
          onClose={() => setAlert({ show: false, message: '', type: 'info' })}
          className="position-fixed slide-in-right"
          style={{ top: '100px', right: '20px', zIndex: 9999, minWidth: '320px' }}
        >
          <div className="d-flex align-items-center">
            <i className={`fas fa-${
              alert.type === 'success' ? 'check-circle' : 
              alert.type === 'danger' ? 'exclamation-triangle' : 
              alert.type === 'warning' ? 'exclamation-circle' : 'info-circle'
            } me-2`}></i>
            {alert.message}
          </div>
        </Alert>
      )}

      {/* Enhanced Header */}
      <div className="modern-header admin-header">
        <Container>
          <Row className="align-items-center">
            <Col lg={8}>
              <div className="fade-in">
                <h1 className="mb-2">
                  <i className="fas fa-crown me-3"></i>Admin Control Center
                </h1>
                <p className="header-subtitle mb-0">
                  Comprehensive platform management and analytics dashboard
                </p>
              </div>
            </Col>
            <Col lg={4} className="text-end">
              <div className="header-actions">
                <Button 
                  variant="outline-light" 
                  className="me-2"
                  onClick={() => setShowExportModal(true)}
                >
                  <i className="fas fa-download me-2"></i>
                  <span className="d-none d-md-inline">Export</span>
                </Button>
                <Button 
                  variant="outline-light"
                  className="me-2"
                  onClick={() => setShowEmailModal(true)}
                >
                  <i className="fas fa-envelope me-2"></i>
                  <span className="d-none d-md-inline">Email</span>
                </Button>
                <Button 
                  variant="light"
                  onClick={handleLogout}
                >
                  <i className="fas fa-sign-out-alt me-2"></i>
                  <span className="d-none d-md-inline">Logout</span>
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      <Container>
        {/* Enhanced Statistics Cards */}
        <Row className="mb-4 slide-up">
          <Col lg={3} md={6} className="mb-3">
            <Card className="modern-stats-card admin-stat">
              <Card.Body>
                <div className="stats-icon text-primary">
                  <i className="fas fa-building"></i>
                </div>
                <h3 className="text-primary">{stats.totalListings}</h3>
                <div className="stats-label">Total Properties</div>
                <div className="stats-subtitle">
                  <Badge bg="success" className="modern-badge me-1">{stats.verifiedListings}</Badge>
                  verified listings
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <Card className="modern-stats-card admin-stat">
              <Card.Body>
                <div className="stats-icon text-success">
                  <i className="fas fa-users"></i>
                </div>
                <h3 className="text-success">{stats.totalUsers}</h3>
                <div className="stats-label">Platform Users</div>
                <div className="stats-subtitle">
                  <Badge bg="info" className="modern-badge me-1">{stats.activeUsers}</Badge>
                  active • 
                  <Badge bg="warning" className="modern-badge ms-1">{stats.owners}</Badge>
                  owners
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <Card className="modern-stats-card admin-stat">
              <Card.Body>
                <div className="stats-icon text-info">
                  <i className="fas fa-handshake"></i>
                </div>
                <h3 className="text-info">{stats.totalBookings}</h3>
                <div className="stats-label">Zero-Fee Bookings</div>
                <div className="stats-subtitle">
                  <Badge bg="success" className="modern-badge">100% Free</Badge>
                  <span className="ms-1">No Platform Fees</span>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6} className="mb-3">
            <Card className="modern-stats-card admin-stat">
              <Card.Body>
                <div className="stats-icon text-warning">
                  <i className="fas fa-images"></i>
                </div>
                <h3 className="text-warning">{stats.withImages}</h3>
                <div className="stats-label">Media Rich</div>
                <div className="stats-subtitle">
                  <Badge bg="primary" className="modern-badge me-1">{stats.withLocation}</Badge>
                  with GPS location
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Enhanced Quick Actions */}
        <Row className="mb-4 fade-in">
          <Col lg={6} className="mb-3">
            <Card className="modern-action-card">
              <Card.Header className="bg-gradient-primary text-white">
                <i className="fas fa-bolt me-2"></i>Admin Quick Actions
              </Card.Header>
              <Card.Body>
                <Button 
                  variant="success" 
                  onClick={createZeroFeeBooking}
                  disabled={loading}
                >
                  <i className="fas fa-plus me-2"></i>Create Free Booking
                </Button>
                <Button 
                  variant="info" 
                  onClick={verifyAllListings}
                  disabled={loading}
                >
                  <i className="fas fa-shield-check me-2"></i>Verify All Listings
                </Button>
                <Button 
                  variant="warning" 
                  onClick={sendWelcomeEmails}
                  disabled={loading}
                >
                  <i className="fas fa-envelope-open me-2"></i>Send Welcome Emails
                </Button>
                <Button 
                  variant="outline-primary" 
                  onClick={loadDashboardData}
                  disabled={loading}
                >
                  <i className="fas fa-sync-alt me-2"></i>Refresh Data
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={6} className="mb-3">
            <Card className="modern-action-card">
              <Card.Header className="bg-gradient-info text-white">
                <i className="fas fa-activity me-2"></i>System Activity
              </Card.Header>
              <Card.Body>
                <div className="activity-feed">
                  {renderRecentActivity()}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Recent Bookings */}
        <Card className="modern-table-container mb-4 scale-in">
          <Card.Header className="d-flex justify-content-between align-items-center bg-gradient-success text-white">
            <div>
              <i className="fas fa-handshake me-2"></i>Zero-Fee Bookings
            </div>
            <Badge bg="light" text="dark" className="modern-badge">
              <i className="fas fa-gift me-1"></i>100% Free Platform
            </Badge>
          </Card.Header>
          <Card.Body>
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>User Email</th>
                    <th>Listing</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="text-center">Loading bookings...</td>
                    </tr>
                  ) : (
                    renderBookingsTable()
                  )}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>

        {/* All Listings Management */}
        <Card className="modern-table-container fade-in">
          <Card.Header className="d-flex justify-content-between align-items-center bg-gradient-primary text-white">
            <div>
              <i className="fas fa-building me-2"></i>Property Management
            </div>
            <div>
              <Button 
                variant="light" 
                size="sm" 
                className="me-2"
                onClick={() => exportData('listings', 'csv')}
              >
                <i className="fas fa-download me-1"></i>Export
              </Button>
              <Button 
                variant="outline-light" 
                size="sm"
                onClick={refreshListings}
              >
                <i className="fas fa-sync-alt me-1"></i>Refresh
              </Button>
            </div>
          </Card.Header>
          <Card.Body>
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Address</th>
                    <th>Rent</th>
                    <th>Owner Email</th>
                    <th>Verified</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="text-center">Loading listings...</td>
                    </tr>
                  ) : (
                    renderListingsTable()
                  )}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      </Container>

      {/* Export Modal */}
      <Modal show={showExportModal} onHide={() => setShowExportModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title><i className="fas fa-download me-2"></i>Export Reports</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Report Type</Form.Label>
            <Form.Select 
              value={exportType} 
              onChange={(e) => setExportType(e.target.value)}
            >
              <option value="listings">Listings Report</option>
              <option value="bookings">Bookings Report</option>
              <option value="users">Users Report</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Export Format</Form.Label>
            <Form.Select 
              value={exportFormat} 
              onChange={(e) => setExportFormat(e.target.value)}
            >
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Check
              type="switch"
              id="use-sample-export"
              label="Use sample data (dummy export)"
              checked={useSampleExport}
              onChange={(e) => setUseSampleExport(e.target.checked)}
            />
            <Form.Text className="text-muted">
              Enable to download generated sample rows without touching live data.
            </Form.Text>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Date Range (Optional)</Form.Label>
            <Row>
              <Col>
                <Form.Control type="date" placeholder="Start Date" />
              </Col>
              <Col>
                <Form.Control type="date" placeholder="End Date" />
              </Col>
            </Row>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowExportModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={performExport}>
            Export Report
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Email Modal */}
      <Modal show={showEmailModal} onHide={() => setShowEmailModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title><i className="fas fa-envelope me-2"></i>Send Bulk Email</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Recipients</Form.Label>
            <Form.Control 
              type="text" 
              readOnly 
              value="All registered users will receive this email"
            />
            <Form.Text className="text-muted">
              Email will be sent to all user email addresses in the system
            </Form.Text>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Subject</Form.Label>
            <Form.Control 
              type="text" 
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder="Enter email subject"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Message</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={8}
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              placeholder="Enter your message here..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEmailModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={sendBulkEmail}>
            Send Email
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminDashboard;