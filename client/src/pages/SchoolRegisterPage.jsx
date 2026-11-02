import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import StepIndicator from '../components/StepIndicator';
import ConfirmModal from '../components/ConfirmModal';
import Alert from '../components/Alert';
import authService from '../services/authService';

const INITIAL_FORM_DATA = {
  // Step 1: School Info
  schoolName: '',
  establishedYear: '',
  state: '',
  district: '',
  address: '',
  schoolEmail: '',
  schoolMobile: '',
  websiteUrl: '',

  // Step 2: Contact Persons (min 2, max 3)
  contactPersons: [
    { name: '', position: '', email: '', mobile: '' },
    { name: '', position: '', email: '', mobile: '' }
  ],

  // Step 3: Initial Admins (min 1, max 3)
  admins: [
    { name: '', email: '', mobile: '' }
  ]
};

export default function SchoolRegisterPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationResult, setRegistrationResult] = useState(null);

  // Field change handlers
  const handleSchoolInfoChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleContactPersonChange = (index, field, value) => {
    const updated = [...formData.contactPersons];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, contactPersons: updated }));
    const errorKey = `cp_${index}_${field}`;
    if (errors[errorKey]) {
      setErrors((prev) => ({ ...prev, [errorKey]: '' }));
    }
  };

  const addContactPerson = () => {
    if (formData.contactPersons.length < 3) {
      setFormData((prev) => ({
        ...prev,
        contactPersons: [...prev.contactPersons, { name: '', position: '', email: '', mobile: '' }]
      }));
    }
  };

  const removeContactPerson = (index) => {
    if (formData.contactPersons.length > 2) {
      const updated = formData.contactPersons.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, contactPersons: updated }));
    }
  };

  const handleAdminChange = (index, field, value) => {
    const updated = [...formData.admins];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, admins: updated }));
    const errorKey = `admin_${index}_${field}`;
    if (errors[errorKey]) {
      setErrors((prev) => ({ ...prev, [errorKey]: '' }));
    }
  };

  const addAdmin = () => {
    if (formData.admins.length < 3) {
      setFormData((prev) => ({
        ...prev,
        admins: [...prev.admins, { name: '', email: '', mobile: '' }]
      }));
    }
  };

  const removeAdmin = (index) => {
    if (formData.admins.length > 1) {
      const updated = formData.admins.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, admins: updated }));
    }
  };

  // Validations per step
  const validateStep1 = () => {
    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const currentYear = new Date().getFullYear();

    if (!formData.schoolName.trim()) errs.schoolName = 'School Name is required.';
    
    if (!formData.establishedYear) {
      errs.establishedYear = 'Established Year is required.';
    } else {
      const year = Number(formData.establishedYear);
      if (isNaN(year) || year < 1800 || year > currentYear) {
        errs.establishedYear = `Enter a valid year between 1800 and ${currentYear}.`;
      }
    }

    if (!formData.state.trim()) errs.state = 'State is required.';
    if (!formData.district.trim()) errs.district = 'District is required.';
    if (!formData.address.trim()) errs.address = 'Address is required.';

    if (!formData.schoolEmail.trim()) {
      errs.schoolEmail = 'School Email is required.';
    } else if (!emailRegex.test(formData.schoolEmail.trim())) {
      errs.schoolEmail = 'Enter a valid email address.';
    }

    if (!formData.schoolMobile.trim()) {
      errs.schoolMobile = 'School Mobile Number is required.';
    } else if (formData.schoolMobile.trim().length < 7 || formData.schoolMobile.trim().length > 15) {
      errs.schoolMobile = 'Enter a valid mobile number (7-15 digits).';
    }

    if (formData.websiteUrl && formData.websiteUrl.trim()) {
      const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
      if (!urlPattern.test(formData.websiteUrl.trim())) {
        errs.websiteUrl = 'Enter a valid URL (e.g., https://example.edu).';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (formData.contactPersons.length < 2) {
      errs.general = 'Minimum two contact persons are required.';
    }

    formData.contactPersons.forEach((cp, idx) => {
      if (!cp.name.trim()) errs[`cp_${idx}_name`] = 'Name is required.';
      if (!cp.position.trim()) errs[`cp_${idx}_position`] = 'Position is required.';
      if (!cp.email.trim()) {
        errs[`cp_${idx}_email`] = 'Email is required.';
      } else if (!emailRegex.test(cp.email.trim())) {
        errs[`cp_${idx}_email`] = 'Invalid email address.';
      }
      if (!cp.mobile.trim()) {
        errs[`cp_${idx}_mobile`] = 'Mobile is required.';
      } else if (cp.mobile.trim().length < 7 || cp.mobile.trim().length > 15) {
        errs[`cp_${idx}_mobile`] = 'Invalid mobile number.';
      }
    });

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep3 = () => {
    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailsSeen = new Set();

    if (formData.admins.length < 1) {
      errs.general = 'At least one Admin account is required.';
    }

    formData.admins.forEach((admin, idx) => {
      if (!admin.name.trim()) errs[`admin_${idx}_name`] = 'Admin Name is required.';
      
      if (!admin.email.trim()) {
        errs[`admin_${idx}_email`] = 'Admin Email is required.';
      } else if (!emailRegex.test(admin.email.trim())) {
        errs[`admin_${idx}_email`] = 'Invalid email address.';
      } else {
        const lowerEmail = admin.email.trim().toLowerCase();
        if (emailsSeen.has(lowerEmail)) {
          errs[`admin_${idx}_email`] = 'Duplicate email among administrators.';
        }
        emailsSeen.add(lowerEmail);
      }

      if (!admin.mobile.trim()) {
        errs[`admin_${idx}_mobile`] = 'Admin Mobile is required.';
      } else if (admin.mobile.trim().length < 7 || admin.mobile.trim().length > 15) {
        errs[`admin_${idx}_mobile`] = 'Invalid mobile number.';
      }
    });

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    setApiError('');
    if (currentStep === 1 && validateStep1()) setCurrentStep(2);
    else if (currentStep === 2 && validateStep2()) setCurrentStep(3);
    else if (currentStep === 3 && validateStep3()) setCurrentStep(4);
  };

  const handleBack = () => {
    setApiError('');
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    setApiError('');
    try {
      const response = await authService.registerSchool(formData);
      setIsModalOpen(false);
      setRegistrationResult(response.data);
    } catch (err) {
      setIsModalOpen(false);
      const msg = err.response?.data?.message || err.message || 'Registration failed. Please check inputs.';
      setApiError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If registration is complete, show the success view
  if (registrationResult) {
    return (
      <div className="min-h-screen flex flex-col bg-surface-50">
        <Header />
        <main className="flex-1 max-w-3xl mx-auto px-4 py-12 w-full">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-navy-900">School Registration Successful!</h2>
              <p className="text-gray-600 mt-2">
                Your institution and administrative credentials have been generated and registered in the DMMS system.
              </p>
            </div>

            <div className="bg-surface-50 p-6 rounded-lg border border-gray-200 text-left space-y-4">
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">School Name</span>
                <span className="text-base font-bold text-navy-900">{registrationResult.schoolName}</span>
              </div>

              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Generated School ID</span>
                <div className="inline-block mt-1 bg-brand-50 border border-brand-200 px-3 py-1.5 rounded-md font-mono text-lg font-bold text-brand-700">
                  {registrationResult.schoolId}
                </div>
                <p className="text-xs text-gray-500 mt-1">Keep this School ID safe. It is required for all school-level logins.</p>
              </div>

              <div className="pt-2 border-t border-gray-200">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Registered Administrator(s)</span>
                <div className="space-y-2">
                  {registrationResult.admins?.map((adm, idx) => (
                    <div key={idx} className="p-3 bg-white rounded border border-gray-200 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-navy-800">{adm.name} {adm.isPrimaryAdmin && <span className="text-xs text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded font-semibold ml-1">Primary</span>}</p>
                        <p className="text-xs text-gray-500">{adm.email} • {adm.mobile}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-400 block">User ID</span>
                        <span className="font-mono text-sm font-bold text-gray-800">{adm.userId}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-900 space-y-1">
                <p className="font-bold">Credential Delivery & Security Notice:</p>
                <p>Initial system-generated strong passwords have been securely recorded in the local environment file (<code className="font-mono">docs/INITIAL_CREDENTIALS.local.txt</code>).</p>
                <p>For security, all accounts are configured with mandatory password change on first login.</p>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
              <Link
                to="/school-login"
                className="w-full sm:w-auto px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-md shadow-sm transition"
              >
                Proceed to School Login
              </Link>
              <Link
                to="/"
                className="w-full sm:w-auto px-6 py-3 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-md transition"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface-50">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        {/* Title & Description */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900">School Registration Wizard</h1>
          <p className="text-sm text-gray-600 mt-1">
            Complete the 4-step registration to onboard your educational institution onto DMMS.
          </p>
        </div>

        {/* Wizard Step Indicator */}
        <StepIndicator currentStep={currentStep} onStepClick={(s) => setCurrentStep(s)} />

        {/* Global API error notification */}
        <Alert type="error" message={apiError} onClose={() => setApiError('')} />
        {errors.general && <Alert type="error" message={errors.general} />}

        {/* Form Container */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">

          {/* STEP 1: School Information */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div className="border-b border-gray-100 pb-3">
                <h2 className="text-lg font-bold text-navy-900">Step 1: School Information</h2>
                <p className="text-xs text-gray-500">Provide verified institutional identity details.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    School Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="schoolName"
                    value={formData.schoolName}
                    onChange={handleSchoolInfoChange}
                    placeholder="e.g. St. Xavier's Model High School"
                    className={`w-full px-3.5 py-2 border rounded-md text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none ${
                      errors.schoolName ? 'border-red-400 bg-red-50/30' : 'border-gray-300'
                    }`}
                  />
                  {errors.schoolName && <p className="text-xs text-red-500 mt-1">{errors.schoolName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Established Year <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="establishedYear"
                    value={formData.establishedYear}
                    onChange={handleSchoolInfoChange}
                    placeholder="e.g. 1995"
                    className={`w-full px-3.5 py-2 border rounded-md text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none ${
                      errors.establishedYear ? 'border-red-400 bg-red-50/30' : 'border-gray-300'
                    }`}
                  />
                  {errors.establishedYear && <p className="text-xs text-red-500 mt-1">{errors.establishedYear}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleSchoolInfoChange}
                    placeholder="e.g. Maharashtra"
                    className={`w-full px-3.5 py-2 border rounded-md text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none ${
                      errors.state ? 'border-red-400 bg-red-50/30' : 'border-gray-300'
                    }`}
                  />
                  {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    District <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleSchoolInfoChange}
                    placeholder="e.g. Pune"
                    className={`w-full px-3.5 py-2 border rounded-md text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none ${
                      errors.district ? 'border-red-400 bg-red-50/30' : 'border-gray-300'
                    }`}
                  />
                  {errors.district && <p className="text-xs text-red-500 mt-1">{errors.district}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Complete Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="address"
                    rows="2"
                    value={formData.address}
                    onChange={handleSchoolInfoChange}
                    placeholder="Campus street, landmark, city, postal pincode"
                    className={`w-full px-3.5 py-2 border rounded-md text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none ${
                      errors.address ? 'border-red-400 bg-red-50/30' : 'border-gray-300'
                    }`}
                  />
                  {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    School Official Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="schoolEmail"
                    value={formData.schoolEmail}
                    onChange={handleSchoolInfoChange}
                    placeholder="principal@school.edu"
                    className={`w-full px-3.5 py-2 border rounded-md text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none ${
                      errors.schoolEmail ? 'border-red-400 bg-red-50/30' : 'border-gray-300'
                    }`}
                  />
                  {errors.schoolEmail && <p className="text-xs text-red-500 mt-1">{errors.schoolEmail}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    School Contact Mobile <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="schoolMobile"
                    value={formData.schoolMobile}
                    onChange={handleSchoolInfoChange}
                    placeholder="9876543210"
                    className={`w-full px-3.5 py-2 border rounded-md text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none ${
                      errors.schoolMobile ? 'border-red-400 bg-red-50/30' : 'border-gray-300'
                    }`}
                  />
                  {errors.schoolMobile && <p className="text-xs text-red-500 mt-1">{errors.schoolMobile}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    School Website URL <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="url"
                    name="websiteUrl"
                    value={formData.websiteUrl}
                    onChange={handleSchoolInfoChange}
                    placeholder="https://www.myschool.edu"
                    className={`w-full px-3.5 py-2 border rounded-md text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none ${
                      errors.websiteUrl ? 'border-red-400 bg-red-50/30' : 'border-gray-300'
                    }`}
                  />
                  {errors.websiteUrl && <p className="text-xs text-red-500 mt-1">{errors.websiteUrl}</p>}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Contact Person Details */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-navy-900">Step 2: Contact Person Details</h2>
                  <p className="text-xs text-gray-500">Add minimum 2 and maximum 3 institutional contact points.</p>
                </div>
                {formData.contactPersons.length < 3 && (
                  <button
                    type="button"
                    onClick={addContactPerson}
                    className="text-xs font-semibold text-brand-700 bg-brand-50 border border-brand-200 px-3 py-1.5 rounded-md hover:bg-brand-100 transition"
                  >
                    + Add Contact Person
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {formData.contactPersons.map((cp, idx) => (
                  <div key={idx} className="p-4 bg-surface-50 rounded-lg border border-gray-200 relative">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-navy-800 uppercase tracking-wider">
                        Contact Person #{idx + 1}
                      </span>
                      {formData.contactPersons.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeContactPerson(idx)}
                          className="text-xs text-red-600 hover:text-red-800 font-semibold"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={cp.name}
                          onChange={(e) => handleContactPersonChange(idx, 'name', e.target.value)}
                          placeholder="e.g. Dr. Rajesh Sharma"
                          className="w-full px-3 py-2 border rounded-md text-sm border-gray-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                        />
                        {errors[`cp_${idx}_name`] && (
                          <p className="text-xs text-red-500 mt-1">{errors[`cp_${idx}_name`]}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Designation / Position <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={cp.position}
                          onChange={(e) => handleContactPersonChange(idx, 'position', e.target.value)}
                          placeholder="e.g. Vice Principal / Registrar"
                          className="w-full px-3 py-2 border rounded-md text-sm border-gray-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                        />
                        {errors[`cp_${idx}_position`] && (
                          <p className="text-xs text-red-500 mt-1">{errors[`cp_${idx}_position`]}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={cp.email}
                          onChange={(e) => handleContactPersonChange(idx, 'email', e.target.value)}
                          placeholder="rajesh@school.edu"
                          className="w-full px-3 py-2 border rounded-md text-sm border-gray-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                        />
                        {errors[`cp_${idx}_email`] && (
                          <p className="text-xs text-red-500 mt-1">{errors[`cp_${idx}_email`]}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Mobile Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={cp.mobile}
                          onChange={(e) => handleContactPersonChange(idx, 'mobile', e.target.value)}
                          placeholder="9876500000"
                          className="w-full px-3 py-2 border rounded-md text-sm border-gray-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                        />
                        {errors[`cp_${idx}_mobile`] && (
                          <p className="text-xs text-red-500 mt-1">{errors[`cp_${idx}_mobile`]}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Initial Admin Details */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-fade-in">
              <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-navy-900">Step 3: Initial Admin Details</h2>
                  <p className="text-xs text-gray-500">
                    Register 1 to 3 initial Administrators. The first Admin will be designated as Primary Admin.
                  </p>
                </div>
                {formData.admins.length < 3 && (
                  <button
                    type="button"
                    onClick={addAdmin}
                    className="text-xs font-semibold text-brand-700 bg-brand-50 border border-brand-200 px-3 py-1.5 rounded-md hover:bg-brand-100 transition"
                  >
                    + Add Admin
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {formData.admins.map((adm, idx) => (
                  <div key={idx} className="p-4 bg-surface-50 rounded-lg border border-gray-200 relative">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-navy-800 uppercase tracking-wider">
                          Admin #{idx + 1}
                        </span>
                        {idx === 0 && (
                          <span className="text-[10px] font-bold bg-brand-100 text-brand-800 px-2 py-0.5 rounded">
                            PRIMARY ADMIN
                          </span>
                        )}
                      </div>
                      {formData.admins.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeAdmin(idx)}
                          className="text-xs text-red-600 hover:text-red-800 font-semibold"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Admin Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={adm.name}
                          onChange={(e) => handleAdminChange(idx, 'name', e.target.value)}
                          placeholder="e.g. Anita Sharma"
                          className="w-full px-3 py-2 border rounded-md text-sm border-gray-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                        />
                        {errors[`admin_${idx}_name`] && (
                          <p className="text-xs text-red-500 mt-1">{errors[`admin_${idx}_name`]}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Admin Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={adm.email}
                          onChange={(e) => handleAdminChange(idx, 'email', e.target.value)}
                          placeholder="anita@school.edu"
                          className="w-full px-3 py-2 border rounded-md text-sm border-gray-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                        />
                        {errors[`admin_${idx}_email`] && (
                          <p className="text-xs text-red-500 mt-1">{errors[`admin_${idx}_email`]}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Admin Mobile <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={adm.mobile}
                          onChange={(e) => handleAdminChange(idx, 'mobile', e.target.value)}
                          placeholder="9876511111"
                          className="w-full px-3 py-2 border rounded-md text-sm border-gray-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                        />
                        {errors[`admin_${idx}_mobile`] && (
                          <p className="text-xs text-red-500 mt-1">{errors[`admin_${idx}_mobile`]}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Review and Confirmation */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-gray-100 pb-3">
                <h2 className="text-lg font-bold text-navy-900">Step 4: Review and Confirmation</h2>
                <p className="text-xs text-gray-500">
                  Please review all entered details thoroughly before confirming registration.
                </p>
              </div>

              {/* Section 1: School Information */}
              <div className="border border-gray-200 rounded-lg p-4 bg-surface-50">
                <div className="flex items-center justify-between mb-3 border-b border-gray-200 pb-2">
                  <h3 className="text-sm font-bold text-navy-900">1. School Information</h3>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-xs text-brand-600 hover:text-brand-800 font-semibold underline"
                  >
                    Edit Section
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-500">School Name:</span>
                    <p className="font-semibold text-gray-800 text-sm">{formData.schoolName}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Established Year:</span>
                    <p className="font-semibold text-gray-800 text-sm">{formData.establishedYear}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Location:</span>
                    <p className="font-semibold text-gray-800">{formData.district}, {formData.state}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Official Email:</span>
                    <p className="font-semibold text-gray-800">{formData.schoolEmail}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Mobile:</span>
                    <p className="font-semibold text-gray-800">{formData.schoolMobile}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Website:</span>
                    <p className="font-semibold text-gray-800">{formData.websiteUrl || 'N/A'}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-gray-500">Address:</span>
                    <p className="font-semibold text-gray-800">{formData.address}</p>
                  </div>
                </div>
              </div>

              {/* Section 2: Contact Persons */}
              <div className="border border-gray-200 rounded-lg p-4 bg-surface-50">
                <div className="flex items-center justify-between mb-3 border-b border-gray-200 pb-2">
                  <h3 className="text-sm font-bold text-navy-900">2. Contact Person Information ({formData.contactPersons.length})</h3>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="text-xs text-brand-600 hover:text-brand-800 font-semibold underline"
                  >
                    Edit Section
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {formData.contactPersons.map((cp, idx) => (
                    <div key={idx} className="p-3 bg-white rounded border border-gray-200 text-xs">
                      <p className="font-bold text-navy-900">{cp.name}</p>
                      <p className="text-brand-600 font-medium">{cp.position}</p>
                      <p className="text-gray-600 mt-1">{cp.email} • {cp.mobile}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 3: Admin Details */}
              <div className="border border-gray-200 rounded-lg p-4 bg-surface-50">
                <div className="flex items-center justify-between mb-3 border-b border-gray-200 pb-2">
                  <h3 className="text-sm font-bold text-navy-900">3. Admin Accounts ({formData.admins.length})</h3>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="text-xs text-brand-600 hover:text-brand-800 font-semibold underline"
                  >
                    Edit Section
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {formData.admins.map((adm, idx) => (
                    <div key={idx} className="p-3 bg-white rounded border border-gray-200 text-xs">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-navy-900">{adm.name}</p>
                        {idx === 0 && (
                          <span className="text-[10px] bg-brand-100 text-brand-700 font-bold px-1.5 py-0.5 rounded">
                            PRIMARY
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mt-1">{adm.email} • {adm.mobile}</p>
                      <p className="text-gray-400 mt-1">Role: <span className="font-mono text-gray-700">ADMIN</span></p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Form Action Controls */}
          <div className="mt-8 pt-4 border-t border-gray-200 flex items-center justify-between">
            <div>
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-semibold hover:bg-gray-50 transition"
                >
                  &larr; Back
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                >
                  Cancel Registration
                </button>
              )}
            </div>

            <div>
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-md text-sm font-semibold shadow-sm transition"
                >
                  Next Step &rarr;
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm font-semibold shadow-sm transition"
                >
                  Confirm Registration
                </button>
              )}
            </div>
          </div>

        </div>
      </main>

      <Footer />

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={isModalOpen}
        title="Confirm School Registration"
        message="Are you sure you want to register this school with the provided information?"
        confirmText="Yes, Register School"
        cancelText="Review Again"
        isLoading={isSubmitting}
        onConfirm={handleConfirmSubmit}
        onCancel={() => setIsModalOpen(false)}
      />
    </div>
  );
}
