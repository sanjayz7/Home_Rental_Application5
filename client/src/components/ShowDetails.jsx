import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Badge, Row, Col, Form, Alert, Modal } from 'react-bootstrap';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { getHouseById, getOwnerByHouseId } from '../data/sampleHouses';

const ShowDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rating, setRating] = useState(0);
  const [ratingSaved, setRatingSaved] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [showNavigationModal, setShowNavigationModal] = useState(false);
  const [navigationLoading, setNavigationLoading] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseAlert, setPurchaseAlert] = useState({ show: false, message: '', variant: 'success' });

  // Format date to more readable format
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Get user's current location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      setNavigationLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          
          // Calculate distance if we have both user location and property location
          if (show?.LATITUDE && show?.LONGITUDE) {
            const dist = calculateDistance(
              latitude, 
              longitude, 
              show.LATITUDE, 
              show.LONGITUDE
            );
            setDistance(dist);
          }
          setNavigationLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setNavigationLoading(false);
          alert('Unable to get your location. Please enable location services.');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  // Open Google Maps with directions
  const openGoogleMapsDirections = () => {
    if (!userLocation) {
      getUserLocation();
      return;
    }

    if (show?.LATITUDE && show?.LONGITUDE) {
      const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${show.LATITUDE},${show.LONGITUDE}`;
      window.open(url, '_blank');
    } else if (show?.ADDRESS) {
      const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${encodeURIComponent(show.ADDRESS)}`;
      window.open(url, '_blank');
    }
  };

  // Fetch show data - use sample data for now
  useEffect(() => {
    const fetchShowDetails = async () => {
      try {
        setLoading(true);
        // First try to get from sample data
        const sampleShow = getHouseById(id);
        if (sampleShow) {
          setShow(sampleShow);
        } else {
          // Fallback to API call
          const response = await api.get(`/listings/${id}`);
          setShow(response.data);
        }
      } catch (err) {
        console.error('Error fetching show details:', err);
        setError('Failed to load show details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchShowDetails();
  }, [id]);

  useEffect(() => {
    // Load existing rating from localStorage
    const ratings = JSON.parse(localStorage.getItem('ratings') || '{}');
    if (ratings[id]) setRating(ratings[id]);
  }, [id]);

  const saveRating = () => {
    const ratings = JSON.parse(localStorage.getItem('ratings') || '{}');
    ratings[id] = rating;
    localStorage.setItem('ratings', JSON.stringify(ratings));
    setRatingSaved(true);
    setTimeout(() => setRatingSaved(false), 1500);
  };

  // Handle property request
  const handlePropertyRequest = async () => {
    if (!user) {
      setPurchaseAlert({
        show: true,
        message: 'Please login to request property details',
        variant: 'warning'
      });
      return;
    }

    if (user.role !== 'user') {
      setPurchaseAlert({
        show: true,
        message: 'Only regular users can request property details',
        variant: 'warning'
      });
      return;
    }

    if (!show) {
      setPurchaseAlert({
        show: true,
        message: 'Property not found',
        variant: 'warning'
      });
      return;
    }

    setPurchaseLoading(true);
    try {
      // For demo purposes, we'll simulate the request
      const requestData = {
        listingId: show.SHOW_ID || show._id,
        ownerEmail: show.owner.email,
        ownerName: show.owner.name,
        propertyTitle: show.TITLE,
        userEmail: user.email,
        userName: user.name,
        message: requestMessage || "I'm interested in viewing this property. Please provide more details.",
        timestamp: new Date().toISOString()
      };
      
      // Store request in localStorage for demo
      const existingRequests = JSON.parse(localStorage.getItem('propertyRequests') || '[]');
      existingRequests.push(requestData);
      localStorage.setItem('propertyRequests', JSON.stringify(existingRequests));
      
      // Also try API call (will work if backend is available)
      try {
        await api.post('/api/property-requests', requestData);
      } catch (apiError) {
        console.log('API not available, using localStorage only');
      }
      
      setPurchaseAlert({
        show: true,
        message: `Request sent successfully to ${show.owner.name}! The owner will contact you soon at your registered email.`,
        variant: 'success'
      });

      setShowRequestModal(false);
      
      // Hide alert after 5 seconds
      setTimeout(() => {
        setPurchaseAlert({ show: false, message: '', variant: 'success' });
      }, 5000);

    } catch (error) {
      console.error('Purchase error:', error);
      setPurchaseAlert({
        show: true,
        message: error.response?.data?.message || 'Failed to purchase property. Please try again.',
        variant: 'danger'
      });
      
      // Hide alert after 5 seconds
      setTimeout(() => {
        setPurchaseAlert({ show: false, message: '', variant: 'success' });
      }, 5000);
    } finally {
      setPurchaseLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-5"><h3>Loading listing details...</h3></div>;
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
        <Button variant="link" onClick={() => navigate('/')}>Return to Listings</Button>
      </div>
    );
  }

  if (!show) {
    return (
      <div className="text-center py-5">
        <h3>Listing not found</h3>
        <Button variant="primary" onClick={() => navigate('/')}>Return to Listings</Button>
      </div>
    );
  }

  return (
    <div>
      {/* Purchase Alert */}
      {purchaseAlert.show && (
        <Alert 
          variant={purchaseAlert.variant} 
          dismissible 
          onClose={() => setPurchaseAlert({ show: false, message: '', variant: 'success' })}
          className="mb-3"
        >
          {purchaseAlert.message}
        </Alert>
      )}

      <div className="d-flex justify-content-between align-items-center page-header">
        <h2>Listing Details</h2>
        <div>
          <Button 
            variant="outline-secondary" 
            onClick={() => navigate(`/show/edit/${id}`)}
            className="me-2"
          >
            Edit Listing
          </Button>
          <Button 
            variant="outline-warning" 
            className="me-2"
            onClick={() => {
              const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
              if (!favs.find(f => f.SHOW_ID === show.SHOW_ID)) {
                favs.push(show);
                localStorage.setItem('favorites', JSON.stringify(favs));
              }
              navigate('/favorites');
            }}
          >
            Add to Favorites
          </Button>
          <Button 
            variant="primary" 
            onClick={() => navigate('/')}
          >
            Back to Listings
          </Button>
        </div>
      </div>

      <Card className="show-details mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h3 className="mb-0">{show.TITLE}</h3>
          {show.CATEGORY && (
            <Badge bg="info" className="px-3 py-2">{show.CATEGORY}</Badge>
          )}
          {show.VERIFIED && (
            <Badge bg="success" className="px-3 py-2 ms-2">Verified</Badge>
          )}
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={8}>
              {show.IMAGE_URL && (
                <div className="mb-3">
                  <img src={show.IMAGE_URL} alt={show.TITLE} style={{ maxWidth: '100%', borderRadius: 8 }} />
                </div>
              )}
              {show.DESCRIPTION && (
                <div className="mb-4">
                  <h5>Description</h5>
                  <p>{show.DESCRIPTION}</p>
                </div>
              )}

              <div className="mb-4">
                <h5>Rating</h5>
                <div className="d-flex align-items-center gap-2">
                  <Form.Range min={1} max={5} value={rating} onChange={(e) => setRating(Number(e.target.value))} />
                  <span>{rating || 0}/5</span>
                  {user?.role === 'user' && (
                    <Button size="sm" variant="outline-primary" onClick={saveRating}>Save Rating</Button>
                  )}
                </div>
                {ratingSaved && <small className="text-success">Rating saved</small>}
              </div>

              <Row className="mb-4">
                <Col md={6}>
                  <h5>Availability</h5>
                  <p>
                    <strong>Available From:</strong> {formatDate(show.SHOW_DATE)}<br />
                    {show.PRICE && (<><strong>Rent:</strong> ${show.PRICE} / month</>)}<br />
                    {show.BEDROOMS ? <><strong>Bedrooms:</strong> {show.BEDROOMS}<br /></> : null}
                    {show.BATHROOMS ? <><strong>Bathrooms:</strong> {show.BATHROOMS}<br /></> : null}
                    {show.AREA_SQFT ? <><strong>Area:</strong> {show.AREA_SQFT} sqft<br /></> : null}
                    {show.FURNISHED ? <><strong>Furnishing:</strong> {show.FURNISHED}</> : null}
                  </p>
                </Col>
                <Col md={6}>
                  <h5>Address</h5>
                  <p>{show.ADDRESS || show.VENUE}</p>
                </Col>
              </Row>
            </Col>
            
            <Col md={4}>
              <Card className="bg-light">
                <Card.Body>
                  <h5 className="mb-3">
                    <i className="fas fa-user-circle me-2"></i>
                    Owner Details
                  </h5>
                  
                  {/* Owner Information */}
                  <div className="mb-3 border-bottom pb-3">
                    <div className="d-flex align-items-start mb-3">
                      <div className="flex-grow-1">
                        <h6 className="mb-1 text-primary">{show.owner?.name || 'John Smith'}</h6>
                        {show.owner?.verified && (
                          <Badge bg="success" className="mb-2">
                            <i className="fas fa-shield-check me-1"></i>
                            Verified Owner
                          </Badge>
                        )}
                        <p className="mb-1 text-muted small">
                          {show.owner?.bio || 'Professional property owner with experience in real estate.'}
                        </p>
                        <p className="mb-0 small">
                          <strong>Member since:</strong> {show.owner?.joinedDate ? new Date(show.owner.joinedDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="contact-info bg-white rounded p-2 mb-2">
                      <h6 className="mb-2 small text-uppercase text-muted">Contact Information</h6>
                      <p className="mb-1 small">
                        <i className="fas fa-envelope me-2 text-primary"></i>
                        <strong>Email:</strong> {show.owner?.email || 'john.smith@example.com'}
                      </p>
                      <p className="mb-1 small">
                        <i className="fas fa-phone me-2 text-success"></i>
                        <strong>Phone:</strong> {show.owner?.phone || '+1-555-0123'}
                      </p>
                      <p className="mb-0 small">
                        <i className="fas fa-map-marker-alt me-2 text-danger"></i>
                        <strong>Address:</strong> {show.owner?.address || '456 Oak Avenue, Central City'}
                      </p>
                    </div>
                    
                    <div className="property-stats bg-white rounded p-2">
                      <h6 className="mb-2 small text-uppercase text-muted">Property Portfolio</h6>
                      <div className="d-flex justify-content-between">
                        <small>
                          <strong>Total Properties:</strong> {show.owner?.totalProperties || 1}
                        </small>
                        <Badge bg={show.status === 'available' ? 'success' : 'warning'}>
                          {show.status?.toUpperCase() || 'AVAILABLE'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-3 border-bottom pb-3">
                    <h6>
                      <i className="fas fa-map-marked-alt me-2"></i>
                      Location Details
                    </h6>
                    <div className="location-info bg-white rounded p-2">
                      <p className="mb-2 small">
                        <strong>Full Address:</strong><br />
                        {show.ADDRESS || show.VENUE || 'N/A'}
                      </p>
                      <p className="mb-2 small">
                        <strong>Area Description:</strong><br />
                        {show.location || 'Prime location with easy access to amenities'}
                      </p>
                      {show.LATITUDE && show.LONGITUDE && (
                        <p className="mb-0 small text-muted">
                          <strong>Coordinates:</strong> {show.LATITUDE.toFixed(4)}, {show.LONGITUDE.toFixed(4)}
                        </p>
                      )}
                    </div>
                    
                    {/* Distance Information */}
                    {distance && (
                      <div className="bg-primary text-white rounded p-2 mt-2">
                        <small className="d-block opacity-75">Distance from your location:</small>
                        <strong className="h6 mb-0">{distance.toFixed(1)} km away</strong>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 d-grid gap-2">
                    {user?.role === 'user' && (
                      <>
                        <Button 
                          variant="success" 
                          size="lg"
                          onClick={() => setShowRequestModal(true)}
                          disabled={purchaseLoading}
                          className="fw-bold"
                        >
                          <i className="fas fa-envelope me-2"></i>
                          Request Property Info
                        </Button>
                        <small className="text-muted text-center">
                          Send inquiry directly to {show.owner?.name || 'the owner'}
                        </small>
                      </>
                    )}

                    <Button
                      variant="outline-primary"
                      onClick={() => setShowNavigationModal(true)}
                      disabled={navigationLoading}
                    >
                      <i className="fas fa-map-marker-alt me-2"></i>
                      View Location & Directions
                    </Button>
                    
                    {!userLocation && (
                      <Button
                        variant="outline-info"
                        onClick={getUserLocation}
                        disabled={navigationLoading}
                        size="sm"
                      >
                        <i className="fas fa-location-arrow me-2"></i>
                        {navigationLoading ? 'Getting Location...' : 'Enable Location'}
                      </Button>
                    )}
                    
                    {show.owner?.phone && (
                      <Button 
                        as="a" 
                        href={`tel:${show.owner.phone}`} 
                        variant="outline-success"
                      >
                        <i className="fas fa-phone me-2"></i>
                        Call {show.owner.name}
                      </Button>
                    )}
                    
                    {show.owner?.email && (
                      <Button 
                        as="a" 
                        href={`mailto:${show.owner.email}?subject=Property Inquiry - ${show.TITLE}`} 
                        variant="outline-warning"
                      >
                        <i className="fas fa-envelope me-2"></i>
                        Email Owner
                      </Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Card.Body>
        <Card.Footer className="text-muted">
          <small>
            Created: {new Date(show.CREATED_AT).toLocaleString()}<br />
            Last Updated: {new Date(show.UPDATED_AT).toLocaleString()}
          </small>
        </Card.Footer>
      </Card>

      {/* Property Request Modal */}
      <Modal show={showRequestModal} onHide={() => setShowRequestModal(false)} size="lg">
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <i className="fas fa-paper-plane me-2"></i>
            Send Property Inquiry
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-4">
            <h6 className="text-primary mb-3">Property Details</h6>
            <div className="bg-light rounded p-3">
              <div className="row">
                <div className="col-md-8">
                  <h6 className="mb-1">{show.TITLE}</h6>
                  <p className="text-muted mb-1">{show.ADDRESS}</p>
                  <p className="mb-0"><strong>Rent:</strong> ${show.PRICE}/month</p>
                </div>
                <div className="col-md-4 text-end">
                  <Badge bg="success">Available</Badge>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <h6 className="text-primary mb-3">Owner Information</h6>
            <div className="bg-light rounded p-3">
              <div className="d-flex align-items-center">
                <div className="me-3">
                  <i className="fas fa-user-circle text-primary" style={{fontSize: '2rem'}}></i>
                </div>
                <div>
                  <h6 className="mb-1">{show.owner?.name || 'John Smith'}</h6>
                  <p className="text-muted mb-1">{show.owner?.email || 'john.smith@example.com'}</p>
                  {show.owner?.verified && (
                    <Badge bg="success" className="small">
                      <i className="fas fa-shield-check me-1"></i>
                      Verified Owner
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-3">
            <p className="mb-3">
              <i className="fas fa-info-circle text-info me-2"></i>
              Your inquiry will be sent directly to <strong>{show.owner?.name || 'the property owner'}</strong>. 
              They will contact you with more details and schedule a viewing if you're both interested.
            </p>
          </div>
          
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Your Message to the Owner</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                placeholder={`Hi ${show.owner?.name || 'there'},\n\nI'm interested in your property "${show.TITLE}" listed at $${show.PRICE}/month.\n\nCould you please provide more information about:\n- Available move-in dates\n- Lease terms and conditions\n- Security deposit requirements\n- Any additional amenities or features\n\nI would also like to schedule a viewing at your convenience.\n\nThank you!`}
              />
              <Form.Text className="text-muted">
                Be specific about your requirements and questions to get a better response.
              </Form.Text>
            </Form.Group>
            
            {user && (
              <div className="bg-light rounded p-3 mb-3">
                <h6 className="mb-2">Your Contact Information</h6>
                <p className="mb-1"><strong>Name:</strong> {user.name}</p>
                <p className="mb-0"><strong>Email:</strong> {user.email}</p>
                <small className="text-muted">This information will be shared with the property owner.</small>
              </div>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowRequestModal(false)}>
            <i className="fas fa-times me-2"></i>
            Cancel
          </Button>
          <Button 
            variant="success" 
            onClick={handlePropertyRequest}
            disabled={purchaseLoading || !requestMessage.trim()}
          >
            <i className={`fas fa-${purchaseLoading ? 'spinner fa-spin' : 'paper-plane'} me-2`}></i>
            {purchaseLoading ? 'Sending Request...' : `Send to ${show.owner?.name || 'Owner'}`}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Navigation Modal */}
      <Modal show={showNavigationModal} onHide={() => setShowNavigationModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Navigation to Property</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!userLocation ? (
            <div className="text-center py-4">
              <p>We need your current location to provide navigation directions.</p>
              <Button 
                variant="primary" 
                onClick={getUserLocation}
                disabled={navigationLoading}
              >
                {navigationLoading ? 'Getting Location...' : 'Get My Location'}
              </Button>
            </div>
          ) : (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <h6>Your Location</h6>
                  <p className="mb-1">
                    <strong>Latitude:</strong> {userLocation.lat.toFixed(6)}
                  </p>
                  <p className="mb-1">
                    <strong>Longitude:</strong> {userLocation.lng.toFixed(6)}
                  </p>
                </Col>
                <Col md={6}>
                  <h6>Property Location</h6>
                  <p className="mb-1">
                    <strong>Address:</strong> {show.ADDRESS || show.VENUE || 'N/A'}
                  </p>
                  <p className="mb-1">
                    <strong>Coordinates:</strong> {show.LATITUDE?.toFixed(6) || 'N/A'}, {show.LONGITUDE?.toFixed(6) || 'N/A'}
                  </p>
                </Col>
              </Row>
              
              {distance && (
                <div className="alert alert-info">
                  <h6 className="mb-2">Route Information</h6>
                  <p className="mb-1">
                    <strong>Distance:</strong> {distance.toFixed(1)} km
                  </p>
                  <p className="mb-1">
                    <strong>Estimated Travel Time:</strong> {Math.round(distance * 2)} minutes (by car)
                  </p>
                </div>
              )}
              
              <div className="d-grid gap-2">
                <Button
                  variant="success"
                  size="lg"
                  onClick={openGoogleMapsDirections}
                >
                  🗺️ Open Google Maps Directions
                </Button>
                
                <Button
                  variant="outline-primary"
                  onClick={() => {
                    if (show?.LATITUDE && show?.LONGITUDE) {
                      const url = `https://www.google.com/maps/search/?api=1&query=${show.LATITUDE},${show.LONGITUDE}`;
                      window.open(url, '_blank');
                    }
                  }}
                >
                  📍 View Property on Map
                </Button>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowNavigationModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ShowDetails;