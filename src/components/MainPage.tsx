import CounterBanner from './CounterBanner';
import QRSection from './QRSection';
import InfoSection from './InfoSection';
import CallToAction from './CallToAction';

interface MainPageProps {
  formCount: number | null;
  isLoading: boolean;
  error: string | null;
}

const MainPage = ({ formCount, isLoading, error }: MainPageProps) => {
  return (
    <>
      <header className="header">
        <h1>Addressing Street Intimidation</h1>
        <p className="subtitle">A community approach to creating safer streets</p>
      </header>
      
      <main className="main-content">
        <CounterBanner 
          formCount={formCount}
          isLoading={isLoading}
          error={error}
        />
        <QRSection />
        <InfoSection />
        <CallToAction />
      </main>
    </>
  );
};

export default MainPage;
