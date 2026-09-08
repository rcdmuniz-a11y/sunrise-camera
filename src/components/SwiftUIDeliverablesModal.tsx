import React, { useState } from 'react';
import { SWIFT_PROJECT_FILES } from '../data/swiftCodebase';
import { SwiftFileItem } from '../types/camera';
import JSZip from 'jszip';
import {
  Code2,
  Download,
  Copy,
  Check,
  FileCode,
  Layers,
  FolderTree,
  ExternalLink,
  X,
  FileText,
  BookOpen,
  Smartphone,
  UploadCloud,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface SwiftUIDeliverablesProps {
  onClose: () => void;
}

export const SwiftUIDeliverablesModal: React.FC<SwiftUIDeliverablesProps> = ({
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'code'>('guide');
  const [selectedFile, setSelectedFile] = useState<SwiftFileItem>(SWIFT_PROJECT_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const rootFolder = zip.folder('SunriseCamera3.0_Xcode_Project');

      // Add all Swift code files and configs
      SWIFT_PROJECT_FILES.forEach((file) => {
        rootFolder?.file(file.path, file.content);
      });

      // Add Assets.xcassets Contents.json
      const assetsFolder = rootFolder?.folder('SunriseCamera/Assets.xcassets');
      assetsFolder?.file('Contents.json', JSON.stringify({
        info: { author: 'xcode', version: 1 }
      }, null, 2));

      // Fetch and bundle the official PNG frames directly into Assets.xcassets
      try {
        const [vBuffer, hBuffer] = await Promise.all([
          fetch('/Marco Vertical.png').then((r) => r.arrayBuffer()),
          fetch('/Marco Horizontal.png').then((r) => r.arrayBuffer()),
        ]);

        const vSet = assetsFolder?.folder('Marco Vertical.imageset');
        vSet?.file('Marco Vertical.png', vBuffer);
        vSet?.file('Contents.json', JSON.stringify({
          images: [{ filename: 'Marco Vertical.png', idiom: 'universal', scale: '1x' }],
          info: { author: 'xcode', version: 1 },
        }, null, 2));

        const hSet = assetsFolder?.folder('Marco Horizontal.imageset');
        hSet?.file('Marco Horizontal.png', hBuffer);
        hSet?.file('Contents.json', JSON.stringify({
          images: [{ filename: 'Marco Horizontal.png', idiom: 'universal', scale: '1x' }],
          info: { author: 'xcode', version: 1 },
        }, null, 2));
      } catch (assetErr) {
        console.warn('No se pudieron adjuntar los marcos PNG al zip:', assetErr);
      }

      // Add quick-start note
      rootFolder?.file('LEEME_PRIMERO.txt', `PROYECTO SUNRISE CAMERA 3.0 - SWIFTUI + TESTFLIGHT
=====================================================
Pasos rápidos:
1. Abre Xcode en tu Mac (versión 15 o 16).
2. Crea un nuevo proyecto: File > New > Project > iOS App (Interface: SwiftUI).
3. Nómbralo 'SunriseCamera' y arrastra todos los archivos de esta carpeta al proyecto.
4. En Assets.xcassets crea dos Image Sets: 'Marco Vertical' y 'Marco Horizontal' y coloca los marcos PNG.
5. Conecta tu iPhone por cable o selecciona 'Any iOS Device' > Product > Archive para subir a TestFlight.
`);

      // Generate zip and download
      const content = await zip.generateAsync({ type: 'blob' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(content);
      a.download = 'SunriseCamera3.0_SwiftUI_Project.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error al generar zip:', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div
      id="swiftui_deliverables_modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-5 animate-in fade-in"
    >
      <div className="relative w-full max-w-6xl bg-slate-900 border border-white/20 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[92vh]">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-950 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <Code2 size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Sunrise Camera 3.0 — iOS & TestFlight
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/40 text-[10px] font-mono font-bold">
                  iOS 16/17/18
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Guía completa de despliegue a TestFlight y explorador de código nativo
              </p>
            </div>
          </div>

          {/* Navigation Tabs & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-slate-900 border border-white/15 rounded-xl p-1 flex items-center gap-1">
              <button
                onClick={() => setActiveTab('guide')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'guide'
                    ? 'bg-orange-500 text-black shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <BookOpen size={14} />
                <span>Paso a Paso TestFlight</span>
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'code'
                    ? 'bg-orange-500 text-black shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Code2 size={14} />
                <span>Explorador Swift</span>
              </button>
            </div>

            <button
              id="btn_download_full_zip"
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-black font-extrabold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              <Download size={14} />
              <span className="hidden sm:inline">{isZipping ? 'Empaquetando...' : 'Descargar ZIP'}</span>
            </button>

            <button
              id="btn_close_swift_modal"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tab 1: Visual Step-by-Step Guide for TestFlight and iPhone */}
        {activeTab === 'guide' ? (
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 bg-slate-950 text-slate-200">
            {/* Introductory Banner */}
            <div className="bg-gradient-to-r from-orange-950/40 via-amber-950/30 to-slate-900 border border-orange-500/30 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-orange-400">
                  Ruta de Despliegue Rápido
                </span>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  ¿Cómo instalar Sunrise Camera 3.0 en tu iPhone y en el de tu equipo?
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                  Tienes 2 caminos: probarlo en <strong>5 minutos</strong> conectando tu iPhone a tu Mac por cable, o publicarlo en <strong>TestFlight</strong> para enviar un enlace a todos los fotógrafos del evento.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 size={14} /> Código 100% Nativo
                </span>
              </div>
            </div>

            {/* Step 1: Requisitos & Preparación */}
            <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-orange-500 text-black font-black flex items-center justify-center text-xs">
                  1
                </div>
                <h4 className="text-sm sm:text-base font-bold text-white">
                  Preparación y requisitos en tu Mac
                </h4>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-9">
                Para compilar cualquier aplicación de iPhone nativa necesitas una computadora <strong>Mac</strong>:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pl-9 pt-1 text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-white/5 space-y-1">
                  <span className="font-bold text-orange-300 block">Xcode instalado</span>
                  <p className="text-slate-400">Descárgalo gratis desde la Mac App Store (versión 15 o 16 recomendada).</p>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-white/5 space-y-1">
                  <span className="font-bold text-orange-300 block">Apple ID en Xcode</span>
                  <p className="text-slate-400">Abre Xcode &gt; Settings &gt; Accounts y añade tu cuenta de Apple (gratis o Developer).</p>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-white/5 space-y-1">
                  <span className="font-bold text-orange-300 block">Tu archivo ZIP</span>
                  <p className="text-slate-400">Descomprime el ZIP descargado con las carpetas Views, ViewModels y Services.</p>
                </div>
              </div>
            </div>

            {/* Step 2: Crear Proyecto en Xcode */}
            <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-orange-500 text-black font-black flex items-center justify-center text-xs">
                  2
                </div>
                <h4 className="text-sm sm:text-base font-bold text-white">
                  Crear el proyecto en Xcode y colocar los archivos
                </h4>
              </div>

              <div className="space-y-2 pl-9 text-xs sm:text-sm text-slate-300">
                <ol className="list-decimal list-inside space-y-2">
                  <li>
                    Abre Xcode y presiona <strong>&quot;Create New Xcode Project&quot;</strong>.
                  </li>
                  <li>
                    Selecciona <strong>iOS &gt; App</strong> y presiona <em>Next</em>.
                  </li>
                  <li>
                    Configura los campos:
                    <ul className="list-disc list-inside pl-4 mt-1 space-y-1 text-slate-400 font-mono text-xs">
                      <li>Product Name: <span className="text-amber-300">SunriseCamera</span></li>
                      <li>Organization Identifier: <span className="text-amber-300">com.tuempresa</span> (o tu nombre)</li>
                      <li>Interface: <span className="text-amber-300">SwiftUI</span></li>
                      <li>Language: <span className="text-amber-300">Swift</span></li>
                    </ul>
                  </li>
                  <li>
                    Guarda la carpeta y <strong>arrastra los archivos Swift</strong> del ZIP (App, Views, ViewModels, Processing, Services) al navegador lateral izquierdo de Xcode.
                  </li>
                </ol>
              </div>
            </div>

            {/* Step 3: Los Marcos PNG */}
            <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-orange-500 text-black font-black flex items-center justify-center text-xs">
                  3
                </div>
                <h4 className="text-sm sm:text-base font-bold text-white">
                  Colocar los marcos PNG en Assets.xcassets
                </h4>
              </div>

              <div className="space-y-2 pl-9 text-xs sm:text-sm text-slate-300">
                <p>
                  En el panel izquierdo de Xcode, haz clic en el archivo <strong>Assets.xcassets</strong>:
                </p>
                <div className="p-3 bg-slate-950 rounded-xl border border-white/10 space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold font-mono">A.</span>
                    <p>Haz clic derecho en la lista blanca y elige <strong>New Image Set</strong>. Nómbralo exactamente <code className="text-amber-300 font-bold font-mono">Marco Vertical</code>. Arrastra tu PNG vertical (1080x1920) a la casilla <em>1x / Universal</em>.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold font-mono">B.</span>
                    <p>Crea otro <strong>New Image Set</strong> y nómbralo exactamente <code className="text-amber-300 font-bold font-mono">Marco Horizontal</code>. Arrastra tu PNG horizontal (1920x1080) a la casilla <em>1x / Universal</em>.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Two Distribution Options: Direct Cable vs TestFlight */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option A: Direct iPhone Install */}
              <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-cyan-500/30 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Smartphone size={20} />
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                    Opción A: Instalar directo por Cable (5 min)
                  </h4>
                </div>
                <p className="text-xs text-slate-300">
                  Ideal para probar inmediatamente en tu propio iPhone sin esperar aprobaciones ni pagar cuenta de desarrollador.
                </p>

                <ol className="list-decimal list-inside space-y-2 text-xs text-slate-400 pt-1">
                  <li>Conecta tu iPhone a la Mac con cable USB / Lightning / USB-C.</li>
                  <li>Desbloquea el iPhone y presiona <strong>&quot;Confiar en este equipo&quot;</strong>.</li>
                  <li>En Xcode, en la barra superior donde dice dispositivo, selecciona tu iPhone.</li>
                  <li>En la pestaña <em>Signing &amp; Capabilities</em>, marca <strong>Automatically manage signing</strong> y elige tu Personal Team.</li>
                  <li>Presiona el botón <strong>Play (▶)</strong>.</li>
                  <li>
                    <em>Primera vez en iPhone:</em> Ve a Ajustes &gt; General &gt; Administración de dispositivos y presiona <strong>&quot;Confiar en tu cuenta&quot;</strong>. ¡Listo, la app se abrirá en tu iPhone!
                  </li>
                </ol>
              </div>

              {/* Option B: TestFlight */}
              <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-orange-500/30 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-orange-400">
                  <UploadCloud size={20} />
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                    Opción B: Subir a TestFlight (Para el equipo)
                  </h4>
                </div>
                <p className="text-xs text-slate-300">
                  Permite distribuir un enlace de descarga a hasta 10,000 personas del evento sin cables ni conectar dispositivos.
                </p>

                <ol className="list-decimal list-inside space-y-2 text-xs text-slate-400 pt-1">
                  <li>Requiere cuenta <a href="https://developer.apple.com" target="_blank" rel="noreferrer" className="text-orange-300 underline">Apple Developer Program</a> ($99/año).</li>
                  <li>En Xcode, en el selector de destino arriba, elige <strong>Any iOS Device (arm64)</strong>.</li>
                  <li>Ve al menú superior: <strong>Product &gt; Archive</strong>.</li>
                  <li>Al terminar, se abrirá la ventana <em>Organizer</em>. Pulsa <strong>Distribute App</strong>.</li>
                  <li>Selecciona <strong>TestFlight &amp; App Store</strong> &gt; <em>Upload</em>.</li>
                  <li>Xcode subirá la app a los servidores de Apple en unos minutos.</li>
                </ol>
              </div>
            </div>

            {/* Step 4: Configuración en App Store Connect & TestFlight */}
            <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-orange-500 text-black font-black flex items-center justify-center text-xs">
                  4
                </div>
                <h4 className="text-sm sm:text-base font-bold text-white">
                  Cómo invitar a los fotógrafos e instalar desde TestFlight en el iPhone
                </h4>
              </div>

              <div className="space-y-3 pl-9 text-xs sm:text-sm text-slate-300">
                <ol className="list-decimal list-inside space-y-2 text-xs text-slate-400">
                  <li>
                    Inicia sesión en <a href="https://appstoreconnect.apple.com" target="_blank" rel="noreferrer" className="text-amber-300 underline font-semibold">appstoreconnect.apple.com</a> con tu cuenta de desarrollador.
                  </li>
                  <li>
                    Haz clic en <strong>Apps</strong> y selecciona <strong>Sunrise Camera</strong>.
                  </li>
                  <li>
                    Entra a la pestaña superior <strong>TestFlight</strong>. Verás la versión subida (por ejemplo, <em>Build 1.0 (1)</em>).
                  </li>
                  <li>
                    Si te pregunta por <em>Export Compliance</em> (cifrado), marca <strong>&quot;No&quot;</strong> (la app no usa criptografía propietaria).
                  </li>
                  <li>
                    En la barra lateral izquierda bajo <strong>External Groups (Grupos externos)</strong>:
                    <div className="p-3 mt-1.5 bg-slate-950 rounded-xl border border-white/5 space-y-1">
                      <p className="text-white font-bold">Crea el grupo &quot;Fotógrafos Sunrise 3.0&quot;:</p>
                      <p className="text-slate-300">
                        - Activa la opción <strong>&quot;Public Link&quot; (Enlace Público)</strong>.
                      </p>
                      <p className="text-slate-300">
                        - Apple te dará un enlace corto (ejemplo: <code className="text-amber-300 font-mono">https://testflight.apple.com/join/xxxxxx</code>).
                      </p>
                    </div>
                  </li>
                  <li>
                    <strong>¿Qué hace la persona con el iPhone?</strong>
                    <ul className="list-disc list-inside pl-4 mt-1 space-y-1 text-slate-300">
                      <li>Descarga la app gratuita <strong>TestFlight</strong> desde la App Store en su iPhone.</li>
                      <li>Abre el enlace que le enviaste por WhatsApp o email.</li>
                      <li>Presiona <strong>&quot;Aceptar&quot;</strong> e <strong>&quot;Instalar&quot;</strong>.</li>
                      <li>¡Listo! La app se instalará en la pantalla de inicio de su iPhone con un punto naranja identificando la versión oficial de TestFlight.</li>
                    </ul>
                  </li>
                </ol>

                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-xs flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>
                    El archivo <code className="font-bold font-mono">Info.plist</code> ya incluye todos los textos legales requeridos por Apple (acceso a cámara y guardado en Fotos), por lo que pasará la revisión sin rechazos técnicos.
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Tab 2: Swift Code Inspector */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar */}
            <div className="w-full md:w-80 bg-slate-950/80 border-r border-white/10 p-4 overflow-y-auto space-y-4 shrink-0">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
                <span className="flex items-center gap-1.5">
                  <FolderTree size={14} className="text-orange-400" />
                  Módulos del Proyecto
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {SWIFT_PROJECT_FILES.length} archivos
                </span>
              </div>

              <div className="space-y-1">
                {SWIFT_PROJECT_FILES.map((file) => {
                  const isSelected = selectedFile.filename === file.filename;
                  return (
                    <button
                      key={file.filename}
                      onClick={() => setSelectedFile(file)}
                      className={`w-full text-left p-2.5 rounded-xl text-xs flex items-start gap-2.5 transition-all ${
                        isSelected
                          ? 'bg-orange-500/20 text-white border border-orange-500/40 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      {file.category === 'Documentation' ? (
                        <FileText size={16} className="text-blue-400 shrink-0 mt-0.5" />
                      ) : file.category === 'Config' ? (
                        <Layers size={16} className="text-amber-400 shrink-0 mt-0.5" />
                      ) : (
                        <FileCode size={16} className="text-orange-400 shrink-0 mt-0.5" />
                      )}

                      <div className="overflow-hidden">
                        <div className="font-mono font-bold truncate text-slate-200">
                          {file.filename}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {file.category} • {file.path}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Quick TestFlight Tip */}
              <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/20 text-[11px] text-blue-200 space-y-1.5">
                <div className="font-bold flex items-center gap-1 text-white">
                  <ExternalLink size={12} className="text-blue-400" />
                  TestFlight Ready
                </div>
                <p className="text-slate-300 text-[10px] leading-relaxed">
                  Incluye <code className="text-amber-300">Info.plist</code> con los permisos de cámara y fototeca requeridos por Apple para revisión sin rechazos.
                </p>
              </div>
            </div>

            {/* Main Code View */}
            <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
              {/* File Path & Copy Toolbar */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-slate-900/50">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-orange-300">
                    {selectedFile.path}
                  </span>
                  <span className="text-[11px] text-slate-400 hidden sm:inline">
                    — {selectedFile.description}
                  </span>
                </div>

                <button
                  id="btn_copy_swift_code"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-medium transition-colors"
                >
                  {copied ? (
                    <>
                      <Check size={14} className="text-emerald-400" />
                      <span className="text-emerald-400">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copiar Código</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code Content */}
              <div className="flex-1 p-5 overflow-auto bg-[#0d1117] text-slate-200 font-mono text-xs leading-relaxed">
                <pre className="whitespace-pre-wrap">{selectedFile.content}</pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
