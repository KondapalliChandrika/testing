//   // import React from 'react';
//   // import { View, StyleSheet } from 'react-native';
//   // import { WebView } from 'react-native-webview';
//   // export default function RufflePlayer() {
    
//   //   return (
//   //     <View style={styles.container}>
//   //       <WebView
//   //         style={styles.webview}
//   //         source={{ uri: 'file:///android_asset/index.html' }}
//   //         originWhitelist={['*']}
//   //         allowFileAccess={true}
//   //         allowUniversalAccessFromFileURLs={true}
//   //         javaScriptEnabled={true}
//   //         domStorageEnabled={true}
//   //         mixedContentMode="always"
//   //         allowFileAccessFromFileURLs={true}
//   //       />
//   //     </View>
//   //   );
//   // }

//   // const styles = StyleSheet.create({
//   //   container: { flex: 1 },
//   //   webview: { flex: 1 },
//   // });



//   import React, { useEffect, useState } from 'react';
// import { View, StyleSheet } from 'react-native';
// import { WebView } from 'react-native-webview';
// import StaticServer from 'react-native-static-server';

// export default function RufflePlayer() {
//   const [serverUrl, setServerUrl] = useState(null);

//   useEffect(() => {
//     // Start a static server to serve files from assets folder
//     const server = new StaticServer(8080, 'assets', { localOnly: true });

//     server.start().then((url) => {
//       console.log('Server started at:', url);
//       setServerUrl(url);
//     });

//     return () => server.stop(); // stop server on unmount
//   }, []);

//   if (!serverUrl) return null; // wait until server starts

//   return (
//     <View style={styles.container}>
//       <WebView
//         style={styles.webview}
//         source={{ uri: `${serverUrl}/index.html` }} // HTTP URL, not file://
//         originWhitelist={['*']}
//         javaScriptEnabled={true}
//         domStorageEnabled={true}
//         mixedContentMode="always"
//         allowFileAccess={true}
//         allowUniversalAccessFromFileURLs={true}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   webview: { flex: 1 },
// });



import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Platform, ActivityIndicator, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import StaticServer from 'react-native-static-server';
import RNFS from 'react-native-fs';

export default function RufflePlayer() {
  const [serverUrl, setServerUrl] = useState(null);
  const [status, setStatus] = useState("Initializing...");

  useEffect(() => {
    let server = null;

    const startServer = async () => {
      try {
        setStatus("Preparing assets...");
        
        // 1. Define the folder where files will live in the App's writable storage
        const DOCS_DIR = `${RNFS.DocumentDirectoryPath}/www`;
        
        // Ensure the directory exists
        const dirExists = await RNFS.exists(DOCS_DIR);
        if (!dirExists) {
          await RNFS.mkdir(DOCS_DIR);
        }

        // 2. LIST EVERY FILE FROM YOUR ASSETS FOLDER HERE
        // ⚠️ You must include every .js, .wasm, .map, and .swf file you see in your assets folder.
        const fileList = [
          'index.html',
          'ruffle.js',
          'ruffle.js.map', 
          'core.ruffle.10fd63f6bbfccf71e794.js',
          'core.ruffle.10fd63f6bbfccf71e794.js.map',
          'core.ruffle.de5f45a80f801efb3b97.js',
          // Add your WASM files from the screenshot:
          '28faf705184991e03a00.wasm', 
          '120b37392fbc8d4bd8e5.wasm', 
          'oneclass.swf'
        ];

        // 3. Copy files (Force Overwrite)
        for (const filename of fileList) {
          const destPath = `${DOCS_DIR}/${filename}`;
          
          // Delete old file if it exists to ensure we aren't using a broken version
          if (await RNFS.exists(destPath)) {
            await RNFS.unlink(destPath);
          }

          // Copy fresh file
          try {
            if (Platform.OS === 'android') {
              // 'ruffle' is the folder name inside android/app/src/main/assets/
              await RNFS.copyFileAssets(`ruffle/${filename}`, destPath);
            } else {
              // iOS path
              await RNFS.copyFile(`${RNFS.MainBundlePath}/ruffle/${filename}`, destPath);
            }
          } catch (copyError) {
            console.error(`Failed to copy ${filename}:`, copyError);
          }
        }

        // 4. Start the HTTP Server
        setStatus("Starting server...");
        server = new StaticServer(0, DOCS_DIR, { localOnly: true });
        const url = await server.start();
        
        console.log(`Server started at ${url}`);
        setServerUrl(`${url}/index.html`);

      } catch (err) {
        console.error('Server setup error:', err);
        setStatus(`Error: ${err.message}`);
      }
    };

    startServer();

    // Cleanup on unmount
    return () => {
      if (server) {
        console.log("Stopping server...");
        server.stop();
      }
    };
  }, []);

  if (!serverUrl) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF0000" />
        <Text style={styles.loadingText}>{status}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        style={styles.webview}
        source={{ uri: serverUrl }}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
        // Improve performance on Android
        androidLayerType="hardware"
        mixedContentMode="always"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  webview: { flex: 1, backgroundColor: 'transparent' },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#222' 
  },
  loadingText: { 
    marginTop: 10, 
    color: 'white' 
  }
});