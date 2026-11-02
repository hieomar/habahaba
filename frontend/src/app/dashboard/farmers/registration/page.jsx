"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STEPS = [
  "Personal Details",
  "Location",
  "Organisation",
  "Farm Details",
  "Review"
];

export default function FarmerRegistrationPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({
    // Step 1
    fullName: "",
    gender: "",
    dob: "",
    phone: "",
    altPhone: "",
    nationalId: "",
    // Step 2
    district: "",
    ta: "",
    epa: "",
    section: "",
    village: "",
    gps: "",
    // Step 3
    association: "",
    club: "",
    group: "",
    memberNo: "",
    // Step 4
    farmSize: "",
    unit: "Hectares",
    primaryCrops: "",
    secondaryCrops: "",
    productionSeason: "2023/2024",
    fields: ""
  });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handle = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => setCurrentStep(p => Math.min(p + 1, STEPS.length));
  const prevStep = () => setCurrentStep(p => Math.max(p - 1, 1));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentStep < STEPS.length) {
      nextStep();
      return;
    }
    
    // Final submit
    if (!form.fullName || !form.phone || !form.district || !form.village) {
      showToast("Please fill in all required fields marked with *", "error");
      return;
    }

    showToast("Farmer registered successfully!");
    setTimeout(() => {
      router.push("/dashboard/farmers/profiles");
    }, 1500);
  };

  return (
    <div className="space-y-6 relative pb-10 max-w-4xl mx-auto">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold text-white ${toast.type === "error" ? "bg-red-600" : "bg-[#1a5c2a]"}`}>
          {toast.msg}
        </div>
      )}

      {/* Progress Indicator */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 mb-6">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-gray-100 z-0"></div>
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-[#1a5c2a] z-0 transition-all duration-300" 
            style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
          ></div>
          
          {STEPS.map((step, index) => {
            const stepNum = index + 1;
            const isActive = stepNum === currentStep;
            const isCompleted = stepNum < currentStep;
            return (
              <div key={step} className="relative z-10 flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors duration-300 ${
                  isActive ? 'bg-white border-[#1a5c2a] text-[#1a5c2a]' : 
                  isCompleted ? 'bg-[#1a5c2a] border-[#1a5c2a] text-white' : 
                  'bg-white border-gray-200 text-gray-400'
                }`}>
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    stepNum
                  )}
                </div>
                <span className={`absolute top-10 text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap ${isActive || isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 overflow-hidden mt-10">
        
        {/* Step 1: Personal Details */}
        {currentStep === 1 && (
          <div className="p-6 space-y-6">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">Personal Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name *</label>
                <input type="text" value={form.fullName} onChange={(e) => handle("fullName", e.target.value)} required
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-gray-500 bg-white" placeholder="e.g. John Doe" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Gender *</label>
                <select value={form.gender} onChange={(e) => handle("gender", e.target.value)} required
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-gray-500 bg-white">
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Date of Birth</label>
                <input type="date" value={form.dob} onChange={(e) => handle("dob", e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-gray-500 bg-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phone Number *</label>
                <input type="tel" value={form.phone} onChange={(e) => handle("phone", e.target.value)} required
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-gray-500 bg-white" placeholder="+265 999 000 000" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Alternative Phone</label>
                <input type="tel" value={form.altPhone} onChange={(e) => handle("altPhone", e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-gray-500 bg-white" placeholder="+265 888 000 000" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">National ID</label>
                <input type="text" value={form.nationalId} onChange={(e) => handle("nationalId", e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-gray-500 bg-white" placeholder="e.g. P12345678" />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Location */}
        {currentStep === 2 && (
          <div className="p-6 space-y-6">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">Location</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">District *</label>
                <input type="text" value={form.district} onChange={(e) => handle("district", e.target.value)} required
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-gray-500 bg-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Traditional Authority (T/A) *</label>
                <input type="text" value={form.ta} onChange={(e) => handle("ta", e.target.value)} required
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-gray-500 bg-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">EPA</label>
                <input type="text" value={form.epa} onChange={(e) => handle("epa", e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-gray-500 bg-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Section</label>
                <input type="text" value={form.section} onChange={(e) => handle("section", e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-gray-500 bg-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Village *</label>
                <input type="text" value={form.village} onChange={(e) => handle("village", e.target.value)} required
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-gray-500 bg-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">GPS Coordinates</label>
                <div className="flex gap-2">
                  <input type="text" value={form.gps} onChange={(e) => handle("gps", e.target.value)} placeholder="-13.9626, 33.7741"
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-gray-500 bg-white" />
                  <button type="button" className="px-3 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-200" title="Capture GPS">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Organisation */}
        {currentStep === 3 && (
          <div className="p-6 space-y-6">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">Organisation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Association</label>
                <input type="text" value={form.association} onChange={(e) => handle("association", e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-gray-500 bg-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Club</label>
                <input type="text" value={form.club} onChange={(e) => handle("club", e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-gray-500 bg-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Farmer Group</label>
                <input type="text" value={form.group} onChange={(e) => handle("group", e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-gray-500 bg-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Membership Number</label>
                <input type="text" value={form.memberNo} onChange={(e) => handle("memberNo", e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-gray-500 bg-white" />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Farm Details */}
        {currentStep === 4 && (
          <div className="p-6 space-y-6">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">Farm Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Farm Size</label>
                  <input type="number" step="0.1" value={form.farmSize} onChange={(e) => handle("farmSize", e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-gray-500 bg-white" />
                </div>
                <div className="w-1/3">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Unit</label>
                  <select value={form.unit} onChange={(e) => handle("unit", e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-gray-500 bg-white">
                    <option value="Hectares">Hectares</option>
                    <option value="Acres">Acres</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Number of Fields</label>
                <input type="number" value={form.fields} onChange={(e) => handle("fields", e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-gray-500 bg-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Primary Crops (comma separated)</label>
                <input type="text" value={form.primaryCrops} onChange={(e) => handle("primaryCrops", e.target.value)} placeholder="e.g. Maize, Groundnuts"
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-gray-500 bg-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Secondary Crops (comma separated)</label>
                <input type="text" value={form.secondaryCrops} onChange={(e) => handle("secondaryCrops", e.target.value)} placeholder="e.g. Soybeans"
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-gray-500 bg-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Production Season</label>
                <input type="text" value={form.productionSeason} onChange={(e) => handle("productionSeason", e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-gray-500 bg-white" />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {currentStep === 5 && (
          <div className="p-6 space-y-8">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">Review Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Review Personal */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Personal Details</h3>
                  <button type="button" onClick={() => setCurrentStep(1)} className="text-xs font-semibold text-[#1a5c2a] hover:underline">Edit</button>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm border border-gray-100">
                  <div className="grid grid-cols-3"><span className="text-gray-500 font-medium">Name:</span> <span className="col-span-2 text-gray-900">{form.fullName || "—"}</span></div>
                  <div className="grid grid-cols-3"><span className="text-gray-500 font-medium">Gender:</span> <span className="col-span-2 text-gray-900">{form.gender || "—"}</span></div>
                  <div className="grid grid-cols-3"><span className="text-gray-500 font-medium">DOB:</span> <span className="col-span-2 text-gray-900">{form.dob || "—"}</span></div>
                  <div className="grid grid-cols-3"><span className="text-gray-500 font-medium">Phone:</span> <span className="col-span-2 text-gray-900">{form.phone || "—"}</span></div>
                  <div className="grid grid-cols-3"><span className="text-gray-500 font-medium">National ID:</span> <span className="col-span-2 text-gray-900">{form.nationalId || "—"}</span></div>
                </div>
              </div>

              {/* Review Location */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Location</h3>
                  <button type="button" onClick={() => setCurrentStep(2)} className="text-xs font-semibold text-[#1a5c2a] hover:underline">Edit</button>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm border border-gray-100">
                  <div className="grid grid-cols-3"><span className="text-gray-500 font-medium">District:</span> <span className="col-span-2 text-gray-900">{form.district || "—"}</span></div>
                  <div className="grid grid-cols-3"><span className="text-gray-500 font-medium">T/A:</span> <span className="col-span-2 text-gray-900">{form.ta || "—"}</span></div>
                  <div className="grid grid-cols-3"><span className="text-gray-500 font-medium">EPA:</span> <span className="col-span-2 text-gray-900">{form.epa || "—"}</span></div>
                  <div className="grid grid-cols-3"><span className="text-gray-500 font-medium">Village:</span> <span className="col-span-2 text-gray-900">{form.village || "—"}</span></div>
                  <div className="grid grid-cols-3"><span className="text-gray-500 font-medium">GPS:</span> <span className="col-span-2 text-gray-900">{form.gps || "—"}</span></div>
                </div>
              </div>

              {/* Review Organisation */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Organisation</h3>
                  <button type="button" onClick={() => setCurrentStep(3)} className="text-xs font-semibold text-[#1a5c2a] hover:underline">Edit</button>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm border border-gray-100">
                  <div className="grid grid-cols-3"><span className="text-gray-500 font-medium">Assoc:</span> <span className="col-span-2 text-gray-900">{form.association || "—"}</span></div>
                  <div className="grid grid-cols-3"><span className="text-gray-500 font-medium">Group:</span> <span className="col-span-2 text-gray-900">{form.group || "—"}</span></div>
                  <div className="grid grid-cols-3"><span className="text-gray-500 font-medium">Member No:</span> <span className="col-span-2 text-gray-900">{form.memberNo || "—"}</span></div>
                </div>
              </div>

              {/* Review Farm */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Farm Details</h3>
                  <button type="button" onClick={() => setCurrentStep(4)} className="text-xs font-semibold text-[#1a5c2a] hover:underline">Edit</button>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm border border-gray-100">
                  <div className="grid grid-cols-3"><span className="text-gray-500 font-medium">Size:</span> <span className="col-span-2 text-gray-900">{form.farmSize} {form.unit}</span></div>
                  <div className="grid grid-cols-3"><span className="text-gray-500 font-medium">Primary:</span> <span className="col-span-2 text-gray-900">{form.primaryCrops || "—"}</span></div>
                  <div className="grid grid-cols-3"><span className="text-gray-500 font-medium">Season:</span> <span className="col-span-2 text-gray-900">{form.productionSeason || "—"}</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form Footer */}
        <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 flex items-center justify-between">
          <button 
            type="button" 
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous Step
          </button>
          
          <button 
            type="submit"
            className="px-6 py-2.5 text-sm font-bold text-white bg-[#1a5c2a] rounded-lg hover:bg-[#134520] transition-colors shadow-sm flex items-center gap-2"
          >
            {currentStep === STEPS.length ? (
              <>
                Submit Registration
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </>
            ) : (
              <>
                Next Step
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
