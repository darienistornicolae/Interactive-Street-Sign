import { Link } from 'react-router-dom';

const CallToAction = () => {
  return (
    <div className="call-to-action">
      <h2>Get Involved</h2>
      <Link to="/harassment-form" className="cta-button">
        Report an Incident
      </Link>
    </div>
  );
};

export default CallToAction;
