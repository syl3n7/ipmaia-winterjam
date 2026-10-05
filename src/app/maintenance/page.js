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
          .check-button {
            border: 1px solid rgba(255,255,255,0.5);
            border-radius: 6px;
            background: rgba(255,255,255,0.12);
            color: white;
            cursor: pointer;
            font: inherit;
            font-size: 0.95rem;
            padding: 10px 16px;
          }
          .check-button:hover { background: rgba(255,255,255,0.22); }
          .check-button:focus-visible { outline: 3px solid #ffd700; outline-offset: 3px; }
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
          <p>We&apos;re carrying out scheduled maintenance. The site will return automatically when it&apos;s complete.</p>

          <div className="status" aria-live="polite">
            <div className="spinner" />
            <p><span className="status-indicator" />Maintenance in progress</p>
            <p className="info">
              This page checks for availability automatically.
            </p>
            <div className="countdown" id="countdown">
              Checking again in <span id="timer">5</span> seconds&hellip;
            </div>
            <button className="check-button" id="check-button" type="button">Check now</button>
          </div>

          <div className="footer">
            <p>Thank you for your patience.</p>
          </div>
        </div>

        <script dangerouslySetInnerHTML={{ __html: `
          var countdown = 5;
          var timerEl = document.getElementById('timer');
          var countdownEl = document.getElementById('countdown');
          var checkButton = document.getElementById('check-button');
          var checking = false;

          function checkStatus() {
            if (checking) return;
            checking = true;
            if (countdownEl) countdownEl.textContent = 'Checking site availability…';
            if (checkButton) checkButton.disabled = true;

            fetch('/api/health-check', { cache: 'no-store' })
              .then(function(r) {
                if (r.ok) window.location.replace('/');
              })
              .catch(function() {})
              .finally(function() {
                checking = false;
                countdown = 5;
                if (checkButton) checkButton.disabled = false;
                if (countdownEl) {
                  countdownEl.innerHTML = 'Checking again in <span id="timer">5</span> seconds…';
                  timerEl = document.getElementById('timer');
                }
              });
          }

          if (checkButton) checkButton.addEventListener('click', checkStatus);

          setInterval(function() {
            if (!checking) countdown--;
            if (timerEl && !checking) timerEl.textContent = countdown;
            if (countdown <= 0 && !checking) {
              checkStatus();
            }
          }, 1000);
        `}} />
      </body>
    </html>
  );
}
