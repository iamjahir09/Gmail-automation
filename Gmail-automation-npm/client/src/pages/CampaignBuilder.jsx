import React, { useState } from 'react';
import { 
  Upload, 
  Plus, 
  Trash2, 
  Settings2, 
  ArrowRight, 
  Mail, 
  Type, 
  Layout, 
  CheckCircle2,
  FileText,
  BookOpen,
  X,
  Loader2
} from 'lucide-react';
import axios from 'axios';
import { TEMPLATE_CATEGORIES, PREBUILT_TEMPLATES } from '../data/templateLibrary';

const CampaignBuilder = ({ draftTemplate, setDraftTemplate }) => {
  const [step, setStep] = useState(1);
  const [campaignName, setCampaignName] = useState('');
  const [templates, setTemplates] = useState([{ subject: '', body: '' }]);
  const [file, setFile] = useState(null);
  const [minDelay, setMinDelay] = useState(30);
  const [maxDelay, setMaxDelay] = useState(60);
  const [showVault, setShowVault] = useState(false);
  const [vaultCategory, setVaultCategory] = useState('All');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (draftTemplate) {
      setTemplates([{ subject: draftTemplate.subject, body: draftTemplate.body }]);
      setStep(2); // Jump straight to template editor step
      if (typeof setDraftTemplate === 'function') {
        setDraftTemplate(null);
      }
    }
  }, [draftTemplate, setDraftTemplate]);

  const addTemplate = () => setTemplates([...templates, { subject: '', body: '' }]);
  const removeTemplate = (index) => setTemplates(templates.filter((_, i) => i !== index));
  
  const appendTemplateFromVault = (vaultTpl) => {
    if (templates.length === 1 && templates[0].subject === '' && templates[0].body === '') {
       setTemplates([{ subject: vaultTpl.subject, body: vaultTpl.body }]);
    } else {
       setTemplates([...templates, { subject: vaultTpl.subject, body: vaultTpl.body }]);
    }
    setShowVault(false);
  };
  
  const updateTemplate = (index, field, value) => {
    const newTemplates = [...templates];
    newTemplates[index][field] = value;
    setTemplates(newTemplates);
  };

  const handleFileUpload = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // 1. Create Campaign
      const response = await axios.post('${import.meta.env.VITE_API_URL}/api/campaigns', {
        name: campaignName,
        minDelay,
        maxDelay,
        templates
      });

      const campaignId = response.data.id;

      // 2. Upload CSV
      if (file) {
        const formData = new FormData();
        formData.append('csv', file);
        await axios.post(`${import.meta.env.VITE_API_URL}/api/campaigns/${campaignId}/contacts`, formData);
      }

      alert('Campaign created successfully!');
    } catch (error) {
      console.error(error);
      const backendError = error.response?.data?.error || error.message;
      alert(`Error creating campaign: ${backendError}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Create New Campaign</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium italic">Step {step} of 3: {['Basics', 'Templates', 'Settings'][step-1]}</p>
        </div>
        <div className="flex items-center space-x-2">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-2 w-12 rounded-full transition-all duration-500 ${i <= step ? 'bg-primary shadow-sm shadow-blue-500/20' : 'bg-slate-200 dark:bg-slate-800'}`}></div>
          ))}
        </div>
      </div>

      <div className="card-premium min-h-[400px] flex flex-col">
        {step === 1 && (
          <div className="space-y-6 flex-1">
            <div className="space-y-4">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Campaign Name</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="e.g., Summer Q3 Outreach"
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl py-4 pl-12 pr-4 focus:ring-4 focus:ring-blue-500/10 focus:border-primary outline-none transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Upload Leads (CSV)</label>
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center hover:border-primary/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all group cursor-pointer relative">
                <input type="file" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept=".csv" />
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform duration-300">
                    <Upload className="w-8 h-8" />
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 font-bold text-lg">{file ? file.name : "Click or drag your CSV file here"}</p>
                  <p className="text-slate-400 font-medium text-sm mt-2">Required columns: Email, Name (optional)</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 flex-1">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center space-x-2">
                <Layout className="w-5 h-5 text-primary" />
                <span>Email Templates (A/B Testing)</span>
              </h3>
              <div className="flex space-x-2">
                <button onClick={() => setShowVault(!showVault)} className="flex items-center space-x-2 text-primary font-bold text-sm bg-blue-50 dark:bg-blue-500/10 px-4 py-2 rounded-xl border border-blue-100 dark:border-blue-500/20 hover:bg-blue-100 transition-all">
                  <BookOpen className="w-4 h-4" />
                  <span>{showVault ? 'Back to Editor' : 'Browse Vault'}</span>
                </button>
                <button onClick={addTemplate} className="flex items-center space-x-2 text-emerald-600 font-bold text-sm bg-emerald-50 dark:bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-100 dark:border-emerald-500/20 hover:bg-emerald-100 transition-all">
                  <Plus className="w-4 h-4" />
                  <span>Add Variant</span>
                </button>
              </div>
            </div>

            {showVault ? (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar border border-slate-200 dark:border-slate-800 rounded-2xl p-6 bg-slate-50 dark:bg-slate-900">
                 <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
                    <h4 className="font-extrabold text-slate-800 dark:text-white">OrbitX Template Vault</h4>
                 </div>
                 <div className="flex flex-wrap gap-2 pb-2">
                    {TEMPLATE_CATEGORIES.map(cat => (
                      <button 
                        key={cat} onClick={() => setVaultCategory(cat)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${vaultCategory === cat ? 'bg-primary text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'}`}
                      >
                        {cat}
                      </button>
                    ))}
                 </div>
                 <div className="space-y-3">
                   {PREBUILT_TEMPLATES.filter(t => vaultCategory === 'All' || t.category === vaultCategory).map(tpl => (
                      <div key={tpl.id} className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary/50 transition-all group flex justify-between items-center">
                         <div>
                            <span className="text-[10px] font-black tracking-widest text-primary uppercase">{tpl.category}</span>
                            <h5 className="font-bold text-slate-800 dark:text-slate-100">{tpl.title}</h5>
                            <p className="text-xs text-slate-500 line-clamp-1 mt-1 font-mono">{tpl.subject}</p>
                         </div>
                         <button onClick={() => appendTemplateFromVault(tpl)} className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-blue-600 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                            Use Template
                         </button>
                      </div>
                   ))}
                 </div>
              </div>
            ) : (
              <div className="space-y-8 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {templates.map((template, index) => (
                <div key={index} className="p-6 bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 relative group">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Variant {index + 1}</span>
                    {templates.length > 1 && (
                      <button onClick={() => removeTemplate(index)} className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={template.subject}
                    onChange={(e) => updateTemplate(index, 'subject', e.target.value)}
                    placeholder="Email Subject (use {{name}} for variable)"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 focus:ring-2 focus:ring-primary/20 outline-none font-bold"
                  />
                  <textarea
                    rows={6}
                    value={template.body}
                    onChange={(e) => updateTemplate(index, 'body', e.target.value)}
                    placeholder="Email Body (Markdown or HTML support coming soon...)"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                  <div className="flex flex-wrap gap-2">
                    {['{{name}}', '{{email}}', '{Hi|Hello}', 'Custom Var'].map(tag => (
                      <span key={tag} className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded-md uppercase cursor-pointer hover:bg-primary/10 hover:text-primary transition-all">{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 flex-1">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center space-x-2">
              <Settings2 className="w-5 h-5 text-primary" />
              <span>Sending Limits & Delays</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="block text-sm font-bold text-slate-600 dark:text-slate-400">Min Delay (Seconds)</label>
                <input
                  type="number"
                  value={minDelay}
                  onChange={(e) => setMinDelay(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4 font-bold"
                />
              </div>
              <div className="space-y-4">
                <label className="block text-sm font-bold text-slate-600 dark:text-slate-400">Max Delay (Seconds)</label>
                <input
                  type="number"
                  value={maxDelay}
                  onChange={(e) => setMaxDelay(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4 font-bold"
                />
              </div>
            </div>

            <div className="p-6 bg-blue-50 dark:bg-blue-500/10 rounded-2xl border border-blue-100 dark:border-blue-500/20 flex items-start space-x-4">
              <div className="p-2 bg-blue-500 rounded-xl text-white">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-blue-900 dark:text-blue-300">Safe Sending Mode Enabled</h4>
                <p className="text-sm text-blue-600 dark:text-blue-400/80 mt-1">Randomized delays and template rotation help protect your account's sender reputation.</p>
              </div>
            </div>
          </div>
        )}

        <div className="p-8 border-t border-slate-100 dark:border-slate-800 mt-10 flex justify-between">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            className={`px-8 py-3 rounded-xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 transition-all ${step === 1 ? 'invisible' : ''}`}
          >
            Previous
          </button>
          
          {step < 3 ? (
            <button
              onClick={() => {
                if (step === 1 && (!file || !campaignName)) {
                  alert('Please provide a campaign name and upload a leads CSV file to continue.');
                  return;
                }
                setStep(step + 1);
              }}
              className={`btn-primary flex items-center space-x-2 px-8 py-3 flex-shrink-0 ${(step === 1 && (!file || !campaignName)) ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
            >
              <span>Next Step</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`btn-primary flex items-center space-x-2 px-10 py-3 flex-shrink-0 transition-all ${isSubmitting ? 'bg-slate-400 cursor-not-allowed opacity-75' : 'bg-green-500 shadow-green-500/20 hover:scale-105'}`}
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
              <span>{isSubmitting ? 'Launching...' : 'Launch Campaign'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignBuilder;
