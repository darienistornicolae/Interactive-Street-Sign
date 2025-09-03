import { useState } from 'react';
import './ReportForm.css';

interface FormData {
  incident_date: string;
  helped_with_harassment: string;
}

interface ReportFormProps {
  serverUrl: string;
  onSubmitted?: () => void;
}

const ReportForm = ({ serverUrl, onSubmitted }: ReportFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    incident_date: '',
    helped_with_harassment: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.incident_date || !formData.helped_with_harassment) {
      setSubmitStatus({
        type: 'error',
        message: 'Please fill in all required fields.'
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${serverUrl}/api/submit-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus({
          type: 'success',
          message: 'Report submitted successfully! Thank you for helping make our streets safer.'
        });
        setFormData({
          incident_date: '',
          helped_with_harassment: ''
        });
        if (onSubmitted) onSubmitted();
      } else {
        setSubmitStatus({
          type: 'error',
          message: result.error || 'Failed to submit report. Please try again.'
        });
      }
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: 'Network error. Please check your connection and try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="report-form-container">
      <div className="form-header">
        <h1>Report Harassment Incident</h1>
        <p>Help us understand and address street intimidation in our community. Your report contributes to making our streets safer for everyone.</p>
      </div>

      <form onSubmit={handleSubmit} className="report-form" aria-busy={isSubmitting}>
        <fieldset disabled={isSubmitting} className={isSubmitting ? 'fieldset-disabled' : undefined}>
          <div className="form-group">
            <label htmlFor="incident_date" className="required">
              When did this incident occur?
            </label>
            <input
              type="date"
              id="incident_date"
              name="incident_date"
              value={formData.incident_date}
              onChange={handleInputChange}
              required
              className="form-input"
              max={getCurrentDate()}
              placeholder="Select the date"
            />
            <small className="form-helper-text">
              Select the date when you experienced or witnessed the harassment
            </small>
          </div>

          <div className="form-group">
            <label className="required">
              Did you or someone else help address the situation?
            </label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="helped_with_harassment"
                  value="Yes"
                  checked={formData.helped_with_harassment === 'Yes'}
                  onChange={handleInputChange}
                  required
                />
                <span className="radio-text">Yes, I helped</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="helped_with_harassment"
                  value="No"
                  checked={formData.helped_with_harassment === 'No'}
                  onChange={handleInputChange}
                  required
                />
                <span className="radio-text">No, I didn't help</span>
              </label>
            </div>
            <small className="form-helper-text">
              This helps us understand community response patterns
            </small>
          </div>

          {submitStatus.type && (
            <div className={`submit-status ${submitStatus.type}`}>
              {submitStatus.message}
            </div>
          )}

          <button 
            type="submit" 
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="loading-inline">
                <span className="spinner" aria-hidden="true"></span>
                Submitting Report...
              </span>
            ) : (
              <>
                Submit Report
              </>
            )}
          </button>
        </fieldset>
      </form>

      <div className="form-footer">
        <p>
          <strong>Privacy & Security:</strong> All reports are completely anonymous and confidential. 
          This information helps us identify patterns and develop better community responses to street intimidation.
        </p>
      </div>
    </div>
  );
};

export default ReportForm;
