// Fetch exposes decoded bytes. Do not forward upstream compression/framing to HTTP clients.
function responseHeaders(headers){const out=new Headers(headers);for(const name of ['content-encoding','content-length','transfer-encoding','connection','keep-alive','proxy-authenticate','proxy-authorization','te','trailer','upgrade'])out.delete(name);return Object.fromEntries(out);}
module.exports={responseHeaders};
