
import React, { useState, useRef, useEffect } from 'react';
import { Upload, Image as ImageIcon, Download, Sparkles, Loader2, RefreshCw, Undo, Redo, ChevronDown, Dice5, User, Check, Globe, Share2, Camera, ArrowRight } from 'lucide-react';
import { Translation, Language, Gender, Resolution, GeneratedImage } from '../types';
import { generateHeadshot } from '../services/geminiService';
import { CLOTHING_PRESETS, RANDOM_CLOTHING_ATTRIBUTES } from '../constants';

interface MainAppProps {
  t: Translation;
  lang: Language;
  setLang: (l: Language) => void;
}

export const MainApp: React.FC<MainAppProps> = ({ t, lang, setLang }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  
  const [gender, setGender] = useState<Gender>('female');
  const [clothing, setClothing] = useState<string>('');
  // selectedPreset is for UI state only, to show active dropdown item
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  
  const [resolution] = useState<Resolution>('2K');
  
  const [clothingHistory, setClothingHistory] = useState<string[]>(['']);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let interval: any;
    if (isLoading) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) return 95;
          const increment = Math.max(0.5, Math.random() * 2);
          return prev + increment;
        });
      }, 500);
    } else {
      setProgress(100);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const updateClothing = (newText: string, addToHistory = true, fromPreset = false) => {
    setClothing(newText);
    
    // Exclusive Logic:
    // If coming from preset, set preset.
    // If user typing or random, clear preset to show it's custom.
    if (fromPreset) {
        setSelectedPreset(newText);
    } else {
        setSelectedPreset('');
    }

    if (addToHistory) {
      const newHistory = clothingHistory.slice(0, historyIndex + 1);
      newHistory.push(newText);
      setClothingHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const prevText = clothingHistory[newIndex];
      setClothing(prevText);
      
      // Check if this text matches any preset to visually sync dropdown
      const isPreset = CLOTHING_PRESETS[lang][gender].includes(prevText);
      setSelectedPreset(isPreset ? prevText : '');
    }
  };

  const handleRedo = () => {
    if (historyIndex < clothingHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const nextText = clothingHistory[newIndex];
      setClothing(nextText);
      
      const isPreset = CLOTHING_PRESETS[lang][gender].includes(nextText);
      setSelectedPreset(isPreset ? nextText : '');
    }
  };

  const handleRandomClothing = () => {
    const attrs = RANDOM_CLOTHING_ATTRIBUTES[lang];
    const style = attrs.styles[Math.floor(Math.random() * attrs.styles.length)];
    const material = attrs.materials[Math.floor(Math.random() * attrs.materials.length)];
    const garment = attrs.garments[Math.floor(Math.random() * attrs.garments.length)];
    const detail = attrs.details[Math.floor(Math.random() * attrs.details.length)];
    const vibe = attrs.vibe[Math.floor(Math.random() * attrs.vibe.length)];

    // Create a rich, long description
    const randomStyle = `${style}, ${material} ${garment}, ${detail}. ${vibe}.`;
    
    if (randomStyle === clothing) {
        handleRandomClothing();
    } else {
        // fromPreset is false because Random != Preset
        updateClothing(randomStyle, true, false);
    }
  };

  // Sync history debouncer
  useEffect(() => {
    const timer = setTimeout(() => {
      if (clothing !== clothingHistory[historyIndex]) {
         const newHistory = clothingHistory.slice(0, historyIndex + 1);
         newHistory.push(clothing);
         setClothingHistory(newHistory);
         setHistoryIndex(newHistory.length - 1);
         
         if (!CLOTHING_PRESETS[lang][gender].includes(clothing)) {
             setSelectedPreset('');
         }
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [clothing, clothingHistory, historyIndex, lang, gender]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setGeneratedImages([]);
        setSelectedImageId(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async (angleModifier: string = "") => {
    if (!imagePreview) {
      setError(t.errorNoImage);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const base64Data = imagePreview.split(',')[1];
      const mimeType = imagePreview.split(';')[0].split(':')[1];

      const resultUrl = await generateHeadshot({
        imageBase64: base64Data,
        mimeType,
        gender,
        clothing,
        resolution,
        angleModifier
      });

      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url: resultUrl,
        promptUsed: angleModifier || "Front Facing",
        timestamp: Date.now()
      };

      setGeneratedImages(prev => [newImage, ...prev]);
      setSelectedImageId(newImage.id);

    } catch (err) {
      console.error(err);
      setError("Failed to generate image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const activeImage = generatedImages.find(img => img.id === selectedImageId) || generatedImages[0];

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-black selection:text-white">
      {/* Editorial Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-100">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-baseline gap-1">
            <h1 className="text-2xl font-serif font-bold tracking-tighter text-black">
              AUTRON
            </h1>
            <span className="text-[10px] font-medium tracking-[0.2em] text-stone-400 uppercase transform translate-y-[-2px] ml-2">ProPortrait</span>
          </div>
          <div>
            <div className="flex items-center gap-4">
                <div className="relative group">
                    <button className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase hover:text-stone-500 transition-colors">
                        <Globe className="w-3 h-3" />
                        {lang === 'en' ? 'EN' : lang === 'zh-TW' ? '繁中' : '简中'}
                    </button>
                    <div className="absolute right-0 top-full mt-2 w-32 bg-white border border-stone-100 shadow-xl rounded-lg overflow-hidden hidden group-hover:block p-1">
                        {[
                            { code: 'en', label: 'English' },
                            { code: 'zh-TW', label: '繁體中文' },
                            { code: 'zh-CN', label: '简体中文' }
                        ].map((l) => (
                            <button
                                key={l.code}
                                onClick={() => setLang(l.code as Language)}
                                className={`w-full text-left px-3 py-2 text-[10px] uppercase tracking-widest hover:bg-stone-50 rounded-md ${lang === l.code ? 'font-bold' : 'font-normal'}`}
                            >
                                {l.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-[1600px] mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          
          {/* Left Panel: Controls */}
          <div className="lg:col-span-4 flex flex-col gap-10">
            
            {/* 1. Upload */}
            <div>
              <div className="flex justify-between items-baseline mb-4">
                 <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">{t.uploadTitle}</h2>
                 {imagePreview && <span className="text-[10px] text-emerald-600 flex items-center gap-1"><Check className="w-3 h-3" /> Ready</span>}
              </div>
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`group relative cursor-pointer overflow-hidden rounded-sm transition-all duration-700 ease-out ${imagePreview ? 'aspect-[3/4] shadow-2xl shadow-stone-200' : 'aspect-square bg-stone-50 hover:bg-stone-100 border-[0.5px] border-stone-200 hover:border-black'}`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Source" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 filter grayscale-[20%] group-hover:grayscale-0" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500 flex items-center justify-center">
                      <div className="bg-white text-black px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 flex items-center gap-2 shadow-2xl">
                        <RefreshCw className="w-3 h-3" /> {t.changePhoto}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                    <div className="w-20 h-20 mb-6 rounded-full bg-white border border-stone-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      <Camera className="w-6 h-6 text-stone-300 group-hover:text-black transition-colors" />
                    </div>
                    <p className="text-sm font-medium text-black mb-2 tracking-wide">{t.uploadDesc}</p>
                    <p className="text-[10px] text-stone-400 max-w-[200px] leading-relaxed tracking-wide font-light">{t.uploadTip}</p>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Settings */}
            <div className="flex-grow flex flex-col gap-8">
                {/* Gender */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 block">{t.genderLabel}</label>
                  <div className="grid grid-cols-2 gap-1 p-1 bg-stone-50 rounded-lg border border-stone-100">
                    {['male', 'female'].map((g) => (
                        <button
                          key={g}
                          onClick={() => setGender(g as Gender)}
                          className={`py-3 text-[10px] font-bold uppercase tracking-widest transition-all duration-300 rounded-md ${gender === g ? 'bg-white text-black shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
                        >
                          {g === 'male' ? t.male : t.female}
                        </button>
                    ))}
                  </div>
                </div>

                {/* Clothing */}
                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">{t.clothingLabel}</label>
                        <div className="flex gap-2">
                            <button onClick={handleUndo} disabled={historyIndex <= 0} className="hover:text-black text-stone-300 disabled:opacity-20 transition-colors" title={t.undo}>
                                <Undo className="w-4 h-4" />
                            </button>
                            <button onClick={handleRedo} disabled={historyIndex >= clothingHistory.length - 1} className="hover:text-black text-stone-300 disabled:opacity-20 transition-colors" title={t.redo}>
                                <Redo className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    
                    <div className="relative group">
                        <textarea
                            value={clothing}
                            onChange={(e) => updateClothing(e.target.value, true, false)}
                            placeholder={t.clothingPlaceholder}
                            rows={4}
                            className="w-full bg-white rounded-none border-b border-stone-200 focus:border-black px-0 py-2 text-sm text-black placeholder-stone-300 transition-all resize-none focus:ring-0 leading-relaxed font-light"
                        />
                         <button 
                           onClick={handleRandomClothing}
                           className="absolute bottom-2 right-0 p-2 text-stone-400 hover:text-black transition-colors"
                           title={t.randomBtn}
                        >
                            <Dice5 className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="relative">
                        <select
                            onChange={(e) => updateClothing(e.target.value, true, true)}
                            value={selectedPreset}
                            className="w-full appearance-none bg-stone-50 border-0 text-stone-600 text-xs font-medium py-4 px-4 pr-10 rounded-lg focus:ring-1 focus:ring-black cursor-pointer hover:bg-stone-100 transition-colors truncate"
                        >
                            <option value="" disabled>{t.selectPreset}</option>
                            {CLOTHING_PRESETS[lang][gender].map((preset, idx) => (
                                <option key={idx} value={preset}>
                                    {preset.length > 60 ? preset.substring(0, 60) + '...' : preset}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-stone-400">
                            <ChevronDown className="h-3 w-3" />
                        </div>
                    </div>
                </div>

              {/* Action */}
              <div className="mt-8">
                <button
                    onClick={() => handleGenerate()}
                    disabled={isLoading || !imagePreview}
                    className="w-full bg-black text-white py-5 rounded-none hover:bg-stone-800 disabled:bg-stone-200 disabled:text-stone-400 transition-all duration-300 group relative overflow-hidden"
                >
                    <span className={`relative z-10 flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                        {t.generateBtn} <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </span>
                    
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center z-20">
                             <Loader2 className="w-4 h-4 animate-spin" />
                        </div>
                    )}
                </button>
                {error && <p className="text-red-500 text-[10px] text-center mt-3 tracking-wide">{error}</p>}
              </div>
            </div>
          </div>

          {/* Right Panel: Gallery */}
          <div className="lg:col-span-8 flex flex-col h-full min-h-[800px]">
            
            {/* Main Canvas */}
            <div className="flex-grow bg-[#FDFDFD] relative border border-stone-100 flex flex-col items-center justify-center p-8 sm:p-20 shadow-sm overflow-hidden">
                
                {isLoading ? (
                   <div className="flex flex-col items-center gap-6 w-full max-w-md relative z-10">
                        <div className="w-full aspect-[3/4] bg-stone-100 relative overflow-hidden">
                             <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent animate-pulse"></div>
                             <div className="absolute bottom-0 left-0 h-[2px] bg-black transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
                        </div>
                        <div className="flex justify-between w-full text-[10px] font-mono uppercase tracking-widest text-stone-400">
                            <span>{t.loading}</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                   </div>
                ) : activeImage ? (
                    <div className="relative w-full h-full flex flex-col items-center justify-center z-10 animate-[fadeIn_0.8s_ease-out]">
                        <div className="relative shadow-2xl shadow-stone-300/50 transform transition-transform duration-700 hover:scale-[1.01]">
                            <img src={activeImage.url} alt="Result" className="max-h-[75vh] w-auto object-contain block" />
                        </div>
                        
                        <div className="mt-10 flex flex-col items-center text-center max-w-xl">
                            <p className="text-xs text-stone-500 font-serif italic tracking-wide leading-relaxed">
                                "{activeImage.promptUsed}"
                            </p>
                            
                            {/* Lead Driven CTA */}
                            <div className="mt-8 pt-8 border-t border-stone-100 flex items-center gap-6">
                                <div className="text-right hidden sm:block">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-black">{t.ctaShareTitle}</p>
                                    <p className="text-[9px] text-stone-400">High Resolution Format</p>
                                </div>
                                <div className="h-8 w-[1px] bg-stone-200 hidden sm:block"></div>
                                <div className="flex gap-3">
                                    <a 
                                        href={activeImage.url} 
                                        download={`autron-portrait-${activeImage.id}.png`}
                                        className="bg-black text-white px-6 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-stone-800 transition-colors flex items-center gap-2"
                                    >
                                        <Download className="w-3 h-3" /> {t.downloadBtn}
                                    </a>
                                    <button className="bg-white border border-stone-200 text-black px-4 py-3 hover:bg-stone-50 transition-colors">
                                        <Share2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center z-10 opacity-40">
                        <div className="text-6xl font-serif font-light text-stone-200 mb-4 italic">Autron</div>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-stone-400">{t.emptyTitle}</p>
                    </div>
                )}
            </div>

            {/* Bottom Bar: Variants & History */}
            {generatedImages.length > 0 && (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-8 border-t border-stone-100 pt-8 animate-[fadeIn_1s_ease-out]">
                     
                     {/* Angle Controls */}
                     <div className="md:col-span-5 flex flex-col justify-between">
                         <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-4">{t.anglesTitle}</h3>
                         <div className="grid grid-cols-2 gap-2">
                            {[
                                { label: t.angleLeft45, prompt: "Profile view from left side, cinematic lighting" },
                                { label: t.angleRight45, prompt: "Profile view from right side, cinematic lighting" },
                                { label: t.angleFull, prompt: "Full body fashion shot, standing pose" },
                                { label: t.angleClose, prompt: "Extreme close up facial portrait, macro details" },
                            ].map((action, i) => (
                                <button 
                                    key={i}
                                    disabled={isLoading}
                                    onClick={() => handleGenerate(action.prompt)}
                                    className="border border-stone-200 hover:border-black text-stone-600 hover:text-black py-3 px-4 text-[9px] font-bold uppercase tracking-widest transition-all text-left"
                                >
                                    {action.label}
                                </button>
                            ))}
                         </div>
                     </div>

                     {/* History Scroll */}
                     <div className="md:col-span-7">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-4">{t.historyTitle}</h3>
                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                            {generatedImages.map((img) => (
                                <button
                                    key={img.id}
                                    onClick={() => setSelectedImageId(img.id)}
                                    className={`relative flex-shrink-0 w-20 aspect-[3/4] grayscale transition-all duration-500 ${
                                        activeImage?.id === img.id 
                                        ? 'grayscale-0 ring-1 ring-black shadow-lg scale-105 z-10' 
                                        : 'hover:grayscale-0 opacity-60 hover:opacity-100'
                                    }`}
                                >
                                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                     </div>
                </div>
            )}
          </div>
        </div>
      </main>
      
      <footer className="py-8 text-center border-t border-stone-100 mt-12">
        <p className="text-[9px] uppercase tracking-[0.3em] text-stone-300">{t.footerRights}</p>
      </footer>
    </div>
  );
};