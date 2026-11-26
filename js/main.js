(function(){
  var btn=document.querySelector('.menu-btn'),nav=document.querySelector('.nav');
  if(btn&&nav){btn.addEventListener('click',function(){var o=nav.classList.toggle('open');btn.setAttribute('aria-expanded',o?'true':'false');btn.setAttribute('aria-label',o?'전체 메뉴 닫기':'전체 메뉴 열기');});}
  var tabs=[].slice.call(document.querySelectorAll('[role="tab"]:not([data-section-tab])'));
  tabs.forEach(function(t){t.addEventListener('click',function(){
    var list=t.parentNode;[].slice.call(list.querySelectorAll('[role="tab"]')).forEach(function(x){
      var on=x===t;x.setAttribute('aria-selected',on?'true':'false');
      var p=document.getElementById(x.getAttribute('aria-controls'));if(p){p.hidden=!on;}
    });
  });});
  var f=document.querySelector('#contact-form');
  if(f){f.addEventListener('submit',function(e){e.preventDefault();var m=document.querySelector('#form-msg');
    if(!f.checkValidity()){m.textContent='필수 항목을 모두 입력해 주세요.';f.reportValidity();return;}
    m.textContent='시안 단계에서는 전송되지 않습니다. 구축 단계에서 접수 기능을 연결합니다.';});}
})();
