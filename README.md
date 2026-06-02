<div align="center">
  <img src="public/logos/ClearCut-logo.avif" alt="ClearCut Studio Logo" width="250" />
  <h1>ClearCut Studio</h1>
  <p><strong>The privacy-first image editing suite. 100% local, 100% free.</strong></p>
</div>

<br />

## 🌟 What is ClearCut Studio?

ClearCut Studio is a modern web application designed to provide professional-grade image editing tools directly in your browser. Born from a manifesto of absolute privacy, **ClearCut guarantees that your files never leave your device**. 

By leveraging cutting-edge web technologies like **WebAssembly (WASM)** and in-browser AI inference, all processing happens locally on your machine. There are no cloud servers processing your photos, no sneaky data collection, and no forced subscriptions.

## 🚀 Features

### 1. Magic Background Remover
Remove the background of any image in seconds using artificial intelligence. 
- Powered by `@imgly/background-removal` running completely locally via Web Workers.
- High-quality edge detection and hair masking.

### 2. Pro Image Optimizer
Reduce your image file sizes by up to 90% without visible quality loss, perfect for web developers and content creators.
- Powered by WASM ports of the world's best image encoders (`libavif`, `libwebp`, `MozJPEG`) via `@jsquash`.
- Convert heavy PNGs and JPGs to modern, lightweight formats like **AVIF** and **WebP**.
- Real-time comparison slider to see the "Before" and "After" instantly.

### 3. Internationalization (i18n)
Fully supported in both **English** (Primary) and **Spanish** (Secondary), dynamically routing and switching languages without hard reloads.

### 4. Privacy by Default
0 Bytes uploaded. Period. Since everything runs locally, you can disconnect your internet after loading the page and the tools will continue to work flawlessly.

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Library:** React 19
- **Styling:** Tailwind CSS 4 & CSS Variables
- **Components:** Radix UI Primitives
- **Processing Engine:** WebAssembly (WASM) & Web Workers
- **Package Manager:** pnpm

## 💻 Running Locally

To get started with development, follow these steps:

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/clearcut-studio.git
   cd clearcut-studio
   ```

2. **Install dependencies**
   We use `pnpm` for fast, disk-space-efficient package management.
   ```bash
   pnpm install
   ```

3. **Start the development server**
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. The application will automatically redirect you to `/en` or `/es` based on your browser settings.

## 🗺️ Roadmap / Coming Soon

ClearCut Studio is continuously growing. Upcoming local tools include:
- **Magic Eraser:** Remove unwanted objects or people from your photos locally.
- **EXIF Stripper:** Remove sensitive tracking metadata (GPS, Camera info) from your photos in milliseconds.
- **Bulk HEIC Converter:** Drop folders of iPhone HEIC photos and convert them to JPG/PNG locally.
- **SVG Optimizer:** Clean up and compress vector graphics.

## ❤️ Support the Project

ClearCut Studio is free and always will be. However, maintaining the codebase, designing the UI, and hosting the static assets takes time and effort. If this tool saves you time or money on subscriptions, consider buying me a coffee to support future development!

<a href="https://www.buymeacoffee.com/fabianhermar" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me a Coffee" height="50" width="180" ></a>

## 📄 License

This project is open-source. Please refer to the LICENSE file for more information.
