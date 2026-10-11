/* Case-page interactions: journey/round/theme explorer, expand-all, Alibaba list-length and model explorers.
   Progressive enhancement: with no JS every panel is readable. All strings bilingual; rebuilt on "statechange". */
(function(){
"use strict";
var doc=document.documentElement, I=window.I18N, B=I.B, L=window.SITE_L||{};
var reduceMotion=matchMedia("(prefers-reduced-motion: reduce)").matches;
var EASE="cubic-bezier(.22,.75,.2,1)";
var rebuilders=[];
/* only one video plays at a time */
document.addEventListener("play",function(e){var t=e.target;if(!t||t.tagName!=="VIDEO")return;[].forEach.call(document.querySelectorAll("video"),function(v){if(v!==t&&!v.paused)v.pause();});},true);
doc.addEventListener("statechange",function(){rebuilders.forEach(function(f){f();});});

/* ---- explorer: one panel at a time, tabs with arrow-key support, "show all" toggle ---- */
document.querySelectorAll("[data-explorer]").forEach(function(root){
  var panels=[].slice.call(root.querySelectorAll(".jx-panel")); if(!panels.length) return;
  var list=document.createElement("div");list.className="jx-tabs";list.setAttribute("role","tablist");
  var cur=0, first=true;
  var tabs=panels.map(function(p,i){
    var t=document.createElement("button");t.type="button";t.className="jx-tab";t.setAttribute("role","tab");t.id=p.id+"-tab";t.setAttribute("aria-controls",p.id);
    t.innerHTML='<span class="no"></span><span class="lbl"></span>';
    p.setAttribute("role","tabpanel");p.setAttribute("aria-labelledby",t.id);
    t.addEventListener("click",function(){sel(i,false);});
    t.addEventListener("keydown",function(e){var n=null;
      if(e.key==="ArrowRight"||e.key==="ArrowDown")n=(i+1)%panels.length;else if(e.key==="ArrowLeft"||e.key==="ArrowUp")n=(i-1+panels.length)%panels.length;else if(e.key==="Home")n=0;else if(e.key==="End")n=panels.length-1;
      if(n!==null){e.preventDefault();sel(n,true);}});
    list.appendChild(t);return t;});
  function labels(){
    list.setAttribute("aria-label",root.getAttribute("data-explorer")||"");
    tabs.forEach(function(t,i){t.querySelector(".no").textContent=panels[i].dataset.no||i+1;t.querySelector(".lbl").textContent=panels[i].getAttribute("data-short")||"";});
    var noun=root.getAttribute("data-noun")||"";
    all.textContent=root.classList.contains("show-all")?(I.lang==="en"?"Back to one at a time":"回到逐项查看"):(I.lang==="en"?"Show all "+panels.length+" "+noun:"显示全部 "+panels.length+" "+noun);
  }
  /* elements elsewhere in the module that belong to a panel (data-k) light up with it; show-all lights all */
  function syncK(){
    var key=panels[cur].getAttribute("data-k")||panels[cur].id, every=root.classList.contains("show-all");
    [].forEach.call(root.querySelectorAll("[data-k]"),function(e){
      if(e.classList.contains("jx-panel"))return;
      e.classList.toggle("is-on",every||(" "+e.getAttribute("data-k")+" ").indexOf(" "+key+" ")>-1);});
  }
  function sel(n,focus){
    cur=n;
    panels.forEach(function(p,i){p.hidden=i!==n;tabs[i].setAttribute("aria-selected",i===n);tabs[i].tabIndex=i===n?0:-1;});
    root.querySelectorAll("video").forEach(function(v){if(!v.paused)v.pause();});
    root.setAttribute("data-sel",panels[n].id);syncK();
    moveInd(first);
    if(focus)tabs[n].focus();
    if(first){first=false;}else if(!reduceMotion&&panels[n].animate){var P=panels[n];P.animate([{opacity:0,transform:"translateY(6px)"},{opacity:1,transform:"none"}],{duration:220,easing:EASE});
      [].forEach.call(P.querySelectorAll(".jx-row"),function(r,i){r.animate([{opacity:0,transform:"translateY(8px)"},{opacity:1,transform:"none"}],{duration:260,delay:40+i*55,easing:EASE,fill:"backwards"});});}
  }
  /* selection indicator bar that slides between tabs */
  var ind=document.createElement("span");ind.className="jx-ind";ind.setAttribute("aria-hidden","true");list.appendChild(ind);
  function moveInd(instant){
    var t=tabs[cur]; if(!t||!t.offsetWidth){return;}
    if(instant||reduceMotion)ind.style.transition="none";
    ind.style.transform="translate("+t.offsetLeft+"px,"+(t.offsetTop+t.offsetHeight-3)+"px)";ind.style.width=t.offsetWidth+"px";
    if(instant||reduceMotion){void ind.offsetWidth;ind.style.transition="";}
  }
  var all=document.createElement("button");all.type="button";all.className="btn sm jx-all-btn";all.setAttribute("aria-pressed","false");
  all.addEventListener("click",function(){var on=!root.classList.contains("show-all");root.classList.toggle("show-all",on);all.setAttribute("aria-pressed",on);labels();syncK();});
  root.querySelector(".jx-slot").appendChild(all);
  root.classList.add("jx-js");
  root.querySelector(".jx-slot").appendChild(list);
  labels(); sel(0,false);
  window.addEventListener("resize",function(){moveInd(true);});
  rebuilders.push(function(){labels();moveInd(true);});
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){moveInd(true);});
});

