export function injectScriptIntoIframe(iframe: HTMLIFrameElement) {

   const scriptContent = `
       (function() {
           // Intercept XMLHttpRequest
           const originalXhr = window.XMLHttpRequest;
           function InterceptorXhr() {
               const xhr = new originalXhr();
               xhr.addEventListener('loadstart', function() {
                   console.log('XMLHttpRequest Started:', this.method, this.url);
               });
               xhr.addEventListener('loadend', function() {
                   console.log('XMLHttpRequest Finished:', this.method, this.url, 'Status:', this.status);
               });
               const originalOpen = xhr.open;
               xhr.open = function(method, url) {
                   this.method = method;
                   this.url = url;
                   return originalOpen.apply(this, arguments);
               };
               return xhr;
           }
           window.XMLHttpRequest = InterceptorXhr;

           // Intercept fetch
           const originalFetch = window.fetch;
           window.fetch = async function() {
               const [resource, config] = arguments;
               console.log('Fetch Started:', config?.method || 'GET', resource);
               try {
                   const response = await originalFetch.apply(this, arguments);
                   console.log('Fetch Finished:', config?.method || 'GET', resource, 'Status:', response.status);
                   return response;
               } catch (error) {
                   console.error('Fetch Error:', error);
                   throw error;
               }
           };
       })();
   `;

   // Create a script element
   const script = document.createElement('script');
   script.type = 'text/javascript';
   script.textContent = scriptContent;

   // Inject the script into the iframe
   iframe.contentWindow?.document.head.appendChild(script);
}