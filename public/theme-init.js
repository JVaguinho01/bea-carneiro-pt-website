try {
  var t = localStorage.getItem('bc-consent') === 'granted' && localStorage.getItem('bc-theme');
  if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t);
} catch (e) {}
