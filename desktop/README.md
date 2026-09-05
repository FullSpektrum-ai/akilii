# akilii desktop foundation

Internal development build, not a user-ready desktop client. `npm ci`, `npm test`, `npm start` from this directory. Node 24 expected.

`npm run package:mac` builds arm64 and x64 macOS application bundles; `npm run package:win` builds Windows x64. Packages are unsigned internal artifacts. Do not distribute as production installers or ask users to bypass OS protection. Signing/notarisation and Windows verification remain release gates.

The first slice is a locally bundled, sandboxed native window with only two fixed external destinations and no account credentials, filesystem or microphone access. Existing authenticated work opens in the default browser. This intentionally does not embed Google OAuth in a webview or claim desktop authentication is complete.

Next: system-browser PKCE with state-bound return, OS credential storage, backend-approved desktop origins, in-app workspace, explicit microphone permission, persistence/isolation regression tests, signed updates and both-OS installation testing. Never copy service/provider keys into this package. FlowState remains disconnected until the existing runtime gates pass.
