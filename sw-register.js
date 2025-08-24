if('serviceWorker' in navigator){
  navigator.serviceWorker.register('sw.js').then(()=>console.log('sw registered')).catch(e=>console.warn('sw failed',e));
}
