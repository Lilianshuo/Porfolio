(function(){
"use strict";
var doc=document.documentElement;
/* entrance: one pass; content is visible by default and the hidden state only exists while html.js-enter is set */
function enter(){
  var hero=document.querySelector(".hero2"); if(!hero||!doc.classList.contains("js-enter")||!hero.animate){doc.classList.remove("js-enter");return;}
  var E="cubic-bezier(.16,1,.3,1)",S="cubic-bezier(.22,.75,.2,1)",anims=[];
  var small=matchMedia("(max-width:650px)").matches, d=small?.7:1;
  function go(el,kf,o){if(!el)return;try{anims.push(el.animate(kf,Object.assign({fill:"backwards"},o)));}catch(e){}}
  hero.querySelectorAll(".ln>span").forEach(function(s,i){go(s,[{transform:"translateY(115%)"},{transform:"none"}],{duration:1000,delay:120+i*110,easing:E});});
  hero.querySelectorAll("[data-in]").forEach(function(el,i){var y=(+el.dataset.in||10)*d;go(el,[{opacity:0,transform:"translateY("+y+"px)"},{opacity:1,transform:"none"}],{duration:650,delay:+el.dataset.delay||500+i*70,easing:S});});
  hero.querySelectorAll(".collage figure").forEach(function(f,i){var cs=getComputedStyle(f).transform;go(f,[{opacity:0,transform:"translateY(24px) "+(cs==="none"?"":cs)},{opacity:1,transform:cs==="none"?"none":cs}],{duration:800,delay:350+i*140,easing:E});});
  var done=function(){doc.classList.remove("js-enter");};
  doc.classList.remove("js-enter"); /* animations carry their own backwards fill, so removing the hidden state now is flicker-free */
  setTimeout(done,3500);
}
var ready=[]; if(document.fonts&&document.fonts.ready) ready.push(document.fonts.ready);
Promise.race([Promise.all(ready),new Promise(function(r){setTimeout(r,1200);})]).then(function(){requestAnimationFrame(enter);});

/* journey explorer: progressive enhancement, all panels are readable without JS */
document.querySelectorAll("[data-explorer]").forEach(function(root){
  var panels=[].slice.call(root.querySelectorAll(".jx-panel")); if(!panels.length)return;
  var list=document.createElement("div");list.className="jx-tabs";list.setAttribute("role","tablist");list.setAttribute("aria-label",root.dataset.explorer);
  var tabs=panels.map(function(p,i){
    var t=document.createElement("button");t.type="button";t.className="jx-tab";t.setAttribute("role","tab");t.id=p.id+"-tab";t.setAttribute("aria-controls",p.id);
    t.innerHTML='<span class="no">'+(p.dataset.no||i+1)+'</span><span>'+p.dataset.short+'</span>';
    p.setAttribute("role","tabpanel");p.setAttribute("aria-labelledby",t.id);
    t.addEventListener("click",function(){sel(i,false);});
    t.addEventListener("keydown",function(e){var n=null;
      if(e.key==="ArrowRight"||e.key==="ArrowDown")n=(i+1)%panels.length;else if(e.key==="ArrowLeft"||e.key==="ArrowUp")n=(i-1+panels.length)%panels.length;else if(e.key==="Home")n=0;else if(e.key==="End")n=panels.length-1;
      if(n!==null){e.preventDefault();sel(n,true);}});
    list.appendChild(t);return t;});
  function sel(n,focus){
    panels.forEach(function(p,i){p.hidden=i!==n;tabs[i].setAttribute("aria-selected",i===n);tabs[i].tabIndex=i===n?0:-1;});
    root.querySelectorAll("video").forEach(function(v){if(!v.paused)v.pause();});
    if(focus)tabs[n].focus();
  }
  var all=document.createElement("button");all.type="button";all.className="btn sm jx-all-btn";var noun=root.dataset.noun||"stages";all.textContent="Show all "+panels.length+" "+noun;all.setAttribute("aria-pressed","false");
  all.addEventListener("click",function(){var on=!root.classList.contains("show-all");root.classList.toggle("show-all",on);all.setAttribute("aria-pressed",on);all.textContent=on?"Back to one at a time":"Show all "+panels.length+" "+noun;});
  root.querySelector(".jx-slot").appendChild(all);
  root.classList.add("jx-js");
  root.querySelector(".jx-slot").appendChild(list);
  sel(0,false);
});

/* expand / collapse all detail blocks; also opened for printing */
var ex=document.querySelector("[data-expand-all]"),prev=[];
function setAll(open){document.querySelectorAll("details.deep").forEach(function(d){d.open=open;});}
if(ex){ex.addEventListener("click",function(){var open=ex.dataset.state!=="open";setAll(open);ex.dataset.state=open?"open":"";ex.textContent=open?"Collapse details":"Expand all details";});}
window.addEventListener("beforeprint",function(){prev=[].map.call(document.querySelectorAll("details"),function(d){var o=d.open;d.open=true;return o;});document.querySelectorAll(".jx").forEach(function(r){r.classList.add("show-all");});});
window.addEventListener("afterprint",function(){document.querySelectorAll("details").forEach(function(d,i){d.open=prev[i];});document.querySelectorAll(".jx").forEach(function(r){r.classList.remove("show-all");});});

/* Alibaba explorers (values come from DATA, which is traceable to the notebook) */
var D=window.DATA&&window.DATA.alibaba;
function bar(label,v,cls){return '<div class="xp-row"><span class="lab">'+label+'</span><span class="xp-track"><span class="xp-fill '+cls+'" style="width:'+(v*100).toFixed(1)+'%"></span></span><span class="xp-val">'+v.toFixed(3)+'</span></div>';}
function group(host,label,items,render){
  var ctl=document.createElement("div");ctl.className="xp-ctl";ctl.setAttribute("role","group");ctl.setAttribute("aria-label",label);
  var out=document.createElement("div");out.setAttribute("aria-live","polite");
  var bs=items.map(function(it,i){var b=document.createElement("button");b.type="button";b.className="xp-btn";b.textContent=it.label;b.setAttribute("aria-pressed","false");
    b.addEventListener("click",function(){pick(i);});ctl.appendChild(b);return b;});
  function pick(i){bs.forEach(function(b,k){b.setAttribute("aria-pressed",k===i);});out.innerHTML=render(items[i]);}
  host.appendChild(ctl);host.appendChild(out);return pick;
}
var hk=document.querySelector('[data-xp="k"]');
if(hk&&D){
  var H=D.hit,items=H.k.map(function(k,i){return {label:"Top-"+k,k:k,a:H.age[i],b:H.base[i]};});
  var BASIS='Basis: user-level offline evaluation (test n='+H.nTest+'); lists built from training users only; the age-based list assumes the user’s true age band is known; a hit means at least one category the user actually bought is in the top K for their band; baseline is a global-popularity list of the same length; one random split, no confidence interval.';
  var pk=group(hk,"Choose list length K",items,function(it){
    var d=(it.a-it.b)*100,n=Math.round(Math.abs(d)/100*H.nTest),ahead=d>0?"age-based list":"popularity baseline";
    return '<div class="xp-legend"><span><i style="background:var(--data)"></i>Age-based list</span><span><i style="background:var(--data2)"></i>Global popularity</span></div>'+
      bar("Age-based, Top-"+it.k,it.a,"a")+bar("Popularity, Top-"+it.k,it.b,"b")+
      '<p class="xp-read"><b>'+(d>0?"+":"−")+Math.abs(d).toFixed(1)+' percentage points for the '+ahead+'</b>, about '+n+' of '+H.nTest+' test users. '+(it.k===20?'This is the observation I highlight, with the caveat that it comes from a single split.':'In one split of '+H.nTest+' users, a gap this size is a few users.')+'</p>'+
      '<p class="xp-basis">'+BASIS+' Not a measure of clicks, conversion or revenue.</p>';});
  pk(2);
}
var hm=document.querySelector('[data-xp="models"]');
if(hm&&D){
  var M=D.models,NOTE={"Dummy (most frequent)":"Always predicts the most frequent band, so its accuracy is the bar any model must beat.","Logistic regression":"Highest accuracy, but it almost never identifies the 6–18 band.","Logistic, class-weighted":"Raises 6–18 recall, but lowers overall accuracy and adds false positives.","Random forest":"Did not beat logistic regression, and fit the training set much better (training accuracy 0.691, test 0.524)."};
  var it2=M.map(function(m){return {label:m.name.replace(" (most frequent)",""),m:m};});
  var pm=group(hm,"Choose a model",it2,function(it){var m=it.m,r=''+bar("Accuracy",m.acc,"a")+bar("Macro F1",m.f1,"a");
    D.classes.forEach(function(c,i){r+=bar("Recall "+c+" (n="+D.support[i]+")",m.recall[i],"a");});
    return r+'<p class="xp-read">'+(NOTE[m.name]||"")+' <span class="muted">Dummy baseline for reference: accuracy '+M[0].acc.toFixed(3)+', macro F1 '+M[0].f1.toFixed(3)+'.</span></p><p class="xp-basis">Basis: user-level stratified 80/20 split, test n=191 users; recall is the share of each band correctly identified; bars start at 0. My read: with this sample and these features, purchase behaviour does not reliably reveal a child’s age.</p>';});
  pm(1);
}
document.querySelectorAll("details.deep[open],details[data-ac]").forEach(function(d){if(!matchMedia("print").matches)d.open=false;});

/* entry tracks: ?track=games or the switch under the hero buttons; same content, different emphasis and order */
var trkBtns=[].slice.call(document.querySelectorAll(".trk"));
if(trkBtns.length){
  var featured=null;
  function setTrack(t,push){
    doc.setAttribute("data-track",t);
    trkBtns.forEach(function(b){b.setAttribute("aria-pressed",b.dataset.track===t);});
    var src=document.getElementById("gram-mini"),head=document.querySelector("#work .sec-head");
    if(featured){featured.remove();featured=null;}
    if(t==="games"&&src&&head){featured=src.cloneNode(true);featured.removeAttribute("id");featured.classList.add("featured");head.insertAdjacentElement("afterend",featured);}
    if(push){try{var u=new URL(location.href);if(t==="games")u.searchParams.set("track","games");else u.searchParams.delete("track");history.replaceState(null,"",u);}catch(e){}}
  }
  trkBtns.forEach(function(b){b.addEventListener("click",function(){setTrack(b.dataset.track,true);});});
  var q=new URLSearchParams(location.search).get("track");
  setTrack(q==="games"?"games":"all",false);
}
})();
