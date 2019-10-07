
$(document).ready(function() {
  var script = document.createElement('script');
  script.setAttribute('id', 'scriptid' );
  script.src = "assets/js/swiper.js";
  setTimeout(function(){
    document.body.appendChild(script);
  },200);
});