/* ---- expand / collapse all detail blocks; everything is opened for printing ---- */
var ex=document.querySelector("[data-expand-all]"),prev=[];
function setAll(open){document.querySelectorAll("details.deep").forEach(function(d){d.open=open;});}
if(ex){ex.addEventListener("click",function(){var open=ex.getAttribute("aria-pressed")!=="true";setAll(open);ex.setAttribute("aria-pressed",String(open));});}
window.addEventListener("beforeprint",function(){prev=[].map.call(document.querySelectorAll("details"),function(d){var o=d.open;d.open=true;return o;});document.querySelectorAll(".jx").forEach(function(r){r.classList.add("show-all");});});
window.addEventListener("afterprint",function(){document.querySelectorAll("details").forEach(function(d,i){d.open=prev[i];});document.querySelectorAll(".jx").forEach(function(r){r.classList.remove("show-all");});});

/* ---- Alibaba explorers (values come from DATA, traceable to the notebook) ---- */
var D=window.DATA&&window.DATA.alibaba;
function bar(label,v,cls,ref){return '<div class="xp-row"><span class="lab">'+label+'</span><span class="xp-track"><span class="xp-fill '+cls+'" data-w="'+(v*100).toFixed(1)+'" style="width:0"></span>'+(ref==null?'':'<span class="xp-ref" style="left:'+(ref*100).toFixed(1)+'%"></span>')+'</span><span class="xp-val">'+v.toFixed(3)+'</span></div>';}
function group(host,label,items,render,start){
  var ctl=document.createElement("div");ctl.className="xp-ctl";ctl.setAttribute("role","group");
  var out=document.createElement("div");out.setAttribute("aria-live","polite");
  var cur=start||0;
  var bs=items.map(function(it,i){var b=document.createElement("button");b.type="button";b.className="xp-btn";b.setAttribute("aria-pressed","false");
    b.addEventListener("click",function(){cur=i;draw(true);});ctl.appendChild(b);return b;});
  function draw(anim){
    ctl.setAttribute("aria-label",I.lang==="en"?label[1]:label[0]);
    bs.forEach(function(b,k){b.textContent=I.lang==="en"?items[k].label[1]:items[k].label[0];b.setAttribute("aria-pressed",k===cur);});
    out.innerHTML=render(items[cur]);
    var fills=out.querySelectorAll(".xp-fill[data-w]");
    if(anim===true&&!reduceMotion){requestAnimationFrame(function(){requestAnimationFrame(function(){[].forEach.call(fills,function(f){f.style.width=f.dataset.w+"%";});});});}
    else [].forEach.call(fills,function(f){f.style.transition="none";f.style.width=f.dataset.w+"%";});
  }
  host.appendChild(ctl);host.appendChild(out);rebuilders.push(function(){draw(false);});draw(false);
}
var hk=document.querySelector('[data-xp="k"]');
if(hk&&D){
  var H=D.hit,items=H.k.map(function(k,i){return {label:["Top-"+k,"Top-"+k],k:k,a:H.age[i],b:H.base[i]};});
  group(hk,["选择列表长度 K","Choose list length K"],items,function(it){
    var d=(it.a-it.b)*100,n=Math.round(Math.abs(d)/100*H.nTest),ahead=d>0;
    var sg=(d>0?"+":"−")+Math.abs(d).toFixed(1);
    var strip='<div class="xp-strip" role="list">'+items.map(function(o){var dd=(o.a-o.b)*100,up=dd>0;return '<span role="listitem" class="'+(o.k===it.k?'is-on ':'')+(up?'up':'down')+'"><b>Top-'+o.k+'</b><i>'+(up?'+':'−')+Math.abs(dd).toFixed(1)+B(' 点',' pts')+'</i></span>';}).join("")+'</div>';
    return strip+'<div class="xp-legend"><span><i style="background:var(--data)"></i>'+B('按年龄的列表','Age-based list')+'</span><span><i style="background:var(--data2)"></i>'+B('全局热门','Global popularity')+'</span></div>'+
      bar(B('按年龄，Top-','Age-based, Top-')+it.k,it.a,"a")+bar(B('全局热门，Top-','Popularity, Top-')+it.k,it.b,"b")+
      '<p class="xp-read"><b>'+B(ahead?'按年龄的列表高 '+sg.replace("+","")+' 个百分点':'全局热门列表高 '+Math.abs(d).toFixed(1)+' 个百分点',sg+' percentage points for the '+(ahead?'age-based list':'popularity baseline'))+'</b>'+B('，约相当于 '+H.nTest+' 位测试用户中的 '+n+' 人。',', about '+n+' of '+H.nTest+' test users. ')+' '+
        (it.k===20?B('这是我重点指出的观察，但它只来自一次划分。','This is the observation I highlight, with the caveat that it comes from a single split.'):B('在一次 '+H.nTest+' 位用户的划分里，这个差距只相当于几位用户。','In one split of '+H.nTest+' users, a gap this size is a few users.'))+'</p>'+
      '<p class="xp-basis">'+B('依据：用户层面的离线评估（测试 n='+H.nTest+'）；列表只由训练用户生成；按年龄的列表假定已知用户真实的年龄段；“命中”指用户实际购买过的品类中至少有一个出现在其年龄段的 Top-K 里；基线是同样长度的全局热门列表；只有一次随机划分，没有置信区间。这不是点击、转化或收入的衡量。','Basis: user-level offline evaluation (test n='+H.nTest+'); lists built from training users only; the age-based list assumes the user’s true age band is known; a hit means at least one category the user actually bought is in the top K for their band; baseline is a global-popularity list of the same length; one random split, no confidence interval. Not a measure of clicks, conversion or revenue.')+'</p>';
  },2);
}
var hm=document.querySelector('[data-xp="models"]');
if(hm&&D){
  var M=D.models;
  var NOTE={
    "Dummy (most frequent)":['总是预测最常见的年龄段，所以它的准确率就是任何模型都必须超过的门槛。','Always predicts the most frequent band, so its accuracy is the bar any model must beat.'],
    "Logistic regression":['准确率最高，但几乎认不出 6–18 岁这一段。','Highest accuracy, but it almost never identifies the 6–18 band.'],
    "Logistic, class-weighted":['提高了 6–18 岁的召回率，但整体准确率下降，误报增加。','Raises 6–18 recall, but lowers overall accuracy and adds false positives.'],
    "Random forest":['没有超过逻辑回归，而且对训练集的拟合明显更好（训练准确率 0.691，测试 0.524）。','Did not beat logistic regression, and fit the training set much better (training accuracy 0.691, test 0.524).']};
  var it2=M.map(function(m){return {label:[(L.MODEL_SHORT_ZH||{})[m.name]||m.name,m.name.replace(" (most frequent)","")],m:m};});
  group(hm,["选择模型","Choose a model"],it2,function(it){
    var m=it.m,r0=M[0],r='<div class="xp-legend"><span><i class="xp-key"></i>'+B('竖线 = 基线（总预测最常见年龄段）','Tick = dummy baseline (always the most frequent band)')+'</span></div>'+bar(B('准确率','Accuracy'),m.acc,"a",r0.acc)+bar(B('宏平均 F1','Macro F1'),m.f1,"a",r0.f1);
    D.classes.forEach(function(c,i){r+=bar(B('召回率 '+(L.CLASS_ZH||{})[c]+'（n='+D.support[i]+'）','Recall '+c+' (n='+D.support[i]+')'),m.recall[i],"a",r0.recall[i]);});
    var nt=NOTE[m.name]||['',''];
    return r+'<p class="xp-read">'+B(nt[0],nt[1])+' <span class="muted">'+B('作为参照，基线的准确率为 '+M[0].acc.toFixed(3)+'，宏平均 F1 为 '+M[0].f1.toFixed(3)+'。','Dummy baseline for reference: accuracy '+M[0].acc.toFixed(3)+', macro F1 '+M[0].f1.toFixed(3)+'.')+'</span></p>'+
      '<p class="xp-basis">'+B('依据：按用户分层的 80/20 划分，测试集 191 位用户；召回率是每个年龄段被正确识别的比例；柱子从 0 起算。我的判断：就这个样本和这些特征而言，购买行为并不能可靠地反映孩子的年龄。','Basis: user-level stratified 80/20 split, test n=191 users; recall is the share of each band correctly identified; bars start at 0.')+'</p>';
  },1);
}
document.querySelectorAll("details.deep[open],details[data-ac]").forEach(function(d){if(!matchMedia("print").matches)d.open=false;});
})();
