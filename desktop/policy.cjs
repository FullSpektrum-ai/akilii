const destinations=Object.freeze({workspace:'https://akilii.fullspektrum.ai/',storyboard:'https://akilii.fullspektrum.ai/storyboard/'});
function destination(name){if(!Object.hasOwn(destinations,name))throw new Error('Unknown destination');return destinations[name];}
function trustedSender(event,page){return Boolean(event.senderFrame&&event.senderFrame===event.sender.mainFrame&&event.senderFrame.url===page);}
module.exports={destination,trustedSender};
