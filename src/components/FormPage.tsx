import { Link } from 'react-router-dom';
import ReportForm from './ReportForm';

interface FormPageProps {
  serverUrl: string;
}

const FormPage = ({ serverUrl }: FormPageProps) => {
  return (
    <>
      <header className="header">
        <Link to="/" className="back-button">
          ← Back to Main Page
        </Link>
      </header>
      <main className="main-content">
        <ReportForm serverUrl={serverUrl} />
      </main>
    </>
  );
};

export default FormPage;
