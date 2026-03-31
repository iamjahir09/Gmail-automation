import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TEMPLATE_CATEGORIES, PREBUILT_TEMPLATES } from '../data/templateLibrary';
import { 
  Layers, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Eye, 
  Copy,
  Layout,
  FileText,
  CheckCircle2,
  BookOpen,
  Send
} from 'lucide-react';

const Templates = ({ setCurrentTab, setDraftTemplate }) => {
  const [templates, setTemplates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('library'); // 'my_templates' | 'library'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/campaigns/templates');
        setTemplates(res.data);
      } catch (error) {
        console.error("Error fetching templates:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  const handleCopy = (subject, body, id) => {
    navigator.clipboard.writeText(`SUBJECT: ${subject}\n\nBODY:\n${body}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleLaunch = (subject, body) => {
    if (setDraftTemplate && setCurrentTab) {
      setDraftTemplate({ subject, body });
      setCurrentTab('campaigns');
    }
  };

  const filteredMyTemplates = templates.filter(t => 
    t.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (t.campaign?.name && t.campaign.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredLibrary = PREBUILT_TEMPLATES.filter(t => {
    const matchesSearch = t.subject.toLowerCase().includes(searchTerm.toLowerCase()) || t.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-fade-in mb-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Email Templates
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Manage your library of high-converting email designs and spin-tax sequences.
          </p>
        </div>
        <button className="btn-primary flex items-center space-x-2 px-6 shadow-lg shadow-blue-500/20">
          <Plus className="w-4 h-4" />
          <span>New Template</span>
        </button>
      </div>

      <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-800 pb-px">
        <button 
          onClick={() => setActiveTab('library')}
          className={`flex items-center space-x-2 px-6 py-4 font-bold text-sm border-b-2 transition-all ${activeTab === 'library' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <BookOpen className="w-4 h-4" />
          <span>OrbitX Vault (Pre-built)</span>
        </button>
        <button 
          onClick={() => setActiveTab('my_templates')}
          className={`flex items-center space-x-2 px-6 py-4 font-bold text-sm border-b-2 transition-all ${activeTab === 'my_templates' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <Layers className="w-4 h-4" />
          <span>My Campaign Templates</span>
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          type="text" 
          placeholder={activeTab === 'library' ? "Search 25+ templates by title..." : "Search my templates by subject or campaign..."}
          className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all dark:text-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {activeTab === 'library' && (
        <div className="flex flex-wrap gap-2 pb-2">
          {TEMPLATE_CATEGORIES.map(cat => (
            <button 
              key={cat} onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${selectedCategory === cat ? 'bg-primary text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeTab === 'my_templates' ? (
          loading ? (
            <div className="col-span-full py-20 text-center text-slate-400 italic">Formatting templates...</div>
          ) : filteredMyTemplates.length > 0 ? (
            filteredMyTemplates.map((template) => (
              <div key={template.id} className="card-premium group hover:shadow-xl transition-all duration-300 flex flex-col h-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                 <div className="flex items-center space-x-3 mb-4 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <div className="p-2 bg-white dark:bg-slate-900 shadow-sm rounded-md">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500 truncate">
                      {template.campaign?.name || 'Untitled Campaign'}
                    </span>
                 </div>
                 
                 <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-2 truncate">
                   {template.subject}
                 </h3>
                 
                 <div className="flex-1 bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 mb-4 overflow-hidden relative group-hover:border-primary/20 transition-all">
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-4 leading-relaxed font-mono italic">
                      {template.body.length > 150 ? `${template.body.substring(0, 150)}...` : template.body}
                    </p>
                    <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-slate-50 dark:from-slate-950/50 to-transparent"></div>
                 </div>

                 <div className="flex items-center justify-between pt-4 mt-auto border-t border-slate-100 dark:border-slate-800">
                    <div className="flex space-x-1">
                      <button className="p-2 text-slate-400 hover:text-primary hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-all">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleCopy(template.subject, template.body, template.id)} className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-all">
                        {copiedId === template.id ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <button className="text-[11px] font-bold text-primary flex items-center space-x-1 hover:underline">
                      <Eye className="w-3 h-3" />
                      <span>Preview</span>
                    </button>
                 </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 card-premium flex flex-col items-center justify-center border-dashed border-2 opacity-50">
              <Layout className="w-12 h-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-500">No Templates Found</h3>
              <p className="text-slate-400 text-sm mt-1">Create your first highly personalized email template.</p>
            </div>
          )
        ) : (
          /* LIBRARY TAB */
          filteredLibrary.length > 0 ? (
            filteredLibrary.map((template) => (
              <div key={template.id} className="card-premium group hover:shadow-xl transition-all duration-300 flex flex-col h-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                 <div className="flex flex-col space-y-1 mb-4 p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-100 dark:border-blue-500/20">
                    <span className="text-[10px] uppercase tracking-widest font-black text-primary">
                      {template.category}
                    </span>
                    <h3 className="font-extrabold text-slate-800 dark:text-slate-100 truncate text-sm">
                      {template.title}
                    </h3>
                 </div>
                 
                 <div className="mb-2">
                   <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Subject Spin-Tax</p>
                   <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm truncate bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                     {template.subject}
                   </p>
                 </div>
                 
                 <div className="flex-1 mt-2">
                   <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Sequence Body</p>
                   <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 mb-4 overflow-hidden relative group-hover:border-primary/20 transition-all">
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-5 leading-relaxed font-mono">
                        {template.body}
                      </p>
                      <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-slate-50 dark:from-slate-950/50 to-transparent"></div>
                   </div>
                 </div>

                 <div className="pt-4 mt-auto border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-2">
                    <button 
                      onClick={() => handleCopy(template.subject, template.body, template.id)} 
                      className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all ${copiedId === template.id ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                    >
                      {copiedId === template.id ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span className="hidden lg:inline">{copiedId === template.id ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button 
                      onClick={() => handleLaunch(template.subject, template.body)} 
                      className="flex-[2] py-2.5 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 bg-primary text-white hover:bg-blue-600 shadow-lg shadow-blue-500/20 transition-all"
                    >
                      <Send className="w-4 h-4" />
                      <span>Use in Campaign</span>
                    </button>
                 </div>
              </div>
            ))
          ) : (
             <div className="col-span-full py-20 text-center text-slate-400 italic">No templates match this category.</div>
          )
        )}
      </div>
    </div>
  );
};

export default Templates;
