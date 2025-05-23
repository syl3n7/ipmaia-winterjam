import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          {/* Preconnect to important origins */}
          <link rel="preconnect" href="https://rsms.me" />
          {/* Font stylesheet moved here from RootLayout for better performance */}
          <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
          {/* Cloudflare insights */}
          <script
            defer
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon='{"token": "288377c903af4e4187b8b239e29790e9"}'
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
