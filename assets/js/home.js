/* Home page: the expandable project stage, the entry switch indicator, a light scroll-in for cards.
   Nothing here hides content: without this file the stage is a plain card grid and the entry links still work as URLs. */
(function(){
"use strict";
var doc=document.documentElement, I=window.I18N;
var reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
var stage=document.querySelector(".stage");
if(stage){
  var items=[].slice.call(stage.querySelectorAll(".sp"));
  var active=null;
  function ordered(){
    return items.slice().sort(function(a,b){return (parseInt(getComputedStyle(a).order,10)||0)-(parseInt(getComputedStyle(b).order,10)||0);});
  }
  /* the expand control (a button) and the "read the case" link are separate elements: expanding never navigates */
  function activate(a){
    if(!a||a===active) return;
    active=a;
    items.forEach(function(x){var on=x===a,btn=x.querySelector(".sp-open");x.classList.toggle("is-on",on);if(btn){btn.setAttribute("aria-expanded",on?"true":"false");btn.tabIndex=on?-1:0;}});
    doc.style.setProperty("--accent-t",getComputedStyle(a).getPropertyValue("--theme")||"");
  }
  doc.classList.add("js-stage");
  var canHover=matchMedia("(hover:hover) and (pointer:fine)").matches;
  items.forEach(function(a){
    var btn=a.querySelector(".sp-open");
    if(canHover){a.addEventListener("mouseenter",function(){activate(a);});}
    if(btn){
      btn.addEventListener("click",function(){activate(a);});
      btn.addEventListener("focus",function(){try{if(btn.matches(":focus-visible"))activate(a);}catch(e){activate(a);}});
    }
    a.addEventListener("keydown",function(e){
      if(e.target.tagName==="A"&&(e.key==="ArrowLeft"||e.key==="ArrowRight"||e.key==="ArrowUp"||e.key==="ArrowDown")&&!e.altKey){/* arrows move between projects from the link too */}
      var o=ordered(),i=o.indexOf(a),n=null;
      if(e.key==="ArrowRight"||e.key==="ArrowDown")n=o[(i+1)%o.length];
      else if(e.key==="ArrowLeft"||e.key==="ArrowUp")n=o[(i-1+o.length)%o.length];
      else if(e.key==="Home")n=o[0];else if(e.key==="End")n=o[o.length-1];
      if(n){e.preventDefault();activate(n);var nb=n.querySelector(".sp-open");if(nb&&!n.classList.contains("is-on")){nb.focus();}else{var lk=n.querySelector(".sp-go");if(lk)lk.focus();}}
    });
  });
  /* the first project in the current entry is open by default; switching entry re-opens its first project */
  function reset(){active=null;activate(ordered()[0]);}
  requestAnimationFrame(reset);
  doc.addEventListener("statechange",function(e){requestAnimationFrame(function(){if(!stage.contains(document.activeElement)) reset();});});
}

/* entry switch: a pill that slides under the selected option */
var tr=document.querySelector(".tracks"), ind=tr&&tr.querySelector(".trk-ind");
function placeInd(instant){
  if(!tr||!ind) return;
  var on=tr.querySelector('.trk[aria-pressed="true"]'); if(!on||!on.offsetWidth){return;}
  if(instant||reduce) ind.style.transition="none";
  ind.style.transform="translate("+on.offsetLeft+"px,"+on.offsetTop+"px)";
  ind.style.width=on.offsetWidth+"px"; ind.style.height=on.offsetHeight+"px"; ind.style.top="0";
  if(instant||reduce){void ind.offsetWidth;ind.style.transition="";}
}
if(tr){
  var first=true;
  doc.addEventListener("statechange",function(){placeInd(first);first=false;});
  window.addEventListener("resize",function(){placeInd(true);});
  if(document.fonts&&document.fonts.ready) document.fonts.ready.then(function(){placeInd(true);});
  placeInd(true);
}

/* cards rise once as they scroll in (content is visible by default; the animation only plays) */
if(!reduce&&"IntersectionObserver" in window&&Element.prototype.animate){
  var cards=[].slice.call(document.querySelectorAll(".ability,.mini,.pm-case,.nfeat"));var seen=0;
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){io.unobserve(e.target);var d=(seen++%3)*70;
    e.target.animate([{opacity:0,transform:"translateY(14px)"},{opacity:1,transform:"none"}],{duration:520,delay:d,easing:"cubic-bezier(.22,.75,.2,1)",fill:"backwards"});}});},{rootMargin:"0px 0px -8% 0px",threshold:.08});
  cards.forEach(function(c){io.observe(c);});
}
})();
