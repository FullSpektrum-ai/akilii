# Install akilii desktop — alpha.9

These are unsigned early-access review builds, not beta-qualified or guided installers. Keep the existing app until you have tested its replacement. Quit akilii before opening a new version so macOS does not hand sign-in back to an older running copy.

## macOS

1. Choose Intel or Apple Silicon to match About This Mac.
2. Download and unzip the package.
3. Drag akilii.app into Applications, then open it.
4. macOS may block this unsigned, unnotarised preview. If you trust the source, review the blocked-app notice in System Settings → Privacy & Security. Do not disable Gatekeeper globally. Managed devices may require administrator approval.

## Windows

1. Download and extract the complete ZIP to a folder you control.
2. Run akilii.exe from the extracted folder. Keep its supporting files alongside it.
3. Windows may display an unknown-publisher warning; this preview is not code-signed. Managed devices may require administrator approval.

## Your workspace

Cloud mode uses your invited Google account and requires internet access. Local mode requires a separately installed, running Ollama runtime. Use Local models in the workspace header to download a model, monitor progress, cancel or retry. Changing mode does not transfer conversations or data between cloud and local workspaces.

To use saved Work in a conversation, enable akilii Work in Integrations, then select Work tools in the composer. The model may read up to five saved plans. It cannot send email or modify files through this tool.

The alpha.9 FlowState service is a separate runtime behind the akilii gateway. The desktop shell can report whether that gateway is reachable and, when a service token is configured for the desktop process, whether the runtime is ready. FlowState remains operator/runtime infrastructure rather than a standalone akilii product destination. Local desktop chat continues to use the selected local provider until FlowState execution is explicitly attached to that workspace.
