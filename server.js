const { serveHTTP } = require('stremio-addon-sdk');
const addonInterface = require('./addon');
const manifest = require('./manifest');

const landingPage = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${manifest.name} - Stremio Addon</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #ff3d00;
            --accent: #7c4dff;
            --bg: #08080c;
            --glass: rgba(255, 255, 255, 0.03);
            --glass-border: rgba(255, 255, 255, 0.1);
            --text: #ffffff;
            --glow: rgba(124, 77, 255, 0.3);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Outfit', sans-serif;
        }

        body {
            background-color: var(--bg);
            color: var(--text);
            overflow-x: hidden;
            background-image: 
                radial-gradient(circle at 10% 20%, rgba(124, 77, 255, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 90% 80%, rgba(255, 61, 0, 0.1) 0%, transparent 50%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .container {
            max-width: 900px;
            width: 100%;
            padding: 60px 40px;
            text-align: center;
            background: var(--glass);
            backdrop-filter: blur(30px);
            -webkit-backdrop-filter: blur(30px);
            border: 1px solid var(--glass-border);
            border-radius: 50px;
            box-shadow: 0 40px 100px rgba(0, 0, 0, 0.6);
            animation: containerAppear 1.2s cubic-bezier(0.16, 1, 0.3, 1);
            position: relative;
        }

        @keyframes containerAppear {
            from { opacity: 0; transform: scale(0.9) translateY(40px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .logo-wrapper {
            position: relative;
            width: 200px;
            height: 200px;
            margin: 0 auto 40px;
        }

        .logo {
            width: 100%;
            height: 100%;
            border-radius: 40px;
            object-fit: cover;
            border: 2px solid var(--glass-border);
            box-shadow: 0 20px 40px rgba(0,0,0,0.4);
            animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-15px) rotate(2deg); }
        }

        .logo-glow {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 120%;
            height: 120%;
            background: radial-gradient(circle, var(--glow) 0%, transparent 70%);
            z-index: -1;
            filter: blur(30px);
        }

        h1 {
            font-size: 4.5rem;
            font-weight: 800;
            margin-bottom: 15px;
            background: linear-gradient(to right, #fff 20%, var(--accent) 50%, #fff 80%);
            background-size: 200% auto;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: shine 4s linear infinite;
        }

        @keyframes shine {
            to { background-position: 200% center; }
        }

        .tagline {
            font-size: 1.4rem;
            color: rgba(255, 255, 255, 0.6);
            margin-bottom: 50px;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
            font-style: italic;
            font-weight: 300;
        }

        .btn-install {
            display: inline-flex;
            align-items: center;
            gap: 12px;
            padding: 22px 55px;
            font-size: 1.4rem;
            font-weight: 700;
            text-decoration: none;
            color: #fff;
            background: linear-gradient(135deg, var(--accent) 0%, #a259ff 100%);
            border-radius: 24px;
            box-shadow: 0 15px 30px rgba(124, 77, 255, 0.4);
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            border: 1px solid rgba(255,255,255,0.1);
        }

        .btn-install:hover {
            transform: translateY(-8px) scale(1.02);
            box-shadow: 0 25px 50px rgba(124, 77, 255, 0.6);
        }

        .info-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 25px;
            margin-top: 70px;
            padding-top: 50px;
            border-top: 1px solid var(--glass-border);
        }

        .info-card {
            background: rgba(255, 255, 255, 0.02);
            padding: 25px;
            border-radius: 30px;
            border: 1px solid var(--glass-border);
            transition: all 0.3s ease;
        }

        .info-card:hover {
            background: rgba(255, 255, 255, 0.05);
            transform: translateY(-5px);
        }

        .info-icon {
            font-size: 2rem;
            margin-bottom: 15px;
            display: block;
        }

        .info-title {
            font-weight: 600;
            color: var(--accent);
            margin-bottom: 8px;
            text-transform: uppercase;
            font-size: 0.85rem;
            letter-spacing: 1.5px;
        }

        .info-text {
            font-size: 0.9rem;
            color: rgba(255, 255, 255, 0.4);
            line-height: 1.4;
        }

        @media (max-width: 768px) {
            h1 { font-size: 3rem; }
            .info-grid { grid-template-columns: 1fr; }
            .container { padding: 40px 25px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo-wrapper">
            <div class="logo-glow"></div>
            <img src="${manifest.logo}" alt="Logo" class="logo">
        </div>
        
        <h1>${manifest.name}</h1>
        <p class="tagline">"${manifest.description}"</p>
        
        <a href="stremio://${process.env.VERCEL_URL || 'localhost:7000'}/manifest.json" class="btn-install" id="installBtn">
            <span>INSTALAR AGORA</span>
        </a>

        <div class="info-grid">
            <div class="info-card">
                <span class="info-icon">⚡</span>
                <div class="info-title">Ultra Rápido</div>
                <div class="info-text">Scraper otimizado para SuperFlix e Vizer.</div>
            </div>
            <div class="info-card">
                <span class="info-icon">💎</span>
                <div class="info-title">Premium</div>
                <div class="info-text">Catálogos completos e interface limpa.</div>
            </div>
            <div class="info-card">
                <span class="info-icon">📱</span>
                <div class="info-title">Compatível</div>
                <div class="info-text">Funciona em PC, Android e Android TV.</div>
            </div>
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const currentHost = window.location.host;
            const protocol = window.location.protocol === 'https:' ? 'stremio://' : 'http://';
            const installBtn = document.getElementById('installBtn');
            
            if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
                installBtn.href = 'stremio://' + currentHost + '/manifest.json';
            }
        });
    </script>
</body>
</html>
`;

serveHTTP(addonInterface, {
    port: process.env.PORT || 7000,
    landingPage: landingPage
});

console.log(`Addon IoannesBn running at: http://localhost:${process.env.PORT || 7000}`);
console.log(`Installable at: http://localhost:${process.env.PORT || 7000}/manifest.json`);
