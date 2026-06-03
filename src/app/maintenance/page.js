export const runtime = 'edge';

export default function MaintenancePage() {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>IPMAIA WinterJam - Maintenance</title>
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          .container {
            text-align: center;
            max-width: 600px;
            animation: fadeIn 0.5s ease-in;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .logo {
            font-size: 80px;
            margin-bottom: 20px;
            display: inline-block;
            animation: pulse 2s ease-in-out infinite;
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50%       { transform: scale(1.1); }
          }
          h1 { font-size: 2.5rem; margin-bottom: 20px; font-weight: 700; }
          p  { font-size: 1.25rem; line-height: 1.6; margin-bottom: 30px; opacity: 0.95; }
          .status {
            background: rgba(255,255,255,0.15);
            backdrop-filter: blur(10px);
            border-radius: 12px;
            padding: 30px;
            margin: 30px 0;
            border: 1px solid rgba(255,255,255,0.2);
          }
          .spinner {
            display: inline-block;
            width: 50px; height: 50px;
            border: 4px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            border-top-color: white;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
          .status-indicator {
            display: inline-block;
            width: 12px; height: 12px;
            border-radius: 50%;
            background: #ffd700;
            margin-right: 8px;
            animation: blink 1.5s ease-in-out infinite;
          }
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50%       { opacity: 0.3; }
          }
          .info { font-size: 0.95rem; opacity: 0.8; margin-top: 20px; margin-bottom: 0; }
          .countdown { font-size: 1.1rem; font-weight: 600; margin-top: 15px; color: #ffd700; }
          .footer { margin-top: 40px; font-size: 0.9rem; opacity: 0.7; }
          .footer p { font-size: inherit; margin-bottom: 0; }
          @media (max-width: 600px) {
            h1   { font-size: 2rem; }
            p    { font-size: 1rem; }
            .logo { font-size: 60px; }
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <div className="logo">🎮</div>
          <h1>IPMAIA WinterJam</h1>
          <p>We&apos;re currently updating our systems to bring you the best experience!</p>

          <div className="status">
            <div className="spinner" />
            <p><span className="status-indicator" />Deployment in Progress</p>
            <p className="info">
              Our team is deploying new updates. This usually takes just a few minutes.
            </p>
            <div className="countdown" id="countdown">
              Checking status in <span id="timer">10</span> seconds&hellip;
            </div>
          </div>

          <div className="footer">
            <p>Thank you for your patience! 💙</p>
            <p style={{ fontSize: '0.8rem', marginTop: '10px' }}>
              Auto-refreshing to check if services are back online&hellip;
            </p>
          </div>
        </div>

        <script dangerouslySetInnerHTML={{ __html: `
          var countdown = 10;
          var timerEl = document.getElementById('timer');
          var countdownEl = document.getElementById('countdown');

          function checkStatus() {
            fetch('/api/health-check')
              .then(function(r) { if (r.ok) { window.location.href = '/'; } })
              .catch(function() {})
              .finally(function() { countdown = 30; });
          }

          setInterval(function() {
            countdown--;
            if (timerEl) timerEl.textContent = countdown;
            if (countdown <= 0) {
              if (countdownEl) countdownEl.innerHTML = '<span class="status-indicator"></span>Checking if services are ready\u2026';
              checkStatus();
            }
          }, 1000);
        `}} />
      </body>
    </html>
  );
}
