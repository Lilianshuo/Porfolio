/* Language and entry-track state shared by every page.
   - html[lang] is "zh-CN" (default) or "en"; CSS hides the other language's [lang] spans.
   - html[data-track] is "all" (user research, default), "games" or "pm".
   - State comes from the URL (?lang=en&track=games), then localStorage (language only), then defaults;
     internal links carry it, so it survives navigation, Back/Forward and shared links.
   Everything here is progressive enhancement: without JS the page is complete in Chinese. */
(function(){
"use strict";
var doc=document.documentElement;
var TRACKS=["all","games","pm"];
var S={lang:"zh",track:"all",explicit:false};
function readState(fromStorage){
  var q=new URLSearchParams(location.search),l=q.get("lang"),t=q.get("track");
  var fromUrl=(l==="en"||l==="zh");
  if(!fromUrl){l=null;if(fromStorage!==false){try{l=localStorage.getItem("lang");}catch(e){}}}
  /* an explicit ?lang= in the URL always wins over the saved preference, and is saved in turn */
  S.lang=l==="en"?"en":"zh"; S.explicit=fromUrl||l==="en"||l==="zh";
  if(fromUrl){try{localStorage.setItem("lang",S.lang);}catch(e){}}
  t=t==="uxr"?"all":t; S.track=TRACKS.indexOf(t)>=0?t:"all";
}
readState();
var root=doc.getAttribute("data-root")||"";
var isFinal=function(){return doc.getAttribute("data-mode")==="final"||new URLSearchParams(location.search).get("mode")==="final";};
if(new URLSearchParams(location.search).get("mode")==="final") doc.setAttribute("data-mode","final");

/* bilingual markup helper for strings built in JS */
function B(zh,en){return '<span lang="zh-CN">'+zh+'</span><span lang="en">'+en+'</span>';}
function pick(zh,en){return S.lang==="en"?en:zh;}

/* internal links keep language, track and review/final mode */
function decorate(scope){
  (scope||document).querySelectorAll("a[href]").forEach(function(a){
    var h=a.getAttribute("href");
    if(!h||/^(https?:|mailto:|tel:|#|javascript:)/.test(h)||a.hasAttribute("download")) return;
    var i=h.indexOf("#"),path=i<0?h:h.slice(0,i),hash=i<0?"":h.slice(i);
    var j=path.indexOf("?"),base=j<0?path:path.slice(0,j),p=new URLSearchParams(j<0?"":path.slice(j+1));
    if(!/\.html$/.test(base)) return;
    var tb=a.getAttribute("data-track-btn"),tr=tb!==null?tb:S.track;
    if(S.explicit)p.set("lang",S.lang);else p.delete("lang");
    if(tr!=="all")p.set("track",tr);else p.delete("track");
    if(isFinal())p.set("mode","final");
    var qs=p.toString(); a.setAttribute("href",base+(qs?"?"+qs:"")+hash);
  });
}
/* attribute pairs written by the build as data-en-<name> / data-zh-<name>; the live attribute holds the current language */
function swapAttrs(scope){
  (scope||document).querySelectorAll("[data-i18n]").forEach(function(el){
    el.getAttribute("data-i18n").split(",").forEach(function(n){
      var v=el.getAttribute("data-"+(S.lang==="en"?"en":"zh")+"-"+n); if(v!==null) el.setAttribute(n,v);
    });
  });
}
function cvHref(track,lang){var t=track==="all"?"uxr":track;return root+"docs/cv-"+t+"-"+lang+".pdf";}
function applyCV(){
  document.querySelectorAll("a[data-cv]").forEach(function(a){
    var which=a.getAttribute("data-cv"); // "current" | "other" | "zh" | "en"
    var l=which==="other"?(S.lang==="en"?"zh":"en"):(which==="zh"||which==="en"?which:(S.lang==="en"?"en":"zh"));
    a.setAttribute("href",cvHref(S.track,l));
  });
}
function applyTitle(){
  var L=S.lang==="en"?"en":"zh", tk=S.track==="all"?"":"-"+S.track;
  var t=doc.getAttribute("data-title-"+L+tk)||doc.getAttribute("data-title-"+L); if(t) document.title=t;
  var m=document.querySelector('meta[name="description"]'),d=doc.getAttribute("data-desc-"+L+tk)||doc.getAttribute("data-desc-"+L); if(m&&d) m.setAttribute("content",d);
}
function updateUrl(){
  try{
    var u=new URL(location.href);
    if(S.explicit)u.searchParams.set("lang",S.lang);else u.searchParams.delete("lang");
    if(S.track!=="all")u.searchParams.set("track",S.track);else u.searchParams.delete("track");
    history.replaceState(history.state,"",u);
  }catch(e){}
}
function render(){
  doc.lang=S.lang==="en"?"en":"zh-CN";
  doc.setAttribute("data-track",S.track);
  var lb=document.getElementById("langBtn");
  if(lb){lb.innerHTML=S.lang==="zh"?'<span lang="zh-CN" aria-hidden="true">EN</span>':'<span lang="en" aria-hidden="true">中文</span>';lb.setAttribute("aria-label",S.lang==="zh"?"Switch to English":"切换为中文");}
  document.querySelectorAll("[data-track-btn]").forEach(function(b){b.setAttribute("aria-pressed",String(b.getAttribute("data-track-btn")===S.track));});
  swapAttrs(); applyCV(); applyTitle(); decorate();
  doc.dispatchEvent(new CustomEvent("statechange",{detail:{lang:S.lang,track:S.track}}));
}
function setLang(l,persist){
  S.lang=l==="en"?"en":"zh"; S.explicit=true;
  try{localStorage.setItem("lang",S.lang);}catch(e){}
  updateUrl(); render();
}
function setTrack(t){
  if(TRACKS.indexOf(t)<0)t="all"; S.track=t; updateUrl(); render();
}
document.addEventListener("click",function(e){
  var b=e.target.closest("#langBtn"); if(b){e.preventDefault();setLang(S.lang==="zh"?"en":"zh");return;}
  var t=e.target.closest("[data-track-btn]"); if(t){e.preventDefault();setTrack(t.getAttribute("data-track-btn"));}
});
/* bfcache / Back-Forward: re-read the language the visitor last chose, the track from the URL */
window.addEventListener("pageshow",function(e){
  var l=S.lang,t=S.track; readState(); if(e.persisted){try{var sl=localStorage.getItem("lang");if(sl&&!new URLSearchParams(location.search).get("lang"))S.lang=sl==="en"?"en":"zh";}catch(x){}}
  if(l!==S.lang||t!==S.track||e.persisted) render();
});
window.addEventListener("popstate",function(){readState();render();});
window.I18N={B:B,pick:pick,get lang(){return S.lang;},get track(){return S.track;},setLang:setLang,setTrack:setTrack,decorate:decorate,swapAttrs:swapAttrs,cvHref:cvHref,isFinal:isFinal};
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",render); else render();
})();
