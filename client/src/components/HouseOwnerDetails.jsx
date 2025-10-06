import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getHouseById, getHousesByOwnerEmail } from '../data/sampleHouses';

const HouseOwnerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [property, setProperty] = useState(null);
  const [ownerProperties, setOwnerProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestData, setRequestData] = useState({
    message: '',
    moveInDate: '',
    tenantInfo: ''
  });
  const [requestStatus, setRequestStatus] = useState(null);

  useEffect(() => {
    // Get the property details
    const propertyData = getHouseById(id);
    if (propertyData) {
      setProperty(propertyData);
      
      // Get all properties by this owner
      const ownerProps = getHousesByOwnerEmail(propertyData.owner.email);
      setOwnerProperties(ownerProps);
    }
    setLoading(false);
  }, [id]);

  const handleRequestSubmit = (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please log in to send a request');
      return;
    }

    if (!requestData.message || !requestData.moveInDate) {
      alert('Please fill in all required fields');
      return;
    }

    // Simulate sending request
    console.log('Sending request:', {
      propertyId: property.SHOW_ID,
      ownerId: property.owner.id,
      ownerEmail: property.owner.email,
      requesterId: user.id,
      requesterEmail: user.email,
      message: requestData.message,
      moveInDate: requestData.moveInDate,
      tenantInfo: requestData.tenantInfo,
      timestamp: new Date().toISOString()
    });

    setRequestStatus('success');
    setShowRequestForm(false);
    
    // Reset form
    setRequestData({
      message: '',
      moveInDate: '',
      tenantInfo: ''
    });

    // Show success message for 3 seconds
    setTimeout(() => {
      setRequestStatus(null);
    }, 3000);
  };

  const handleInputChange = (e) => {
    setRequestData({
      ...requestData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          <h4>Property Not Found</h4>
          <p>The property you're looking for doesn't exist.</p>
          <Link to="/user/dashboard" className="btn btn-primary">
            Back to Properties
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/user/dashboard">Properties</Link>
          </li>
          <li className="breadcrumb-item active">{property.owner.name}</li>
        </ol>
      </nav>

      {/* Success Message */}
      {requestStatus === 'success' && (
        <div className="alert alert-success alert-dismissible fade show">
          <strong>Request Sent Successfully!</strong> Your rental request has been sent to {property.owner.name}. 
          They typically respond within {property.owner.responseTime || '24 hours'}.
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setRequestStatus(null)}
          ></button>
        </div>
      )}

      <div className="row">
        {/* Owner Information */}
        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="fas fa-user me-2"></i>Property Owner
              </h5>
            </div>
            <div className="card-body text-center">
              <div className="mb-3">
                <img 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(property.owner.name)}&size=100&background=007bff&color=fff`}
                  alt={property.owner.name}
                  className="rounded-circle mb-2"
                  style={{ width: '100px', height: '100px' }}
                />
                <h5 className="card-title">{property.owner.name}</h5>
                {property.owner.verified && (
                  <span className="badge bg-success mb-2">
                    <i className="fas fa-check-circle me-1"></i>Verified Owner
                  </span>
                )}
              </div>
              
              <div className="text-start">
                <p className="mb-2">
                  <strong>Email:</strong> {property.owner.email}
                </p>
                <p className="mb-2">
                  <strong>Phone:</strong> {property.owner.phone}
                </p>
                <p className="mb-2">
                  <strong>Total Properties:</strong> {property.owner.totalProperties}
                </p>
                <p className="mb-3">
                  <strong>Member Since:</strong> {new Date(property.owner.joinedDate).toLocaleDateString()}
                </p>
                
                {property.owner.bio && (
                  <div className="mb-3">
                    <strong>About:</strong>
                    <p className="small text-muted mt-1">{property.owner.bio}</p>
                  </div>
                )}
              </div>

              {user && user.role === 'user' && (
                <button 
                  className="btn btn-success w-100"
                  onClick={() => setShowRequestForm(true)}
                  disabled={showRequestForm}
                >
                  <i className="fas fa-paper-plane me-2"></i>
                  Send Rental Request
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Property Details */}
        <div className="col-md-8">
          {/* Current Property */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-home me-2"></i>Property Details
              </h5>
            </div>
            <div className="card-body">
              <h4 className="text-primary">{property.TITLE}</h4>
              <p className="text-muted mb-3">{property.ADDRESS}</p>
              
              <div className="row mb-3">
                <div className="col-md-6">
                  <p><strong>Price:</strong> <span className="text-success">${property.PRICE}/month</span></p>
                  <p><strong>Type:</strong> {property.CATEGORY}</p>
                  <p><strong>Furnished:</strong> {property.FURNISHED}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>Bedrooms:</strong> {property.BEDROOMS}</p>
                  <p><strong>Bathrooms:</strong> {property.BATHROOMS}</p>
                  <p><strong>Area:</strong> {property.AREA_SQFT} sq ft</p>
                </div>
              </div>
              
              <div className="mb-3">
                <strong>Description:</strong>
                <p className="mt-2">{property.DESCRIPTION}</p>
              </div>
              
              <div className="mb-3">
                <strong>Location:</strong>
                <p className="mt-1 text-muted">{property.location}</p>
              </div>
              
              {property.VERIFIED && (
                <div className="mb-3">
                  <span className="badge bg-success">
                    <i className="fas fa-shield-alt me-1"></i>Verified Property
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Other Properties by Same Owner */}
          {ownerProperties.length > 1 && (
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="fas fa-building me-2"></i>
                  Other Properties by {property.owner.name}
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  {ownerProperties
                    .filter(prop => prop.SHOW_ID !== property.SHOW_ID)
                    .map(prop => (
                      <div key={prop.SHOW_ID} className="col-md-6 mb-3">
                        <div className="card border">
                          <div className="card-body">
                            <h6 className="card-title">{prop.TITLE}</h6>
                            <p className="card-text small text-muted">{prop.ADDRESS}</p>
                            <p className="text-success mb-2">
                              <strong>${prop.PRICE}/month</strong>
                            </p>
                            <div className="d-flex justify-content-between align-items-center">
                              <small className="text-muted">
                                {prop.BEDROOMS} bed • {prop.BATHROOMS} bath
                              </small>
                              <Link 
                                to={`/property/${prop.SHOW_ID}`}
                                className="btn btn-sm btn-outline-primary"
                              >
                                View Details
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Request Form Modal */}
      {showRequestForm && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-paper-plane me-2"></i>
                  Send Rental Request
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowRequestForm(false)}
                ></button>
              </div>
              <form onSubmit={handleRequestSubmit}>
                <div className="modal-body">
                  <div className="alert alert-info">
                    <strong>Sending request to:</strong> {property.owner.name} for "{property.TITLE}"
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="message" className="form-label">
                      Message <span className="text-danger">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      className="form-control"
                      rows="4"
                      value={requestData.message}
                      onChange={handleInputChange}
                      placeholder="Hi, I'm interested in renting your property. Please let me know about availability and next steps."
                      required
                    ></textarea>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="moveInDate" className="form-label">
                      Preferred Move-in Date <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      id="moveInDate"
                      name="moveInDate"
                      className="form-control"
                      value={requestData.moveInDate}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="tenantInfo" className="form-label">
                      Additional Information (Optional)
                    </label>
                    <textarea
                      id="tenantInfo"
                      name="tenantInfo"
                      className="form-control"
                      rows="3"
                      value={requestData.tenantInfo}
                      onChange={handleInputChange}
                      placeholder="Tell the owner about yourself (occupation, references, etc.)"
                    ></textarea>
                  </div>
                  
                  <div className="alert alert-warning">
                    <small>
                      <i className="fas fa-info-circle me-1"></i>
                      Your contact information will be shared with the property owner so they can respond to your request.
                    </small>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowRequestForm(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success">
                    <i className="fas fa-paper-plane me-2"></i>
                    Send Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HouseOwnerDetails;