const destinations=Object.freeze({workspace:'https://fullspektrum-ai.github.io/akilii/',storyboard:'https://fullspektrum-ai.github.io/akilii/storyboard/'});
function destination(name){if(!Object.hasOwn(destinations,name))throw new Error('Unknown destination');return destinations[name];}
function trustedSender(event,page){return Boolean(event.senderFrame&&event.senderFrame===event.sender.mainFrame&&event.senderFrame.url===page);}
module.exports={destination,trustedSender};
