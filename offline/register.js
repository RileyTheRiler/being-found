(function(){
 if(!('serviceWorker' in navigator)||!window.isSecureContext)return;
 window.addEventListener('load',function(){
   navigator.serviceWorker.register('/sw.js').catch(function(error){
     console.warn('Offline installation unavailable',error);
   });
 });
})();