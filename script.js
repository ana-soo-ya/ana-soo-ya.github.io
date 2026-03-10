class PixelArtStudioPro {
    constructor() {
        this.originalImage = null;
        this.originalCanvas = document.getElementById('originalCanvas');
        this.pixelCanvas = document.getElementById('pixelCanvas');
        this.originalCtx = this.originalCanvas.getContext('2d');
        this.pixelCtx = this.pixelCanvas.getContext('2d');
        this.history = [];
        this.currentHistoryIndex = -1;
        this.customPalette = [];
        
        this.initEventListeners();
        this.initPalettes();
        this.initFilters();
    }

    initPalettes() {
        this.palettes = {
            full: null,
            nes: [
                [0,0,0], [255,255,255], [124,124,124], [0,0,252],
                [0,0,188], [68,40,188], [148,0,132], [168,0,32],
                [168,16,0], [136,20,0], [80,48,0], [0,120,0],
                [0,104,0], [0,88,0], [0,64,88], [0,0,0],
                [188,188,188], [0,120,248], [0,88,248], [104,68,252],
                [216,0,204], [228,0,88], [248,56,0], [228,92,16],
                [172,124,0], [0,184,0], [0,168,0], [0,168,68],
                [0,136,136], [248,248,248], [60,188,252], [104,136,252],
                [152,120,248], [248,120,248], [248,88,152], [248,120,88],
                [252,160,68], [248,184,0], [184,248,24], [88,216,84],
                [88,248,152], [0,232,216], [120,120,120], [252,252,252],
                [164,228,252], [184,184,248], [216,184,248], [248,184,248],
                [248,164,192], [240,208,176], [252,224,168], [248,216,120],
                [216,248,120], [184,248,184], [184,248,216], [0,252,252],
                [216,216,216]
            ],
            gameboy: [
                [15,56,15], [48,98,48], [139,172,15], [155,188,15]
            ],
            cga: [
                [0,0,0], [0,0,170], [0,170,0], [0,170,170],
                [170,0,0], [170,0,170], [170,85,0], [170,170,170],
                [85,85,85], [85,85,255], [85,255,85], [85,255,255],
                [255,85,85], [255,85,255], [255,255,85], [255,255,255]
            ],
            mono: [
                [0,0,0], [255,255,255]
            ],
            sega: this.generatePalette(64),
            apple2: [
                [0,0,0], [114,38,64], [64,51,127], [48,48,48],
                [0,113,0], [0,104,167], [221,120,120], [255,255,255],
                [96,78,189], [71,169,120], [191,87,0], [119,119,119],
                [255,0,0], [0,255,0], [0,0,255], [255,255,0]
            ],
            commodore64: [
                [0,0,0], [255,255,255], [136,0,0], [170,255,238],
                [204,68,204], [0,204,85], [0,0,170], [238,238,119],
                [221,136,85], [102,68,0], [255,119,119], [51,51,51],
                [119,119,119], [170,255,102], [0,136,255], [187,187,187]
            ],
            zxs: [
                [0,0,0], [0,0,215], [0,215,0], [0,215,215],
                [215,0,0], [215,0,215], [215,215,0], [215,215,215],
                [0,0,0], [0,0,255], [0,255,0], [0,255,255],
                [255,0,0], [255,0,255], [255,255,0], [255,255,255]
            ]
        };
    }

    generatePalette(count) {
        const palette = [];
        for (let i = 0; i < count; i++) {
            const hue = (i / count) * 360;
            const rgb = this.hslToRgb(hue / 360, 0.5, 0.5);
            palette.push(rgb);
        }
        return palette;
    }

    hslToRgb(h, s, l) {
        let r, g, b;
        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    initFilters() {
        this.filters = {
            grayscale: (r, g, b) => {
                const gray = 0.299 * r + 0.587 * g + 0.114 * b;
                return [gray, gray, gray];
            },
            sepia: (r, g, b) => {
                return [
                    Math.min(255, 0.393 * r + 0.769 * g + 0.189 * b),
                    Math.min(255, 0.349 * r + 0.686 * g + 0.168 * b),
                    Math.min(255, 0.272 * r + 0.534 * g + 0.131 * b)
                ];
            },
            invert: (r, g, b) => [255 - r, 255 - g, 255 - b],
            posterize: (r, g, b, levels = 4) => {
                const step = 255 / (levels - 1);
                return [
                    Math.round(Math.round(r / step) * step),
                    Math.round(Math.round(g / step) * step),
                    Math.round(Math.round(b / step) * step)
                ];
            }
        };
    }

    initEventListeners() {
        // Upload area
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        
        uploadArea.addEventListener('click', () => fileInput.click());
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.background = '#e8f8f5';
        });
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.background = 'white';
        });
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.background = 'white';
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                this.loadImage(file);
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                this.loadImage(e.target.files[0]);
            }
        });

        // Controls
        document.getElementById('pixelSize').addEventListener('input', (e) => {
            document.getElementById('pixelSizeValue').textContent = e.target.value;
        });

        document.getElementById('palette').addEventListener('change', (e) => {
            const customSection = document.getElementById('customPaletteSection');
            customSection.style.display = e.target.value === 'custom' ? 'block' : 'none';
            if (e.target.value === 'custom') {
                this.updateCustomColorGrid();
            }
        });

        document.getElementById('colorCount').addEventListener('input', (e) => {
            document.getElementById('colorCountValue').textContent = e.target.value;
        });

        // Filter chips
        document.querySelectorAll('.filter-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                if (this.originalImage) {
                    this.processImage();
                }
            });
        });

        // Process button
        document.getElementById('processBtn').addEventListener('click', () => {
            this.processImage();
        });

        // Download button
        document.getElementById('downloadBtn').addEventListener('click', () => {
            document.getElementById('exportModal').classList.add('active');
        });

        // Reset button
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetToOriginal();
        });

        // Copy button
        document.getElementById('copyBtn').addEventListener('click', () => {
            this.copyToClipboard();
        });

        // Share button
        document.getElementById('shareBtn').addEventListener('click', () => {
            this.shareImage();
        });

        // Fullscreen button
        document.getElementById('fullscreenBtn').addEventListener('click', () => {
            this.toggleFullscreen();
        });

        // Presets
        document.getElementById('presets').addEventListener('change', (e) => {
            this.applyPreset(e.target.value);
        });

        // Custom color controls
        document.getElementById('addColorBtn').addEventListener('click', () => {
            const color = document.getElementById('newColor').value;
            const rgb = this.hexToRgb(color);
            this.customPalette.push(rgb);
            this.updateCustomColorGrid();
        });

        // Export modal
        document.getElementById('confirmExport').addEventListener('click', () => {
            this.exportImage();
            document.getElementById('exportModal').classList.remove('active');
        });

        document.getElementById('cancelExport').addEventListener('click', () => {
            document.getElementById('exportModal').classList.remove('active');
        });

        // Undo/Redo
        document.getElementById('undoBtn').addEventListener('click', () => {
            this.undo();
        });

        document.getElementById('clearHistoryBtn').addEventListener('click', () => {
            this.clearHistory();
        });

        // Batch processing
        document.getElementById('batchBtn').addEventListener('click', () => {
            this.batchProcess();
        });
    }

    loadImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.originalImage = img;
                
                // Set canvas size (max 800px)
                let width = img.width;
                let height = img.height;
                const maxSize = 800;
                
                if (width > maxSize || height > maxSize) {
                    if (width > height) {
                        height = (height / width) * maxSize;
                        width = maxSize;
                    } else {
                        width = (width / height) * maxSize;
                        height = maxSize;
                    }
                }
                
                this.originalCanvas.width = width;
                this.originalCanvas.height = height;
                this.pixelCanvas.width = width;
                this.pixelCanvas.height = height;
                
                this.originalCtx.drawImage(img, 0, 0, width, height);
                
                // Update image info
                this.updateImageInfo(file);
                
                // Enable buttons
                document.getElementById('processBtn').disabled = false;
                document.getElementById('resetBtn').disabled = false;
                
                // Process automatically
                this.processImage();
                
                // Add to history
                this.addToHistory();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    updateImageInfo(file) {
        document.getElementById('imgDimensions').textContent = 
            `${this.originalImage.width} x ${this.originalImage.height}`;
        document.getElementById('imgSize').textContent = 
            (file.size / 1024).toFixed(2) + ' KB';
        document.getElementById('imgFormat').textContent = 
            file.type.split('/')[1].toUpperCase();
        
        // Count colors (simplified)
        const imageData = this.originalCtx.getImageData(0, 0, 
            this.originalCanvas.width, this.originalCanvas.height);
        const colors = new Set();
        for (let i = 0; i < imageData.data.length; i += 4) {
            const key = `${imageData.data[i]},${imageData.data[i+1]},${imageData.data[i+2]}`;
            colors.add(key);
        }
        document.getElementById('imgColors').textContent = colors.size;
    }

    processImage() {
        if (!this.originalImage) return;

        // Show loading spinner
        document.getElementById('loadingSpinner').style.display = 'block';
        
        // Use setTimeout to allow UI to update
        setTimeout(() => {
            const pixelSize = parseInt(document.getElementById('pixelSize').value);
            const palette = document.getElementById('palette').value;
            const useDithering = document.getElementById('dithering').checked;
            const ditheringType = document.getElementById('ditheringType').value;
            const pixelShape = document.getElementById('pixelShape').value;
            const brightness = parseInt(document.getElementById('brightness').value);
            const contrast = parseInt(document.getElementById('contrast').value);
            const saturation = parseInt(document.getElementById('saturation').value);
            const hue = parseInt(document.getElementById('hue').value);
            
            // Get active filter
            const activeFilter = document.querySelector('.filter-chip.active')?.dataset.filter || 'none';
            
            // Create small canvas for pixelation
            const smallCanvas = document.createElement('canvas');
            const smallCtx = smallCanvas.getContext('2d');
            
            const pixelWidth = Math.max(1, Math.floor(this.originalCanvas.width / pixelSize));
            const pixelHeight = Math.max(1, Math.floor(this.originalCanvas.height / pixelSize));
            
            smallCanvas.width = pixelWidth;
            smallCanvas.height = pixelHeight;
            
            // Draw downscaled version
            smallCtx.drawImage(this.originalCanvas, 0, 0, pixelWidth, pixelHeight);
            
            // Get pixel data
            let imageData = smallCtx.getImageData(0, 0, pixelWidth, pixelHeight);
            let data = imageData.data;
            
            // Apply color adjustments
            this.applyColorAdjustments(data, {brightness, contrast, saturation, hue});
            
            // Apply filter
            if (activeFilter !== 'none' && this.filters[activeFilter]) {
                this.applyFilter(data, activeFilter);
            }
            
            // Apply palette and dithering
            if (palette !== 'full' && this.palettes[palette]) {
                const paletteColors = this.palettes[palette];
                
                if (useDithering) {
                    this.applyDithering(data, pixelWidth, pixelHeight, paletteColors, ditheringType);
                } else {
                    this.applyPalette(data, paletteColors);
                }
            }
            
            // Put processed data back
            smallCtx.putImageData(imageData, 0, 0);
            
            // Draw pixelated version with shape effects
            this.pixelCtx.clearRect(0, 0, this.pixelCanvas.width, this.pixelCanvas.height);
            
            if (pixelShape === 'square') {
                // Simple nearest neighbor scaling
                this.pixelCtx.imageSmoothingEnabled = false;
                this.pixelCtx.drawImage(smallCanvas, 0, 0, 
                    this.pixelCanvas.width, this.pixelCanvas.height);
            } else {
                // Draw custom shaped pixels
                this.drawShapedPixels(smallCanvas, pixelShape);
            }
            
            // Draw grid if enabled
            this.drawGrid();
            
            // Hide loading spinner
            document.getElementById('loadingSpinner').style.display = 'none';
            
            // Enable download button
            document.getElementById('downloadBtn').disabled = false;
            document.getElementById('copyBtn').disabled = false;
            document.getElementById('shareBtn').disabled = false;
            
            // Add to history
            this.addToHistory();
        }, 50);
    }

    applyColorAdjustments(data, adjustments) {
        for (let i = 0; i < data.length; i += 4) {
            // Brightness
            if (adjustments.brightness !== 0) {
                data[i] = Math.min(255, Math.max(0, data[i] + adjustments.brightness * 2.55));
                data[i+1] = Math.min(255, Math.max(0, data[i+1] + adjustments.brightness * 2.55));
                data[i+2] = Math.min(255, Math.max(0, data[i+2] + adjustments.brightness * 2.55));
            }
            
            // Contrast
            if (adjustments.contrast !== 0) {
                const factor = (259 * (adjustments.contrast + 255)) / (255 * (259 - adjustments.contrast));
                data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));
                data[i+1] = Math.min(255, Math.max(0, factor * (data[i+1] - 128) + 128));
                data[i+2] = Math.min(255, Math.max(0, factor * (data[i+2] - 128) + 128));
            }
            
            // Saturation
            if (adjustments.saturation !== 0) {
                const gray = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];
                const factor = 1 + adjustments.saturation / 100;
                data[i] = Math.min(255, Math.max(0, gray + factor * (data[i] - gray)));
                data[i+1] = Math.min(255, Math.max(0, gray + factor * (data[i+1] - gray)));
                data[i+2] = Math.min(255, Math.max(0, gray + factor * (data[i+2] - gray)));
            }
            
            // Hue rotation (simplified)
            if (adjustments.hue > 0) {
                const [r, g, b] = this.rotateHue(data[i], data[i+1], data[i+2], adjustments.hue);
                data[i] = r;
                data[i+1] = g;
                data[i+2] = b;
            }
        }
    }

    rotateHue(r, g, b, angle) {
        const rNorm = r / 255;
        const gNorm = g / 255;
        const bNorm = b / 255;
        
        const max = Math.max(rNorm, gNorm, bNorm);
        const min = Math.min(rNorm, gNorm, bNorm);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case rNorm: h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0); break;
                case gNorm: h = (bNorm - rNorm) / d + 2; break;
                case bNorm: h = (rNorm - gNorm) / d + 4; break;
            }
            h /= 6;
        }
        
        h = (h + angle / 360) % 1;
        
        let rgb;
        if (s === 0) {
            rgb = [l, l, l];
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            
            rgb = [
                hue2rgb(p, q, h + 1/3),
                hue2rgb(p, q, h),
                hue2rgb(p, q, h - 1/3)
            ];
        }
        
        return [
            Math.round(rgb[0] * 255),
            Math.round(rgb[1] * 255),
            Math.round(rgb[2] * 255)
        ];
    }

    applyFilter(data, filter) {
        for (let i = 0; i < data.length; i += 4) {
            const [r, g, b] = this.filters[filter](data[i], data[i+1], data[i+2]);
            data[i] = r;
            data[i+1] = g;
            data[i+2] = b;
        }
    }

    applyPalette(data, palette) {
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i+1];
            const b = data[i+2];
            
            let minDistance = Infinity;
            let bestColor = [r, g, b];
            
            for (const color of palette) {
                const distance = Math.pow(r - color[0], 2) + 
                               Math.pow(g - color[1], 2) + 
                               Math.pow(b - color[2], 2);
                if (distance < minDistance) {
                    minDistance = distance;
                    bestColor = color;
                }
            }
            
            data[i] = bestColor[0];
            data[i+1] = bestColor[1];
            data[i+2] = bestColor[2];
        }
    }

    applyDithering(data, width, height, palette, type) {
        switch(type) {
            case 'floyd':
                this.applyFloydSteinberg(data, width, height, palette);
                break;
            case 'bayer':
                this.applyBayerDithering(data, width, height, palette);
                break;
            case 'atkinson':
                this.applyAtkinsonDithering(data, width, height, palette);
                break;
            case 'burkes':
                this.applyBurkesDithering(data, width, height, palette);
                break;
            case 'stucki':
                this.applyStuckiDithering(data, width, height, palette);
                break;
            case 'sierra':
                this.applySierraDithering(data, width, height, palette);
                break;
            case 'jarvis':
                this.applyJarvisDithering(data, width, height, palette);
                break;
        }
    }

    applyFloydSteinberg(data, width, height, palette) {
        const error = new Array(data.length).fill(0);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const i = (y * width + x) * 4;
                
                const r = Math.min(255, Math.max(0, data[i] + error[i]));
                const g = Math.min(255, Math.max(0, data[i+1] + error[i+1]));
                const b = Math.min(255, Math.max(0, data[i+2] + error[i+2]));
                
                let minDistance = Infinity;
                let newR = r, newG = g, newB = b;
                
                for (const color of palette) {
                    const distance = Math.pow(r - color[0], 2) + 
                                   Math.pow(g - color[1], 2) + 
                                   Math.pow(b - color[2], 2);
                    if (distance < minDistance) {
                        minDistance = distance;
                        newR = color[0];
                        newG = color[1];
                        newB = color[2];
                    }
                }
                
                const errorR = r - newR;
                const errorG = g - newG;
                const errorB = b - newB;
                
                data[i] = newR;
                data[i+1] = newG;
                data[i+2] = newB;
                
                if (x + 1 < width) {
                    this.addError(error, i + 4, errorR, errorG, errorB, 7/16);
                }
                if (y + 1 < height) {
                    if (x > 0) {
                        this.addError(error, i + width * 4 - 4, errorR, errorG, errorB, 3/16);
                    }
                    this.addError(error, i + width * 4, errorR, errorG, errorB, 5/16);
                    if (x + 1 < width) {
                        this.addError(error, i + width * 4 + 4, errorR, errorG, errorB, 1/16);
                    }
                }
            }
        }
    }

    applyBayerDithering(data, width, height, palette) {
        const bayerMatrix = [
            [0, 8, 2, 10],
            [12, 4, 14, 6],
            [3, 11, 1, 9],
            [15, 7, 13, 5]
        ];
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const i = (y * width + x) * 4;
                const threshold = (bayerMatrix[y % 4][x % 4] / 16) * 255;
                
                const r = data[i];
                const g = data[i+1];
                const b = data[i+2];
                
                let distances = [];
                for (const color of palette) {
                    const distance = Math.pow(r - color[0], 2) + 
                                   Math.pow(g - color[1], 2) + 
                                   Math.pow(b - color[2], 2);
                    distances.push({color, distance});
                }
                distances.sort((a, b) => a.distance - b.distance);
                
                const color1 = distances[0].color;
                const color2 = distances[1]?.color || color1;
                
                const blend = (r + g + b) / 3;
                const color = blend < threshold ? color1 : color2;
                
                data[i] = color[0];
                data[i+1] = color[1];
                data[i+2] = color[2];
            }
        }
    }

    applyAtkinsonDithering(data, width, height, palette) {
        const error = new Array(data.length).fill(0);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const i = (y * width + x) * 4;
                
                const r = Math.min(255, Math.max(0, data[i] + error[i]));
                const g = Math.min(255, Math.max(0, data[i+1] + error[i+1]));
                const b = Math.min(255, Math.max(0, data[i+2] + error[i+2]));
                
                let minDistance = Infinity;
                let newR = r, newG = g, newB = b;
                
                for (const color of palette) {
                    const distance = Math.pow(r - color[0], 2) + 
                                   Math.pow(g - color[1], 2) + 
                                   Math.pow(b - color[2], 2);
                    if (distance < minDistance) {
                        minDistance = distance;
                        newR = color[0];
                        newG = color[1];
                        newB = color[2];
                    }
                }
                
                const errorR = (r - newR) / 8;
                const errorG = (g - newG) / 8;
                const errorB = (b - newB) / 8;
                
                data[i] = newR;
                data[i+1] = newG;
                data[i+2] = newB;
                
                const positions = [
                    [1, 0], [2, 0],
                    [-1, 1], [0, 1], [1, 1],
                    [0, 2]
                ];
                
                for (const [dx, dy] of positions) {
                    const nx = x + dx;
                    const ny = y + dy;
                    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                        const ni = (ny * width + nx) * 4;
                        error[ni] += errorR;
                        error[ni+1] += errorG;
                        error[ni+2] += errorB;
                    }
                }
            }
        }
    }

    applyBurkesDithering(data, width, height, palette) {
        const error = new Array(data.length).fill(0);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const i = (y * width + x) * 4;
                
                const r = Math.min(255, Math.max(0, data[i] + error[i]));
                const g = Math.min(255, Math.max(0, data[i+1] + error[i+1]));
                const b = Math.min(255, Math.max(0, data[i+2] + error[i+2]));
                
                let minDistance = Infinity;
                let newR = r, newG = g, newB = b;
                
                for (const color of palette) {
                    const distance = Math.pow(r - color[0], 2) + 
                                   Math.pow(g - color[1], 2) + 
                                   Math.pow(b - color[2], 2);
                    if (distance < minDistance) {
                        minDistance = distance;
                        newR = color[0];
                        newG = color[1];
                        newB = color[2];
                    }
                }
                
                const errorR = r - newR;
                const errorG = g - newG;
                const errorB = b - newB;
                
                data[i] = newR;
                data[i+1] = newG;
                data[i+2] = newB;
                
                if (x + 1 < width) this.addError(error, i + 4, errorR, errorG, errorB, 8/32);
                if (x + 2 < width) this.addError(error, i + 8, errorR, errorG, errorB, 4/32);
                if (y + 1 < height) {
                    if (x - 2 >= 0) this.addError(error, i + width * 4 - 8, errorR, errorG, errorB, 2/32);
                    if (x - 1 >= 0) this.addError(error, i + width * 4 - 4, errorR, errorG, errorB, 4/32);
                    this.addError(error, i + width * 4, errorR, errorG, errorB, 8/32);
                    if (x + 1 < width) this.addError(error, i + width * 4 + 4, errorR, errorG, errorB, 4/32);
                    if (x + 2 < width) this.addError(error, i + width * 4 + 8, errorR, errorG, errorB, 2/32);
                }
            }
        }
    }

    applyStuckiDithering(data, width, height, palette) {
        const error = new Array(data.length).fill(0);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const i = (y * width + x) * 4;
                
                const r = Math.min(255, Math.max(0, data[i] + error[i]));
                const g = Math.min(255, Math.max(0, data[i+1] + error[i+1]));
                const b = Math.min(255, Math.max(0, data[i+2] + error[i+2]));
                
                let minDistance = Infinity;
                let newR = r, newG = g, newB = b;
                
                for (const color of palette) {
                    const distance = Math.pow(r - color[0], 2) + 
                                   Math.pow(g - color[1], 2) + 
                                   Math.pow(b - color[2], 2);
                    if (distance < minDistance) {
                        minDistance = distance;
                        newR = color[0];
                        newG = color[1];
                        newB = color[2];
                    }
                }
                
                const errorR = r - newR;
                const errorG = g - newG;
                const errorB = b - newB;
                
                data[i] = newR;
                data[i+1] = newG;
                data[i+2] = newB;
                
                const positions = [
                    [1, 0, 8], [2, 0, 4],
                    [-2, 1, 2], [-1, 1, 4], [0, 1, 8], [1, 1, 4], [2, 1, 2],
                    [-2, 2, 1], [-1, 2, 2], [0, 2, 4], [1, 2, 2], [2, 2, 1]
                ];
                
                for (const [dx, dy, weight] of positions) {
                    const nx = x + dx;
                    const ny = y + dy;
                    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                        const ni = (ny * width + nx) * 4;
                        error[ni] += errorR * weight / 42;
                        error[ni+1] += errorG * weight / 42;
                        error[ni+2] += errorB * weight / 42;
                    }
                }
            }
        }
    }

    applySierraDithering(data, width, height, palette) {
        const error = new Array(data.length).fill(0);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const i = (y * width + x) * 4;
                
                const r = Math.min(255, Math.max(0, data[i] + error[i]));
                const g = Math.min(255, Math.max(0, data[i+1] + error[i+1]));
                const b = Math.min(255, Math.max(0, data[i+2] + error[i+2]));
                
                let minDistance = Infinity;
                let newR = r, newG = g, newB = b;
                
                for (const color of palette) {
                    const distance = Math.pow(r - color[0], 2) + 
                                   Math.pow(g - color[1], 2) + 
                                   Math.pow(b - color[2], 2);
                    if (distance < minDistance) {
                        minDistance = distance;
                        newR = color[0];
                        newG = color[1];
                        newB = color[2];
                    }
                }
                
                const errorR = r - newR;
                const errorG = g - newG;
                const errorB = b - newB;
                
                data[i] = newR;
                data[i+1] = newG;
                data[i+2] = newB;
                
                const positions = [
                    [1, 0, 5], [2, 0, 3],
                    [-2, 1, 2], [-1, 1, 4], [0, 1, 5], [1, 1, 4], [2, 1, 2],
                    [-1, 2, 2], [0, 2, 3], [1, 2, 2]
                ];
                
                for (const [dx, dy, weight] of positions) {
                    const nx = x + dx;
                    const ny = y + dy;
                    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                        const ni = (ny * width + nx) * 4;
                        error[ni] += errorR * weight / 32;
                        error[ni+1] += errorG * weight / 32;
                        error[ni+2] += errorB * weight / 32;
                    }
                }
            }
        }
    }

    applyJarvisDithering(data, width, height, palette) {
        const error = new Array(data.length).fill(0);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const i = (y * width + x) * 4;
                
                const r = Math.min(255, Math.max(0, data[i] + error[i]));
                const g = Math.min(255, Math.max(0, data[i+1] + error[i+1]));
                const b = Math.min(255, Math.max(0, data[i+2] + error[i+2]));
                
                let minDistance = Infinity;
                let newR = r, newG = g, newB = b;
                
                for (const color of palette) {
                    const distance = Math.pow(r - color[0], 2) + 
                                   Math.pow(g - color[1], 2) + 
                                   Math.pow(b - color[2], 2);
                    if (distance < minDistance) {
                        minDistance = distance;
                        newR = color[0];
                        newG = color[1];
                        newB = color[2];
                    }
                }
                
                const errorR = r - newR;
                const errorG = g - newG;
                const errorB = b - newB;
                
                data[i] = newR;
                data[i+1] = newG;
                data[i+2] = newB;
                
                const positions = [
                    [1, 0, 7], [2, 0, 5],
                    [-2, 1, 3], [-1, 1, 5], [0, 1, 7], [1, 1, 5], [2, 1, 3],
                    [-2, 2, 1], [-1, 2, 3], [0, 2, 5], [1, 2, 3], [2, 2, 1]
                ];
                
                for (const [dx, dy, weight] of positions) {
                    const nx = x + dx;
                    const ny = y + dy;
                    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                        const ni = (ny * width + nx) * 4;
                        error[ni] += errorR * weight / 48;
                        error[ni+1] += errorG * weight / 48;
                        error[ni+2] += errorB * weight / 48;
                    }
                }
            }
        }
    }

    addError(error, index, errorR, errorG, errorB, factor) {
        error[index] += errorR * factor;
        error[index + 1] += errorG * factor;
        error[index + 2] += errorB * factor;
    }

    drawShapedPixels(smallCanvas, shape) {
        const smallCtx = smallCanvas.getContext('2d');
        const smallData = smallCtx.getImageData(0, 0, smallCanvas.width, smallCanvas.height);
        
        const pixelWidth = this.pixelCanvas.width / smallCanvas.width;
        const pixelHeight = this.pixelCanvas.height / smallCanvas.height;
        
        this.pixelCtx.fillStyle = document.getElementById('transparentBg').checked ? 'transparent' : 'white';
        this.pixelCtx.fillRect(0, 0, this.pixelCanvas.width, this.pixelCanvas.height);
        
        for (let y = 0; y < smallCanvas.height; y++) {
            for (let x = 0; x < smallCanvas.width; x++) {
                const i = (y * smallCanvas.width + x) * 4;
                const r = smallData.data[i];
                const g = smallData.data[i+1];
                const b = smallData.data[i+2];
                const a = smallData.data[i+3];
                
                if (a > 0) {
                    this.pixelCtx.fillStyle = `rgb(${r},${g},${b})`;
                    
                    const px = x * pixelWidth;
                    const py = y * pixelHeight;
                    const size = Math.min(pixelWidth, pixelHeight) * 0.9;
                    const offset = (Math.max(pixelWidth, pixelHeight) - size) / 2;
                    
                    switch(shape) {
                        case 'circle':
                            this.pixelCtx.beginPath();
                            this.pixelCtx.arc(px + pixelWidth/2, py + pixelHeight/2, size/2, 0, Math.PI * 2);
                            this.pixelCtx.fill();
                            break;
                        case 'diamond':
                            this.pixelCtx.beginPath();
                            this.pixelCtx.moveTo(px + pixelWidth/2, py + offset);
                            this.pixelCtx.lineTo(px + pixelWidth - offset, py + pixelHeight/2);
                            this.pixelCtx.lineTo(px + pixelWidth/2, py + pixelHeight - offset);
                            this.pixelCtx.lineTo(px + offset, py + pixelHeight/2);
                            this.pixelCtx.closePath();
                            this.pixelCtx.fill();
                            break;
                        case 'hexagon':
                            this.drawHexagon(px + pixelWidth/2, py + pixelHeight/2, size/2);
                            break;
                        default:
                            this.pixelCtx.fillRect(px + offset, py + offset, size, size);
                    }
                }
            }
        }
    }

    drawHexagon(cx, cy, size) {
        this.pixelCtx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = i * Math.PI / 3;
            const x = cx + size * Math.cos(angle);
            const y = cy + size * Math.sin(angle);
            if (i === 0) {
                this.pixelCtx.moveTo(x, y);
            } else {
                this.pixelCtx.lineTo(x, y);
            }
        }
        this.pixelCtx.closePath();
        this.pixelCtx.fill();
    }

    drawGrid() {
        const thickness = parseFloat(document.getElementById('gridThickness').value);
        if (thickness === 0) return;
        
        const gridColor = document.getElementById('gridColor').value;
        const pixelSize = parseInt(document.getElementById('pixelSize').value);
        
        this.pixelCtx.strokeStyle = gridColor;
        this.pixelCtx.lineWidth = thickness;
        
        for (let x = 0; x <= this.pixelCanvas.width; x += pixelSize) {
            this.pixelCtx.beginPath();
            this.pixelCtx.moveTo(x, 0);
            this.pixelCtx.lineTo(x, this.pixelCanvas.height);
            this.pixelCtx.stroke();
        }
        
        for (let y = 0; y <= this.pixelCanvas.height; y += pixelSize) {
            this.pixelCtx.beginPath();
            this.pixelCtx.moveTo(0, y);
            this.pixelCtx.lineTo(this.pixelCanvas.width, y);
            this.pixelCtx.stroke();
        }
    }

    updateCustomColorGrid() {
        const grid = document.getElementById('customColorGrid');
        grid.innerHTML = '';
        
        this.customPalette.forEach((color, index) => {
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';
            swatch.style.backgroundColor = `rgb(${color[0]},${color[1]},${color[2]})`;
            swatch.innerHTML = `<span class="remove-color" data-index="${index}">×</span>`;
            
            swatch.querySelector('.remove-color').addEventListener('click', (e) => {
                e.stopPropagation();
                this.customPalette.splice(index, 1);
                this.updateCustomColorGrid();
            });
            
            grid.appendChild(swatch);
        });
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
        ] : [0, 0, 0];
    }

    addToHistory() {
        const imageData = this.pixelCtx.getImageData(0, 0, 
            this.pixelCanvas.width, this.pixelCanvas.height);
        
        if (this.currentHistoryIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.currentHistoryIndex + 1);
        }
        
        this.history.push(imageData);
        this.currentHistoryIndex++;
        
        this.updateHistoryPanel();
        document.getElementById('undoBtn').disabled = false;
        document.getElementById('clearHistoryBtn').disabled = false;
        document.getElementById('batchBtn').disabled = false;
    }

    undo() {
        if (this.currentHistoryIndex > 0) {
            this.currentHistoryIndex--;
            const imageData = this.history[this.currentHistoryIndex];
            this.pixelCtx.putImageData(imageData, 0, 0);
        }
        document.getElementById('undoBtn').disabled = this.currentHistoryIndex === 0;
        this.updateHistoryPanel();
    }

    clearHistory() {
        this.history = [];
        this.currentHistoryIndex = -1;
        document.getElementById('undoBtn').disabled = true;
        this.updateHistoryPanel();
    }

    updateHistoryPanel() {
        const panel = document.getElementById('historyPanel');
        panel.innerHTML = '';
        
        if (this.history.length === 0) {
            panel.innerHTML = '<div style="text-align: center; color: #999;">No history yet</div>';
            return;
        }
        
        const start = Math.max(0, this.history.length - 5);
        for (let i = start; i < this.history.length; i++) {
            const item = document.createElement('div');
            item.className = 'history-item';
            if (i === this.currentHistoryIndex) {
                item.style.background = '#e8f8f5';
            }
            
            item.innerHTML = `
                <canvas class="history-thumb" width="40" height="40"></canvas>
                <span>Version ${i + 1}</span>
            `;
            
            const thumb = item.querySelector('canvas');
            thumb.getContext('2d').putImageData(this.history[i], 0, 0, 0, 0, 40, 40);
            
            item.addEventListener('click', () => {
                this.currentHistoryIndex = i;
                this.pixelCtx.putImageData(this.history[i], 0, 0);
                this.updateHistoryPanel();
            });
            
            panel.appendChild(item);
        }
    }

    resetToOriginal() {
        if (this.originalImage) {
            this.originalCtx.drawImage(this.originalImage, 0, 0, 
                this.originalCanvas.width, this.originalCanvas.height);
            this.processImage();
        }
    }

    async copyToClipboard() {
        try {
            const blob = await new Promise(resolve => 
                this.pixelCanvas.toBlob(resolve, 'image/png'));
            await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
            ]);
            alert('Image copied to clipboard!');
        } catch (err) {
            alert('Failed to copy image');
        }
    }

    async shareImage() {
        if (navigator.share) {
            try {
                const blob = await new Promise(resolve => 
                    this.pixelCanvas.toBlob(resolve, 'image/png'));
                const file = new File([blob], 'pixel-art.png', { type: 'image/png' });
                await navigator.share({
                    title: 'Pixel Art',
                    text: 'Check out my pixel art!',
                    files: [file]
                });
            } catch (err) {
                alert('Sharing failed');
            }
        } else {
            alert('Web Share API not supported');
        }
    }

    toggleFullscreen() {
        const container = document.querySelector('.preview-area');
        if (!document.fullscreenElement) {
            container.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    applyPreset(preset) {
        const presets = {
            '8bit': () => {
                document.getElementById('pixelSize').value = 8;
                document.getElementById('palette').value = 'nes';
                document.getElementById('dithering').checked = true;
                document.getElementById('ditheringType').value = 'floyd';
                document.getElementById('pixelShape').value = 'square';
            },
            '16bit': () => {
                document.getElementById('pixelSize').value = 4;
                document.getElementById('palette').value = 'sega';
                document.getElementById('dithering').checked = true;
                document.getElementById('ditheringType').value = 'bayer';
            },
            'gameboy': () => {
                document.getElementById('pixelSize').value = 8;
                document.getElementById('palette').value = 'gameboy';
                document.getElementById('dithering').checked = true;
                document.getElementById('ditheringType').value = 'atkinson';
                document.getElementById('saturation').value = -100;
            },
            'nes': () => {
                document.getElementById('pixelSize').value = 8;
                document.getElementById('palette').value = 'nes';
                document.getElementById('dithering').checked = true;
                document.getElementById('ditheringType').value = 'floyd';
            },
            'crt': () => {
                document.getElementById('pixelSize').value = 4;
                document.getElementById('pixelShape').value = 'circle';
                document.getElementById('dithering').checked = true;
                document.getElementById('ditheringType').value = 'bayer';
            },
            'dotmatrix': () => {
                document.getElementById('pixelSize').value = 6;
                document.getElementById('pixelShape').value = 'circle';
                document.getElementById('gridThickness').value = 1;
                document.getElementById('dithering').checked = false;
            },
            'crossstitch': () => {
                document.getElementById('pixelSize').value = 10;
                document.getElementById('pixelShape').value = 'diamond';
                document.getElementById('gridThickness').value = 0.5;
                document.getElementById('palette').value = 'cga';
            },
            'minecraft': () => {
                document.getElementById('pixelSize').value = 16;
                document.getElementById('pixelShape').value = 'square';
                document.getElementById('gridThickness').value = 1;
                document.getElementById('gridColor').value = '#555555';
            }
        };
        
        if (preset && presets[preset]) {
            presets[preset]();
            this.processImage();
        }
    }

    exportImage() {
        const format = document.getElementById('exportFormat').value;
        const quality = document.getElementById('exportQuality').value / 100;
        const scale = parseInt(document.getElementById('exportScale').value);
        const transparent = document.getElementById('exportTransparent').checked;
        
        if (scale !== 1) {
            const scaledCanvas = document.createElement('canvas');
            scaledCanvas.width = this.pixelCanvas.width * scale;
            scaledCanvas.height = this.pixelCanvas.height * scale;
            const scaledCtx = scaledCanvas.getContext('2d');
            
            scaledCtx.imageSmoothingEnabled = false;
            scaledCtx.drawImage(this.pixelCanvas, 0, 0, scaledCanvas.width, scaledCanvas.height);
            
            if (!transparent) {
                const bgCanvas = document.createElement('canvas');
                bgCanvas.width = scaledCanvas.width;
                bgCanvas.height = scaledCanvas.height;
                const bgCtx = bgCanvas.getContext('2d');
                bgCtx.fillStyle = 'white';
                bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
                bgCtx.drawImage(scaledCanvas, 0, 0);
                scaledCtx.drawImage(bgCanvas, 0, 0);
            }
            
            const link = document.createElement('a');
            link.download = `pixel-art.${format}`;
            link.href = scaledCanvas.toDataURL(`image/${format}`, quality);
            link.click();
        } else {
            const link = document.createElement('a');
            link.download = `pixel-art.${format}`;
            link.href = this.pixelCanvas.toDataURL(`image/${format}`, quality);
            link.click();
        }
    }

    batchProcess() {
        const batchSize = parseInt(document.getElementById('batchSize').value);
        alert(`Processing ${batchSize} images... (Demo feature)`);
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new PixelArtStudioPro();
});