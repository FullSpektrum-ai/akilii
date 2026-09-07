# Phase 8 platforms and domain review

## What is implemented
- User-selected Sport, Education, Lifestyle and Wellness **synthetic domain stories**, using the shared Meaning Field, Bounded Workset, One Next Move, contextual chips, editable draft and approval/Thread paths. These are not production vertical services, clinical workflows, education records or sports-data integrations.
- A 58px expanding composer with removable explicit context, a centred SVG plus, and an 82% opaque frosted options panel. Reduced transparency gets a solid panel; reduced motion/calm/support focus disables the phone brandmark's 32-second orbit.
- Electron Mac packages for Intel and Apple silicon. A branded tray popover offers quick capture, Home, Work, Thread resume, stop and demo launch. The Workspace menu adds shortcuts. Capture does not send or overwrite a draft; if the app is not entered yet, the user must enter and retry. The capture remains in the panel until the app exits.
- Generated Capacitor 8 iOS/Android projects with bundled synthetic demo and canonical app icons. No mobile cloud identity, native voice, push, background capture, secure account storage or local-model runtime is claimed. No live account is needed for this demo.
- Splash download availability driven by release-downloads.json and locally built archives. Missing builds have no link. Nothing has been published to GitHub, TestFlight or an app store.

## Mac review
Use the matching archive from outputs or the local splash page. These are unsigned internal review bundles, not notarised beta installers. Open the application, then choose Workspace → Flagship demo. The menu-bar icon opens the quick panel; right-click opens the conventional menu. Cmd+Shift+Space opens quick capture while the app has focus (not a global hotkey).

```sh
npm ci
npm --prefix desktop ci
node desktop/package-review.mjs
```

The default builds x64 and arm64. Set AKILII_ARCH=x64 or arm64 for one. Electron downloads are cached within .build-cache/electron. The bundled .icns file was verified to match the canonical brand icon. Absence of an optional Apple Icon Composer .icon file does not remove that .icns icon.

Source/security tests and packaging passed. Native launch, menu-bar placement on real monitors, signing/notarisation and real OAuth/provider acceptance still need native review; a browser preview of the panel is only visual evidence.

## George: mobile build and signing
The product owner explicitly deferred both native mobile compilations to George.

```sh
npm ci
npm --prefix mobile ci
node mobile/build.mjs
cd mobile
npx cap sync
npx cap open ios
# or
npx cap open android
```

The mobile build excludes desktop download archives. Its bundled entry forces the synthetic demo and does not offer the Turn off switch into an unconfigured account flow.

- iOS: Xcode 26.5 is installed here but xcodebuild stopped at the unaccepted Apple SDK licence. Complete Xcode setup, choose the development team, review the provisional ai.fullspektrum.akilii.demo bundle ID, compile, test on device and archive. Provision an App Store Connect/TestFlight build, then supply its real public invitation URL in release-downloads.json.
- Android: Java and Android SDK are absent here. Install the toolchain required by the pinned Capacitor/Gradle versions; review the provisional application ID, sync, compile a debug review APK, then configure the release keystore outside source control. Test on device before configuring a real APK or Play distribution URL.
- Test safe areas, software keyboard, large text, screen reader labels, app background/resume, synthetic storage lifecycle and the approval/receipt flow. No claim of native device acceptance has been made.

Do not treat a generated native project as an installable release. The web shell is shared inside a native Capacitor container; native feature parity is a separate acceptance task.

## Local model findings and changes
Only Ollama is wired to the local inference adapter. Ollama is a runtime, not a model. Other provider labels do not establish working local integrations.

The checked Mac reports Intel i5 / 16GB RAM. Ollama on 127.0.0.1:11434 was unreachable during review, so no speed benchmark or improvement is claimed. Installed models are now checked via /api/show for completion capability before entering the chat model list; embedding-only and unverified entries are excluded. Discovery is cached for 30 seconds. Older runtimes lacking capability information need verification/updating.

Local diagnostics reports installed/running model metadata, available GPU allocation and the latest completed response's time to first visible token, load time, prompt time and generation rate. It contains no chat transcript. A five-minute keep-alive is explicit; this is not by itself a guaranteed optimisation. Model HTTP failures retain a bounded reason at the adapter boundary; the shared chat stream can still show a generic failure.

A download manager is not required to use an already installed model and would not fix slow inference. A later opt-in manager can wrap Ollama's pull API with model size/licence review, progress, cancellation and failure recovery. No models were downloaded, removed or changed in this work. Diagnose cold loading versus generation, then test a smaller compatible model and appropriate context budget on the actual device before changing defaults. FlowState remains separate and unavailable.

## Verification
89 automated tests passed (69 web/support and 20 desktop). Both web builds and both Mac architecture packages succeeded. Browser checks exercised Sport/Education stories, contextual suggestions, a zero-pixel plus centre offset, frosted background, a 32-second mobile mark animation and no overflow at 390px. Native mobile compilation, native desktop interaction acceptance, live local model benchmarking and public deployment are outstanding as stated above.
