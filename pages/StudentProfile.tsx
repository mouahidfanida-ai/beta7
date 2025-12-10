import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getStudent, saveStudent, getClass } from '../services/store';
import { Student, ClassGroup } from '../types';
import { ArrowLeft, Loader2, Save, GraduationCap, User, BookOpen, Share2, QrCode, Copy, Check, X } from 'lucide-react';
// @ts-ignore
import QRCode from 'qrcode';

interface StudentProfileProps {
  isTeacher?: boolean;
}

const StudentProfile: React.FC<StudentProfileProps> = ({ isTeacher = false }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [classGroup, setClassGroup] = useState<ClassGroup | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Share Modal State
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setIsLoading(true);
      const studentData = await getStudent(id);
      setStudent(studentData);
      
      if (studentData && studentData.classId) {
        const classData = await getClass(studentData.classId);
        setClassGroup(classData);
      }
      
      setIsLoading(false);
    };
    fetchData();
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;
    
    setIsSaving(true);
    const updated = await saveStudent(student);
    if (updated) {
      setStudent(updated);
      alert("Changes saved successfully!");
    } else {
      alert("Failed to save changes.");
    }
    setIsSaving(false);
  };

  const calculateAverage = (s: Student) => {
    const sum = (Number(s.note1) || 0) + (Number(s.note2) || 0) + (Number(s.note3) || 0);
    return (sum / 3).toFixed(2);
  };

  const profileUrl = typeof window !== 'undefined' ? window.location.href : '';

  useEffect(() => {
    const generateQR = async () => {
        if (!profileUrl) return;
        try {
            const url = await QRCode.toDataURL(profileUrl, {
                width: 300,
                margin: 2,
                color: {
                    dark: '#0f172a',
                    light: '#ffffff'
                }
            });
            setQrCodeUrl(url);
        } catch (err) {
            console.error("Failed to generate QR code", err);
        }
    };
    if (isShareOpen) {
        generateQR();
    }
  }, [profileUrl, isShareOpen]);

  const copyToClipboard = () => {
      navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-brand-600" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <p className="text-slate-500 mb-4 text-lg">Student not found.</p>
        <button onClick={() => navigate(isTeacher ? '/dashboard' : '/student')} className="text-brand-600 font-bold">Return to Previous Page</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-12 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto">
        
        <Link to={isTeacher ? "/dashboard" : "/student"} className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-brand-600 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to {isTeacher ? 'Dashboard' : 'Portal'}
        </Link>

        <div className="bg-white rounded-5xl shadow-card border border-slate-100 overflow-hidden relative">
           
           {/* Profile Header */}
           <div className="bg-slate-900 p-8 md:p-12 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                   <GraduationCap className="w-64 h-64" />
               </div>
               
               <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
                   <div className="w-24 h-24 rounded-full bg-brand-500 flex items-center justify-center text-3xl font-bold shadow-lg shadow-brand-500/50 border-4 border-slate-800">
                        {student.name.charAt(0)}
                   </div>
                   <div className="flex-1">
                       <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">{student.name}</h1>
                       
                       {/* Clickable Class Name */}
                       {classGroup ? (
                           <Link 
                                to={`/student?classId=${student.classId}`} 
                                className="inline-flex items-center gap-2 text-brand-200 font-bold hover:text-white transition-colors group cursor-pointer py-1"
                                title="Go to Class Sessions"
                           >
                                <div className="p-1.5 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                                    <BookOpen className="w-4 h-4" />
                                </div>
                                <span className="underline decoration-dotted underline-offset-4 decoration-brand-400/50 group-hover:decoration-white transition-all">
                                    {classGroup.name} - View Sessions
                                </span>
                           </Link>
                       ) : (
                           <div className="flex items-center gap-2 text-brand-200 font-medium">
                                <BookOpen className="w-4 h-4" />
                                Unassigned Class
                           </div>
                       )}
                   </div>

                   {/* Right Side Actions */}
                   <div className="md:ml-auto flex flex-row md:flex-col items-end gap-3 w-full md:w-auto">
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-white/10 w-full md:w-40 text-right">
                             <span className="block text-xs font-bold text-brand-200 uppercase tracking-widest mb-1">GPA</span>
                             <span className="text-3xl md:text-4xl font-extrabold text-white">{calculateAverage(student)}</span>
                        </div>
                        
                        <button 
                            onClick={() => setIsShareOpen(true)}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/15 text-white rounded-xl text-sm font-bold backdrop-blur-md transition-all border border-white/10 w-full md:w-auto hover:scale-105 active:scale-95"
                        >
                            <Share2 className="w-4 h-4" />
                            Share Profile
                        </button>
                   </div>
               </div>
           </div>

           {/* Edit Form */}
           <div className="p-8 md:p-12">
               <form onSubmit={handleSave} className="space-y-10">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                       <div className="col-span-full">
                           <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3 ml-1">Student Name</label>
                           <div className="relative">
                               <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                   <User className="h-5 w-5 text-slate-400" />
                               </div>
                               <input 
                                   type="text" 
                                   value={student.name}
                                   onChange={(e) => setStudent({...student, name: e.target.value})}
                                   disabled={!isTeacher}
                                   className={`w-full pl-12 rounded-2xl bg-slate-50 border-transparent p-4 font-bold text-slate-900 text-lg transition-all ${isTeacher ? 'focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10' : 'cursor-default'}`}
                               />
                           </div>
                       </div>

                       <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 col-span-full">
                           <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                               <GraduationCap className="w-5 h-5 text-brand-600" />
                               Academic Performance
                           </h3>
                           <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                               {['note1', 'note2', 'note3'].map((term, idx) => (
                                   <div key={term}>
                                       <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 text-center">Term {idx + 1}</label>
                                       <input 
                                           type="number" 
                                           value={student[term as keyof Student]}
                                           onChange={(e) => setStudent({...student, [term]: Number(e.target.value)})}
                                           disabled={!isTeacher}
                                           className={`w-full rounded-2xl bg-white border-slate-200 p-4 text-center font-extrabold text-2xl text-slate-900 shadow-sm ${isTeacher ? 'focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10' : 'cursor-default bg-slate-100'}`}
                                       />
                                   </div>
                               ))}
                           </div>
                       </div>
                   </div>

                   {isTeacher && (
                       <div className="flex justify-end pt-6 border-t border-slate-50">
                           <button 
                               type="submit" 
                               disabled={isSaving}
                               className="inline-flex items-center px-8 py-4 bg-brand-600 rounded-full text-sm font-bold text-white hover:bg-brand-700 shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-70"
                           >
                               {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                               Save Changes
                           </button>
                       </div>
                   )}
               </form>
           </div>
        </div>
      </div>

      {/* Share Modal */}
      {isShareOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
              <div 
                  className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
                  onClick={() => setIsShareOpen(false)}
              ></div>
              <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
                  <button 
                      onClick={() => setIsShareOpen(false)}
                      className="absolute top-6 right-6 p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  >
                      <X className="w-5 h-5" />
                  </button>
                  
                  <div className="text-center mb-8">
                      <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 mx-auto mb-4">
                          <QrCode className="w-8 h-8" />
                      </div>
                      <h3 className="text-2xl font-extrabold text-slate-900">Share Profile</h3>
                      <p className="text-slate-500 font-medium text-sm mt-1">Scan to view on mobile</p>
                  </div>

                  <div className="flex justify-center mb-8">
                       <div className="p-4 bg-white border-2 border-slate-100 rounded-3xl shadow-sm">
                           {qrCodeUrl ? (
                               <img 
                                    src={qrCodeUrl} 
                                    alt="QR Code" 
                                    className="w-48 h-48 rounded-lg"
                               />
                           ) : (
                               <div className="w-48 h-48 flex items-center justify-center bg-slate-50 rounded-lg text-slate-400">
                                   <Loader2 className="w-8 h-8 animate-spin" />
                               </div>
                           )}
                       </div>
                  </div>

                  <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Profile Link</label>
                      <div className="flex gap-2">
                          <input 
                              type="text" 
                              readOnly 
                              value={profileUrl} 
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-medium text-slate-600 focus:outline-none"
                          />
                          <button 
                              onClick={copyToClipboard}
                              className={`p-3 rounded-xl transition-all ${copied ? 'bg-green-500 text-white' : 'bg-slate-900 text-white hover:bg-brand-600'}`}
                          >
                              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default StudentProfile;