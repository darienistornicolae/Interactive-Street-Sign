import { Link } from 'react-router-dom';

const CallToAction = () => {
  return (
    <div className="call-to-action">
      <h2>Get Involved</h2>
      <a
        href="https://forms.gle/sgxaUEPvxrTBhVvj9"
        className="cta-button"
        target="_blank"
        rel="noopener noreferrer"
      >
        Report an Incident
      </a>
    </div>
  );
};

export default CallToAction;
