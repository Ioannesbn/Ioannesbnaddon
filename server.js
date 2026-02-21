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
            --accent: #5e17eb;
            --bg: #050505;
            --card-bg: rgba(255, 255, 255, 0.05);
            --text: #ffffff;
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
                radial-gradient(circle at 20% 30%, rgba(94, 23, 235, 0.15) 0%, transparent 40%),
                radial-gradient(circle at 80% 70%, rgba(255, 61, 0, 0.1) 0%, transparent 40%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .container {
            max-width: 800px;
            width: 90%;
            padding: 40px;
            text-align: center;
            background: var(--card-bg);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 40px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            animation: fadeIn 1s ease-out;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .logo-container {
            width: 180px;
            height: 180px;
            margin: 0 auto 30px;
            position: relative;
        }

        .logo {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            object-fit: cover;
            border: 4px solid var(--primary);
            box-shadow: 0 0 30px rgba(255, 61, 0, 0.4);
            transition: transform 0.3s ease;
        }

        .logo:hover {
            transform: scale(1.05) rotate(5deg);
        }

        h1 {
            font-size: 3.5rem;
            font-weight: 800;
            margin-bottom: 20px;
            background: linear-gradient(135deg, #fff 0%, #aaa 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        p {
            font-size: 1.2rem;
            line-height: 1.6;
            color: rgba(255, 255, 255, 0.7);
            margin-bottom: 40px;
            font-style: italic;
        }

        .btn-install {
            display: inline-block;
            padding: 18px 45px;
            font-size: 1.2rem;
            font-weight: 600;
            text-decoration: none;
            color: #fff;
            background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
            border-radius: 100px;
            box-shadow: 0 10px 20px rgba(0,0,0,0.3);
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            border: none;
            cursor: pointer;
        }

        .btn-install:hover {
            transform: translateY(-5px) scale(1.05);
            box-shadow: 0 20px 40px rgba(94, 23, 235, 0.3);
        }

        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 20px;
            margin-top: 50px;
            padding-top: 40px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .feature-item {
            padding: 15px;
        }

        .feature-title {
            font-weight: 600;
            color: var(--primary);
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 5px;
        }

        .feature-desc {
            font-size: 0.8rem;
            color: rgba(255, 255, 255, 0.5);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo-container">
            <img src="${manifest.logo}" alt="${manifest.name}" class="logo">
        </div>
        <h1>${manifest.name}</h1>
        <p>"${manifest.description}"</p>
        
        <a href="stremio://${process.env.VERCEL_URL || 'localhost:7000'}/manifest.json" class="btn-install">
            INSTALAR NO STREMIO
        </a>

        <div class="features">
            <div class="feature-item">
                <div class="feature-title">Multi-Source</div>
                <div class="feature-desc">SuperFlix + Vizer</div>
            </div>
            <div class="feature-item">
                <div class="feature-title">Nativo</div>
                <div class="feature-desc">Suporte a Apps</div>
            </div>
            <div class="feature-item">
                <div class="feature-title">Catálogos</div>
                <div class="feature-desc">Filmes, Séries e +</div>
            </div>
        </div>
    </div>

    <script>
        if (window.location.protocol === 'https:') {
            const link = document.querySelector('.btn-install');
            link.href = 'stremio://' + window.location.host + '/manifest.json';
        }
    </script>
</body>
</html>
`;

serveHTTP(addonInterface, {
    port: process.env.PORT || 7000,
    landingPage: landingPage
});

console.log(\`Addon IoannesBn running at: http://localhost:\${process.env.PORT || 7000}\`);
console.log(\`Installable at: http://localhost:\${process.env.PORT || 7000}/manifest.json\`);
