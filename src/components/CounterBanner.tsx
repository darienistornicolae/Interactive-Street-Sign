interface CounterBannerProps {
  formCount: number | null;
  isLoading: boolean;
  error: string | null;
}

const CounterBanner = ({ formCount, isLoading, error }: CounterBannerProps) => {
  return (
    <div className="counter-banner">
      <div className="banner-content">
        {isLoading ? (
          <div className="counter-loading">Loading...</div>
        ) : error ? (
          <div className="counter-error">{error}</div>
        ) : (
          <>
            <div className="banner-number">{formCount?.toLocaleString()} people</div>
            <div className="banner-text">have saved someone</div>
            <div className="banner-text">By being aware</div>
            <div className="banner-text">Watch out for each other.</div>
          </>
        )}
      </div>
    </div>
  );
};

export default CounterBanner;
