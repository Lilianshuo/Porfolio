/* Case-page helpers: V1/V2 version switch (narrow screens) and numbered change markers.
   Without JS both versions and every note are shown. */
(function(){
"use strict";
/* version switch: buttons set data-ver on the panel; wide screens show both versions regardless */
document.querySelectorAll(".cmp-panel").forEach(function(panel){
  var btns=[].slice.call(panel.querySelectorAll(".cmp-switch button"));
  btns.forEach(function(b){b.addEventListener("click",function(){
    panel.setAttribute("data-ver",b.getAttribute("data-ver"));
    btns.forEach(function(x){x.setAttribute("aria-pressed",String(x===b));});
  });});
});
/* markers and notes highlight each other (hover, focus or click), within one comparison row */
function hot(row,m,on){
  [].forEach.call(row.querySelectorAll('[data-m="'+m+'"]'),function(e){e.classList.toggle("is-hot",on);});
}
document.querySelectorAll(".cmp-row, .hot-fig").forEach(function(row){
  row.querySelectorAll(".mk").forEach(function(mk){
    var m=mk.getAttribute("data-m");
    ["mouseenter","focus"].forEach(function(ev){mk.addEventListener(ev,function(){hot(row,m,true);});});
    ["mouseleave","blur"].forEach(function(ev){mk.addEventListener(ev,function(){hot(row,m,false);});});
    mk.addEventListener("click",function(){
      var g=mk.getAttribute("data-goto");
      if(g){
        var tab=document.getElementById(g+"-tab");
        if(tab&&tab.getAttribute("aria-selected")!=="true")tab.click();
        var scope=row.closest(".jx")||document;
        scope.querySelectorAll(".fn-list li").forEach(function(x){x.classList.remove("is-hot");});
        var f=scope.querySelector('.fn-list li[data-m="'+m+'"]');
        if(f){f.classList.add("is-hot");var r0=f.getBoundingClientRect();if(r0.top<0||r0.bottom>innerHeight)f.scrollIntoView({block:"nearest",behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});}
        return;
      }
      var li=row.querySelector('.cmp-notes li[data-m="'+m+'"]');
      row.querySelectorAll(".cmp-notes li").forEach(function(x){x.classList.remove("is-hot");});
      if(li){li.classList.add("is-hot");if(li.scrollIntoView){var r=li.getBoundingClientRect();if(r.top<0||r.bottom>innerHeight)li.scrollIntoView({block:"nearest",behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});}}
    });
  });
  (row.closest(".jx")||row).querySelectorAll(".cmp-notes li, .fn-list li").forEach(function(li){
    var m=li.getAttribute("data-m");
    li.addEventListener("mouseenter",function(){hot(row,m,true);});li.addEventListener("mouseleave",function(){hot(row,m,false);});
  });
});
})();
