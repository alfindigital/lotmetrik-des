(function (window, document) {
  'use strict';

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', 'G-KJVN9Z014V');

  var firstScript = document.getElementsByTagName('script')[0];
  var googleTag = document.createElement('script');
  googleTag.async = true;
  googleTag.src = 'https://www.googletagmanager.com/gtag/js?id=G-KJVN9Z014V';
  firstScript.parentNode.insertBefore(googleTag, firstScript);

  window.clarity = window.clarity || function () {
    (window.clarity.q = window.clarity.q || []).push(arguments);
  };
  var clarityTag = document.createElement('script');
  clarityTag.async = true;
  clarityTag.src = 'https://www.clarity.ms/tag/xrvlyaao2k';
  firstScript.parentNode.insertBefore(clarityTag, firstScript);
})(window, document);
