import { SwiftFileItem } from '../types/camera';

export const SWIFT_PROJECT_FILES: SwiftFileItem[] = [
  {
    filename: 'SunriseCameraApp.swift',
    path: 'SunriseCamera/SunriseCameraApp.swift',
    category: 'App',
    description: 'Punto de entrada principal de la aplicación en SwiftUI. Inicializa servicios y bloqueo de orientación.',
    content: `import SwiftUI
import AVFoundation

@main
struct SunriseCameraApp: App {
    @StateObject private var cameraVM = CameraViewModel()
    @StateObject private var eventManager = EventModeManager.shared
    
    init() {
        // Optimización de inicio rápido para evento corporativo
        try? AVAudioSession.sharedInstance().setCategory(.ambient, mode: .default)
        try? AVAudioSession.sharedInstance().setActive(true)
    }
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(cameraVM)
                .environmentObject(eventManager)
                .preferredColorScheme(.dark)
                .statusBar(hidden: true)
        }
    }
}`
  },
  {
    filename: 'ContentView.swift',
    path: 'SunriseCamera/Views/ContentView.swift',
    category: 'Views',
    description: 'Vista raíz con selector de formato inicial (Vertical / Horizontal) y transición a la cámara activa.',
    content: `import SwiftUI

struct ContentView: View {
    @EnvironmentObject var cameraVM: CameraViewModel
    @EnvironmentObject var eventManager: EventModeManager
    
    @State private var selectedFormat: CameraFormat? = nil
    @State private var showSettings = false
    @State private var showSwiftCodeHub = false
    
    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            
            if let format = selectedFormat {
                CameraMainView(format: format, onExitToFormatPicker: {
                    selectedFormat = nil
                })
            } else {
                FormatSelectionView(onSelectFormat: { format in
                    withAnimation(.easeInOut(duration: 0.3)) {
                        self.selectedFormat = format
                    }
                })
            }
        }
        .onAppear {
            if eventManager.quickLaunchFormat != nil {
                selectedFormat = eventManager.quickLaunchFormat
            }
        }
    }
}`
  },
  {
    filename: 'FormatSelectionView.swift',
    path: 'SunriseCamera/Views/FormatSelectionView.swift',
    category: 'Views',
    description: 'Pantalla inicial exigida por el requerimiento: SUNRISE CAMERA 3.0 con selección de formato Vertical u Horizontal.',
    content: `import SwiftUI

enum CameraFormat: String, CaseIterable, Identifiable {
    case vertical = "Vertical"
    case horizontal = "Horizontal"
    
    var id: String { self.rawValue }
    var frameFileName: String {
        switch self {
        case .vertical: return "Marco Vertical"
        case .horizontal: return "Marco Horizontal"
        }
    }
}

struct FormatSelectionView: View {
    var onSelectFormat: (CameraFormat) -> Void
    @EnvironmentObject var eventManager: EventModeManager
    
    var body: some View {
        VStack(spacing: 32) {
            Spacer()
            
            // Logotipo y Cabecera Oficial
            VStack(spacing: 12) {
                Text("SUNRISE")
                    .font(.system(size: 48, weight: .black, design: .rounded))
                    .foregroundColor(.orange)
                    + Text(" 3.0")
                    .font(.system(size: 32, weight: .bold, design: .rounded))
                    .foregroundColor(.white)
                
                Text("CAMERA CORPORATIVA")
                    .font(.system(size: 14, weight: .bold, design: .monospaced))
                    .foregroundColor(.gray)
                    .tracking(4)
                
                Text("#GUARDIANES DEL MAR")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(Color.blue.opacity(0.9))
                    .padding(.horizontal, 14)
                    .padding(.vertical, 6)
                    .background(Capsule().fill(Color.white.opacity(0.12)))
            }
            
            Spacer()
            
            VStack(spacing: 18) {
                Text("Selecciona formato:")
                    .font(.system(size: 18, weight: .medium))
                    .foregroundColor(.white.opacity(0.8))
                
                // Botón Vertical
                Button(action: { onSelectFormat(.vertical) }) {
                    HStack(spacing: 16) {
                        Image(systemName: "iphone")
                            .font(.system(size: 24))
                        Text("[ VERTICAL ]")
                            .font(.system(size: 20, weight: .heavy, design: .monospaced))
                    }
                    .frame(maxWidth: .infinity)
                    .frame(height: 64)
                    .background(
                        LinearGradient(colors: [Color.orange, Color.orange.opacity(0.85)],
                                       startPoint: .leading, endPoint: .trailing)
                    )
                    .foregroundColor(.white)
                    .cornerRadius(16)
                    .shadow(color: Color.orange.opacity(0.4), radius: 10, y: 5)
                }
                
                // Botón Horizontal
                Button(action: { onSelectFormat(.horizontal) }) {
                    HStack(spacing: 16) {
                        Image(systemName: "iphone.landscape")
                            .font(.system(size: 24))
                        Text("[ HORIZONTAL ]")
                            .font(.system(size: 20, weight: .heavy, design: .monospaced))
                    }
                    .frame(maxWidth: .infinity)
                    .frame(height: 64)
                    .background(
                        LinearGradient(colors: [Color.blue.opacity(0.9), Color.blue],
                                       startPoint: .leading, endPoint: .trailing)
                    )
                    .foregroundColor(.white)
                    .cornerRadius(16)
                    .shadow(color: Color.blue.opacity(0.4), radius: 10, y: 5)
                }
            }
            .padding(.horizontal, 32)
            
            Spacer()
            
            // Estadísticas del evento
            HStack(spacing: 8) {
                Circle().fill(Color.green).frame(width: 8, height: 8)
                Text("Fotos tomadas hoy: \\(eventManager.photoCounter)")
                    .font(.caption)
                    .foregroundColor(.gray)
            }
            .padding(.bottom, 20)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(
            LinearGradient(
                colors: [Color(red: 0.05, green: 0.08, blue: 0.15), Color.black],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()
        )
    }
}`
  },
  {
    filename: 'CameraViewModel.swift',
    path: 'SunriseCamera/ViewModels/CameraViewModel.swift',
    category: 'ViewModels',
    description: 'Gestor de AVFoundation: sesión de captura, lentes (0.5x, 1x, 2x, 3x), flash, exposición y Core Image.',
    content: `import Foundation
import AVFoundation
import UIKit
import CoreImage
import Photos

final class CameraViewModel: NSObject, ObservableObject {
    @Published var isSessionRunning = false
    @Published var currentLens: String = "1x"
    @Published var availableLenses: [String] = ["0.5x", "1x", "2x", "3x"]
    @Published var isFlashOn = false
    @Published var exposureEV: Float = 0.0
    @Published var isFocusLocked = false
    @Published var selectedFilter: CameraFilter = .original
    @Published var capturedImage: UIImage? = nil
    @Published var isCapturing = false
    @Published var countdownRemaining: Int = 0
    
    let captureSession = AVCaptureSession()
    private var photoOutput = AVCapturePhotoOutput()
    private var activeDevice: AVCaptureDevice?
    private var backCameraDevice: AVCaptureDevice?
    private var frontCameraDevice: AVCaptureDevice?
    private var isUsingFrontCamera = false
    
    override init() {
        super.init()
        checkPermissions()
    }
    
    func checkPermissions() {
        switch AVCaptureDevice.authorizationStatus(for: .video) {
        case .authorized:
            setupSession()
        case .notDetermined:
            AVCaptureDevice.requestAccess(for: .video) { [weak self] granted in
                if granted {
                    DispatchQueue.main.async { self?.setupSession() }
                }
            }
        default:
            break
        }
    }
    
    func setupSession() {
        captureSession.beginConfiguration()
        captureSession.sessionPreset = .photo // Máxima resolución fotográfica nativa
        
        // Descubrir cámara trasera (Ultra gran angular, Gran angular, Teleobjetivo)
        let discovery = AVCaptureDevice.DiscoverySession(
            deviceTypes: [.builtInTripleCamera, .builtInDualWideCamera, .builtInDualCamera, .builtInWideAngleCamera],
            mediaType: .video,
            position: .back
        )
        backCameraDevice = discovery.devices.first
        
        // Cámara frontal
        let frontDiscovery = AVCaptureDevice.DiscoverySession(
            deviceTypes: [.builtInTrueDepthCamera, .builtInWideAngleCamera],
            mediaType: .video,
            position: .front
        )
        frontCameraDevice = frontDiscovery.devices.first
        
        activeDevice = backCameraDevice
        guard let device = activeDevice,
              let input = try? AVCaptureDeviceInput(device: device),
              captureSession.canAddInput(input),
              captureSession.canAddOutput(photoOutput) else {
            captureSession.commitConfiguration()
            return
        }
        
        captureSession.addInput(input)
        captureSession.addOutput(photoOutput)
        photoOutput.isHighResolutionCaptureEnabled = true
        photoOutput.maxPhotoQualityPrioritization = .quality
        
        captureSession.commitConfiguration()
        
        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            self?.captureSession.startRunning()
            DispatchQueue.main.async {
                self?.isSessionRunning = self?.captureSession.isRunning ?? false
            }
        }
    }
    
    // Conmutar Lentes (0.5x, 1x, 2x, 3x)
    func setZoom(factor: CGFloat, lensLabel: String) {
        guard let device = activeDevice else { return }
        do {
            try device.lockForConfiguration()
            device.videoZoomFactor = max(1.0, min(factor, device.activeFormat.videoMaxZoomFactor))
            device.unlockForConfiguration()
            self.currentLens = lensLabel
        } catch {
            print("Error configurando zoom: \\(error)")
        }
    }
    
    // Conmutar Cámara Frontal / Trasera
    func toggleCamera() {
        captureSession.beginConfiguration()
        if let currentInput = captureSession.inputs.first as? AVCaptureDeviceInput {
            captureSession.removeInput(currentInput)
        }
        
        isUsingFrontCamera.toggle()
        activeDevice = isUsingFrontCamera ? frontCameraDevice : backCameraDevice
        
        if let device = activeDevice,
           let newInput = try? AVCaptureDeviceInput(device: device),
           captureSession.canAddInput(newInput) {
            captureSession.addInput(newInput)
        }
        captureSession.commitConfiguration()
    }
    
    // Ajuste de Exposición (EV)
    func setExposure(ev: Float) {
        guard let device = activeDevice else { return }
        do {
            try device.lockForConfiguration()
            let minEV = device.minExposureTargetBias
            let maxEV = device.maxExposureTargetBias
            let clamped = max(minEV, min(ev, maxEV))
            device.setExposureTargetBias(clamped) { _ in }
            device.unlockForConfiguration()
            self.exposureEV = clamped
        } catch {
            print("Error configurando exposición: \\(error)")
        }
    }
    
    // Captura con temporizador opcional
    func triggerShutter(seconds: Int = 0, completion: @escaping () -> Void) {
        if seconds > 0 {
            countdownRemaining = seconds
            Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] timer in
                guard let self = self else { timer.invalidate(); return }
                self.countdownRemaining -= 1
                if self.countdownRemaining <= 0 {
                    timer.invalidate()
                    self.executeCapture(completion: completion)
                }
            }
        } else {
            executeCapture(completion: completion)
        }
    }
    
    private func executeCapture(completion: @escaping () -> Void) {
        isCapturing = true
        var settings = AVCapturePhotoSettings(format: [AVVideoCodecKey: AVVideoCodecType.jpeg])
        settings.photoQualityPrioritization = .quality
        if isFlashOn && activeDevice?.hasFlash == true {
            settings.flashMode = .on
        } else {
            settings.flashMode = .off
        }
        
        photoOutput.capturePhoto(with: settings, delegate: self)
        completion()
    }
}

extension CameraViewModel: AVCapturePhotoCaptureDelegate {
    func photoOutput(_ output: AVCapturePhotoOutput, didFinishProcessingPhoto photo: AVCapturePhoto, error: Error?) {
        defer { DispatchQueue.main.async { self.isCapturing = false } }
        guard let data = photo.fileDataRepresentation(),
              let originalImage = UIImage(data: data) else { return }
        
        DispatchQueue.main.async {
            self.capturedImage = originalImage
        }
    }
}`
  },
  {
    filename: 'CIFilterEngine.swift',
    path: 'SunriseCamera/Processing/CIFilterEngine.swift',
    category: 'Processing',
    description: 'Motor de filtros Core Image en tiempo real (Original, Vivo, Cálido, Frío, B&W, Contraste alto).',
    content: `import Foundation
import CoreImage
import CoreImage.CIFilterBuiltins
import UIKit

enum CameraFilter: String, CaseIterable, Identifiable {
    case original = "Original"
    case vivo = "Vivo"
    case calido = "Cálido"
    case frio = "Frío"
    case blancoYNegro = "B & N"
    case altoContraste = "Alto Contraste"
    
    var id: String { self.rawValue }
}

final class CIFilterEngine {
    static let shared = CIFilterEngine()
    private let context = CIContext(options: [.useSoftwareRenderer: false])
    
    func apply(filter: CameraFilter, to inputImage: CIImage) -> CIImage {
        switch filter {
        case .original:
            return inputImage
            
        case .vivo:
            // Saturación vívida y contraste suave
            let filter = CIFilter.colorControls()
            filter.inputImage = inputImage
            filter.saturation = 1.35
            filter.contrast = 1.08
            filter.brightness = 0.02
            return filter.outputImage ?? inputImage
            
        case .calido:
            // Temperatura de color cálida de puesta de sol
            let filter = CIFilter.temperatureAndTint()
            filter.inputImage = inputImage
            filter.neutral = CIVector(x: 6500, y: 0)
            filter.targetNeutral = CIVector(x: 5200, y: 0) // Shift a cálido
            return filter.outputImage ?? inputImage
            
        case .frio:
            // Tonos oceánicos fríos
            let filter = CIFilter.temperatureAndTint()
            filter.inputImage = inputImage
            filter.neutral = CIVector(x: 6500, y: 0)
            filter.targetNeutral = CIVector(x: 7800, y: 0) // Shift a frío
            return filter.outputImage ?? inputImage
            
        case .blancoYNegro:
            // Monocromático de alta fidelidad
            let mono = CIFilter.photoEffectMono()
            mono.inputImage = inputImage
            let contrast = CIFilter.colorControls()
            contrast.inputImage = mono.outputImage
            contrast.contrast = 1.2
            return contrast.outputImage ?? inputImage
            
        case .altoContraste:
            // Contraste marcado de impacto
            let filter = CIFilter.colorControls()
            filter.inputImage = inputImage
            filter.contrast = 1.40
            filter.saturation = 1.20
            return filter.outputImage ?? inputImage
        }
    }
    
    func renderToUIImage(ciImage: CIImage, orientation: UIImage.Orientation) -> UIImage? {
        guard let cgImage = context.createCGImage(ciImage, from: ciImage.extent) else { return nil }
        return UIImage(cgImage: cgImage, scale: 1.0, orientation: orientation)
    }
}`
  },
  {
    filename: 'PhotoComposer.swift',
    path: 'SunriseCamera/Processing/PhotoComposer.swift',
    category: 'Processing',
    description: 'Composición final en máxima resolución: Foto + Filtro Core Image + Marco PNG transparente -> Guardar en Fotos como SUNRISE_XXX.jpg.',
    content: `import Foundation
import UIKit
import CoreImage
import Photos

final class PhotoComposer {
    static let shared = PhotoComposer()
    
    func composeAndExport(
        rawImage: UIImage,
        filter: CameraFilter,
        format: CameraFormat,
        completion: @escaping (Result<String, Error>) -> Void
    ) {
        DispatchQueue.global(qos: .userInitiated).async {
            guard let ciInput = CIImage(image: rawImage) else {
                DispatchQueue.main.async {
                    completion(.failure(NSError(domain: "SunriseCamera", code: -1, userInfo: [NSLocalizedDescriptionKey: "Imagen inválida"])))
                }
                return
            }
            
            // 1. Aplicar Filtro Core Image
            let filteredCI = CIFilterEngine.shared.apply(filter: filter, to: ciInput)
            guard let processedUIImage = CIFilterEngine.shared.renderToUIImage(ciImage: filteredCI, orientation: rawImage.imageOrientation) else {
                return
            }
            
            // 2. Cargar Marco PNG según formato (Marco Vertical.png / Marco Horizontal.png)
            let frameName = format.frameFileName
            guard let frameImage = FrameFileManager.shared.loadFrame(named: frameName) else {
                return
            }
            
            // 3. Resolución nativa: 1080x1920 (Vertical) o 1920x1080 (Horizontal)
            let targetSize = format == .vertical ? CGSize(width: 1080, height: 1920) : CGSize(width: 1920, height: 1080)
            
            UIGraphicsBeginImageContextWithOptions(targetSize, false, 1.0)
            
            // Recorte inteligente preservando rostro
            let cropRect = self.calculateSmartCrop(sourceSize: processedUIImage.size, targetSize: targetSize)
            processedUIImage.draw(in: cropRect)
            
            // Superponer marco transparente PNG
            frameImage.draw(in: CGRect(origin: .zero, size: targetSize))
            
            guard let finalImage = UIGraphicsGetImageFromCurrentImageContext() else {
                UIGraphicsEndImageContext()
                return
            }
            UIGraphicsEndImageContext()
            
            // 4. Nombre de archivo secuencial: SUNRISE_001.jpg
            let nextIndex = EventModeManager.shared.incrementCounter()
            let filename = String(format: "SUNRISE_%03d.jpg", nextIndex)
            
            // 5. Guardar en Fotos del iPhone sin compresión destructiva
            self.saveToPhotosLibrary(image: finalImage, filename: filename) { success in
                DispatchQueue.main.async {
                    if success {
                        completion(.success(filename))
                    } else {
                        completion(.failure(NSError(domain: "SunriseCamera", code: -2, userInfo: [NSLocalizedDescriptionKey: "Fallo al guardar en Fotos"])))
                    }
                }
            }
        }
    }
    
    private func calculateSmartCrop(sourceSize: CGSize, targetSize: CGSize) -> CGRect {
        let widthRatio = targetSize.width / sourceSize.width
        let heightRatio = targetSize.height / sourceSize.height
        let scale = max(widthRatio, heightRatio)
        
        let newWidth = sourceSize.width * scale
        let newHeight = sourceSize.height * scale
        
        // Centrado horizontal, y sesgo superior (30%) vertical para no cortar caras
        let originX = (targetSize.width - newWidth) / 2.0
        let originY = (targetSize.height - newHeight) * 0.30
        
        return CGRect(x: originX, y: originY, width: newWidth, height: newHeight)
    }
    
    private func saveToPhotosLibrary(image: UIImage, filename: String, completion: @escaping (Bool) -> Void) {
        PHPhotoLibrary.requestAuthorization(for: .addOnly) { status in
            guard status == .authorized || status == .limited else {
                completion(false)
                return
            }
            
            PHPhotoLibrary.shared().performChanges({
                let request = PHAssetChangeRequest.creationRequestForAsset(from: image)
                request.creationDate = Date()
            }) { success, error in
                completion(success)
            }
        }
    }
}`
  },
  {
    filename: 'FrameFileManager.swift',
    path: 'SunriseCamera/Services/FrameFileManager.swift',
    category: 'Services',
    description: 'Gestor dinámico de marcos: permite reemplazar "Marco Vertical.png" y "Marco Horizontal.png" sin tocar código.',
    content: `import Foundation
import UIKit

final class FrameFileManager {
    static let shared = FrameFileManager()
    
    private var documentsFramesURL: URL {
        FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0].appendingPathComponent("Frames")
    }
    
    init() {
        try? FileManager.default.createDirectory(at: documentsFramesURL, withIntermediateDirectories: true)
    }
    
    func loadFrame(named name: String) -> UIImage? {
        // 1. Intentar cargar archivo personalizado subido a Documents/Frames/
        let customURL = documentsFramesURL.appendingPathComponent("\\(name).png")
        if let customImage = UIImage(contentsOfFile: customURL.path) {
            return customImage
        }
        // 2. Si no existe, cargar desde el Asset Catalog por defecto
        return UIImage(named: name)
    }
    
    func saveCustomFrame(image: UIImage, named name: String) -> Bool {
        guard let data = image.pngData() else { return false }
        let destination = documentsFramesURL.appendingPathComponent("\\(name).png")
        do {
            try data.write(to: destination)
            return true
        } catch {
            print("Error guardando marco personalizado: \\(error)")
            return false
        }
    }
    
    func resetToDefault(named name: String) {
        let customURL = documentsFramesURL.appendingPathComponent("\\(name).png")
        try? FileManager.default.removeItem(at: customURL)
    }
}`
  },
  {
    filename: 'EventModeManager.swift',
    path: 'SunriseCamera/Services/EventModeManager.swift',
    category: 'Services',
    description: 'Modo Evento: contador secuencial, prefijo de archivos, bloqueo PIN para anfitriones del evento.',
    content: `import Foundation
import SwiftUI

final class EventModeManager: ObservableObject {
    static let shared = EventModeManager()
    
    @AppStorage("sunrise_photo_counter") var photoCounter: Int = 1
    @AppStorage("sunrise_file_prefix") var filePrefix: String = "SUNRISE_"
    @AppStorage("sunrise_admin_pin") var adminPin: String = ""
    @AppStorage("sunrise_kiosk_locked") var isKioskLocked: Bool = false
    @AppStorage("sunrise_quick_format") var quickLaunchFormatRaw: String = ""
    
    var quickLaunchFormat: CameraFormat? {
        get { CameraFormat(rawValue: quickLaunchFormatRaw) }
        set { quickLaunchFormatRaw = newValue?.rawValue ?? "" }
    }
    
    func incrementCounter() -> Int {
        let current = photoCounter
        photoCounter += 1
        return current
    }
    
    func resetCounter() {
        photoCounter = 1
    }
}`
  },
  {
    filename: 'Info.plist',
    path: 'SunriseCamera/Info.plist',
    category: 'Config',
    description: 'Permisos de privacidad requeridos por Apple para TestFlight y la App Store.',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDisplayName</key>
    <string>Sunrise Camera</string>
    <key>CFBundleIdentifier</key>
    <string>com.sunrise.camera</string>
    <key>CFBundleShortVersionString</key>
    <string>3.0.0</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>NSCameraUsageDescription</key>
    <string>Sunrise Camera necesita acceso a la cámara para tomar fotografías del evento con marcos y filtros en tiempo real.</string>
    <key>NSPhotoLibraryAddUsageDescription</key>
    <string>Sunrise Camera guarda automáticamente las fotografías del evento Sunrise 3.0 en tu fototeca con alta calidad.</string>
    <key>UIRequiresFullScreen</key>
    <true/>
    <key>UIStatusBarHidden</key>
    <true/>
    <key>UISupportedInterfaceOrientations</key>
    <array>
        <string>UIInterfaceOrientationPortrait</string>
        <string>UIInterfaceOrientationLandscapeLeft</string>
        <string>UIInterfaceOrientationLandscapeRight</string>
    </array>
</dict>
</plist>`
  },
  {
    filename: 'TESTFLIGHT_INSTRUCTIONS.md',
    path: 'README_TESTFLIGHT.md',
    category: 'Documentation',
    description: 'Guía paso a paso para compilar en Xcode, subir a TestFlight y distribuir a los fotógrafos del evento.',
    content: `# Sunrise Camera 3.0 - Guía de Compilación e Instalación TestFlight

## 1. Requisitos
- Mac con macOS Sonoma o posterior.
- Xcode 15 o 16.
- Cuenta de Apple Developer (Individual u Organización).

## 2. Abrir el proyecto en Xcode
1. Abre Xcode y selecciona "Create New Xcode Project" -> "iOS" -> "App".
2. Nombre del producto: **SunriseCamera**.
3. Organization Identifier: **com.tuempresa**.
4. Interface: **SwiftUI**, Language: **Swift**.
5. Copia los archivos del módulo en la estructura mostrada:
   - \`SunriseCameraApp.swift\`
   - Carpeta \`Views/\` (\`ContentView.swift\`, \`FormatSelectionView.swift\`, etc.)
   - Carpeta \`ViewModels/\` (\`CameraViewModel.swift\`)
   - Carpeta \`Processing/\` (\`CIFilterEngine.swift\`, \`PhotoComposer.swift\`)
   - Carpeta \`Services/\` (\`FrameFileManager.swift\`, \`EventModeManager.swift\`)

## 3. Configurar los Marcos PNG en Assets.xcassets
1. En Xcode, abre \`Assets.xcassets\`.
2. Haz clic derecho -> **New Image Set**.
3. Crea un Image Set llamado exactamente **Marco Vertical** y arrastra \`Marco Vertical.png\`.
4. Crea otro Image Set llamado exactamente **Marco Horizontal** y arrastra \`Marco Horizontal.png\`.
5. En Attributes Inspector, asegúrate de que esté configurado como **Universal** y **Preserve Vector Data** o PNG transparente.

## 4. Reemplazo de Marcos sin modificar código (En Ejecución)
El módulo \`FrameFileManager.swift\` permite reemplazar los marcos sin necesidad de volver a compilar:
- Desde la sección de Configuración dentro de la app (protegida por el PIN configurado por el administrador).
- O colocando los archivos \`Marco Vertical.png\` y \`Marco Horizontal.png\` directamente en la carpeta Compartida de la app mediante Finder / Files de iOS.

## 5. Distribución mediante TestFlight
1. En Xcode, selecciona el destino **Any iOS Device (arm64)**.
2. Ve al menú superior: **Product > Archive**.
3. Cuando termine el compilador, se abrirá la ventana **Organizer**.
4. Haz clic en **Distribute App** -> **TestFlight & App Store**.
5. Selecciona la opción automática de firma (*Automatically manage signing*).
6. Una vez subido a App Store Connect:
   - Entra a [appstoreconnect.apple.com](https://appstoreconnect.apple.com).
   - Ve a **Apps > Sunrise Camera > TestFlight**.
   - En **Grupos de Pruebas Internas**, añade los correos de tu equipo.
   - En **Pruebas Externas**, genera un enlace público para los fotógrafos del evento.
   - Los participantes instalarán la app con un solo toque desde la app TestFlight de su iPhone.`
  }
];
