import {broadcastResponseToMainFrame} from '@azure/msal-browser/redirect-bridge';
broadcastResponseToMainFrame().catch(()=>{document.body.textContent='Microsoft sign-in could not return to akilii. Close this window and reconnect.';});
