interface InfoCardProps {
  title: string;
  description: string;
}

const InfoCard = ({ title, description }: InfoCardProps) => {
  return (
    <div className="info-card">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
};

const InfoSection = () => {
  const infoCards = [
    {
      title: "Education & Awareness",
      description: "Providing resources to help understand the impact of street intimidation and promote respectful behavior."
    },
    {
      title: "Bystander Support", 
      description: "Empowering witnesses to safely intervene or report incidents when they occur."
    },
    {
      title: "Community Action",
      description: "Building a network of support to create safer, more inclusive public spaces."
    }
  ];

  return (
    <div className="info-section">
      <h2>Our Approach</h2>
      <div className="info-grid">
        {infoCards.map((card, index) => (
          <InfoCard
            key={index}
            title={card.title}
            description={card.description}
          />
        ))}
      </div>
    </div>
  );
};

export default InfoSection;
