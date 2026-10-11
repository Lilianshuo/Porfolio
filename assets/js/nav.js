/* Header: expandable project menu (thumbnail, name, research question).
   Desktop: opens on click or keyboard, and on hover with a short delay; Esc, click outside and focus leaving close it.
   Touch / narrow screens: a full-width sheet with thumbnails; no hover needed. Without JS the header links still work. */
(function(){
"use strict";
var doc=document.documentElement, S=window.SITE, I=window.I18N;
var header=document.querySelector("header.top"), panel=document.getElementById("projMenu");
if(!header||!panel||!S||!I) return;
var btns=[].slice.call(document.querySelectorAll("[data-menu-btn]"));
var reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
var canHover=matchMedia("(hover:hover) and (pointer:fine)").matches;
var root=doc.getAttribute("data-root")||"";
var isOpen=false, pinned=false, tIn=0, tOut=0, active=null, lastFocus=null;
var list, items=[], view, ind;

function here(href){var f=href.split("/").pop(); return location.pathname.split("/").pop()===f;}
function build(){
  var track=I.track, order=S.order[track]||S.order.all;
  panel.innerHTML='';
  var inner=document.createElement("div"); inner.className="pm-inner wrap";
  list=document.createElement("ul"); list.className="pm-list"; list.setAttribute("role","list");
  ind=document.createElement("span"); ind.className="pm-ind"; ind.setAttribute("aria-hidden","true"); list.appendChild(ind);
  view=document.createElement("div"); view.className="pm-view"; view.setAttribute("aria-hidden","true");
  items=[];
  order.forEach(function(id,n){
    var p=S.projects[id]; if(!p) return;
    var li=document.createElement("li");
    var a=document.createElement("a"); a.className="pm-item"; a.href=root+p.href; a.setAttribute("data-id",id); a.setAttribute("data-theme",p.theme);
    if(here(p.href)) a.setAttribute("aria-current","page");
    a.innerHTML='<img class="pm-th" src="'+root+p.tile+'" alt="" loading="lazy" decoding="async" width="96" height="64">'+
      '<span class="pm-txt"><span class="pm-t">'+I.B(esc(p.name.zh),esc(p.name.en))+'</span><span class="pm-q">'+I.B(esc(p.q.zh),esc(p.q.en))+'</span></span>'+
      '<span class="pm-arr" aria-hidden="true">→</span>';
    li.appendChild(a); list.appendChild(li); items.push(a);
    var im=document.createElement("img"); im.src=root+p.tile; im.alt=""; im.loading="lazy"; im.decoding="async"; im.setAttribute("data-id",id); view.appendChild(im);
    var cap=document.createElement("span"); cap.className="pm-badge"; cap.setAttribute("data-id",id); cap.innerHTML=I.B(esc(p.badge.zh),esc(p.badge.en)); view.appendChild(cap);
    a.addEventListener("mouseenter",function(){activate(a);}); a.addEventListener("focus",function(){activate(a);});
  });
  var links=document.createElement("div"); links.className="pm-links";
  links.innerHTML='<a href="'+root+'index.html#about">'+I.B("背景","Background")+'</a><a href="'+root+'index.html#contact">'+I.B("联系","Contact")+'</a><a data-cv="current" href="'+root+'docs/cv-uxr-zh.pdf" download>'+I.B("简历 PDF ↓","CV PDF ↓")+'</a>';
  inner.appendChild(list); inner.appendChild(view); inner.appendChild(links); panel.appendChild(inner);
  var cur=items.filter(function(a){return a.getAttribute("aria-current");})[0]||items[0];
  if(cur) activate(cur,true);
  I.decorate(panel);
  document.querySelectorAll("#projMenu a[data-cv]").forEach(function(a){a.setAttribute("href",I.cvHref(I.track,I.lang));});
}
function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;");}
function activate(a,instant){
  if(!a) return; active=a;
  items.forEach(function(x){x.classList.toggle("is-on",x===a);});
  var id=a.getAttribute("data-id");
  [].forEach.call(view.children,function(c){c.classList.toggle("on",c.getAttribute("data-id")===id);});
  panel.setAttribute("data-theme",a.getAttribute("data-theme"));
  place(instant);
}
function place(instant){
  if(!active||!ind) return;
  var y=active.parentNode.offsetTop, h=active.parentNode.offsetHeight;
  if(instant||reduce){ind.style.transition="none";}
  ind.style.transform="translateY("+y+"px)"; ind.style.height=h+"px";
  if(instant||reduce){void ind.offsetHeight; ind.style.transition="";}
}
function setExpanded(v){btns.forEach(function(b){b.setAttribute("aria-expanded",String(v));});}
function open(pin){
  clearTimeout(tOut); clearTimeout(tIn);
  pinned=pin||pinned;
  if(isOpen) return;
  isOpen=true; panel.hidden=false; header.classList.add("menu-open"); doc.classList.add("menu-lock"); setExpanded(true);
  void panel.offsetHeight; panel.classList.add("open"); place(true);
}
function close(back){
  clearTimeout(tOut); clearTimeout(tIn);
  if(!isOpen) return;
  isOpen=false; pinned=false; panel.classList.remove("open"); header.classList.remove("menu-open"); doc.classList.remove("menu-lock"); setExpanded(false);
  var done=function(){if(!isOpen) panel.hidden=true;};
  if(reduce) done(); else setTimeout(done,240);
  if(back){var b=btns.filter(function(x){return x.offsetParent!==null;})[0]||btns[0]; if(b) b.focus();}
}
btns.forEach(function(b){
  b.addEventListener("click",function(e){e.preventDefault(); if(isOpen&&pinned) close(true); else if(isOpen&&!pinned){pinned=true;} else open(true);});
  if(canHover){
    b.addEventListener("mouseenter",function(){if(b.hasAttribute("data-menu-hover")&&!isOpen){clearTimeout(tOut);tIn=setTimeout(function(){open(false);},140);}});
    b.addEventListener("mouseleave",function(){clearTimeout(tIn);});
  }
});
if(canHover){
  header.addEventListener("mouseleave",function(){if(isOpen&&!pinned){clearTimeout(tOut);tOut=setTimeout(function(){close(false);},280);}});
  header.addEventListener("mouseenter",function(){clearTimeout(tOut);});
}
document.addEventListener("keydown",function(e){
  if(e.key==="Escape"&&isOpen){e.preventDefault(); close(true);}
  if(isOpen&&(e.key==="ArrowDown"||e.key==="ArrowUp"||e.key==="Home"||e.key==="End")&&panel.contains(document.activeElement)){
    var i=items.indexOf(document.activeElement); if(i<0) return; e.preventDefault();
    var n=e.key==="Home"?0:e.key==="End"?items.length-1:(i+(e.key==="ArrowDown"?1:-1)+items.length)%items.length; items[n].focus();
  }
  if(isOpen&&e.key==="ArrowDown"&&document.activeElement&&btns.indexOf(document.activeElement)>=0){e.preventDefault(); (items[0]).focus();}
});
document.addEventListener("pointerdown",function(e){if(isOpen&&!header.contains(e.target)) close(false);});
header.addEventListener("focusout",function(e){
  if(!isOpen) return; var to=e.relatedTarget; if(to&&header.contains(to)) return; if(!to) return; close(false);
});
panel.addEventListener("click",function(e){if(e.target.closest("a")&&!e.target.closest("a").hasAttribute("download")) close(false);});
window.addEventListener("resize",function(){if(isOpen) place(true);});
window.addEventListener("pageshow",function(){close(false);});
doc.addEventListener("statechange",function(){var was=isOpen; build(); if(was) place(true);});
build();
doc.classList.add("js-ready");
})();
