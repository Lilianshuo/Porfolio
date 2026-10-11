(function(){
  "use strict";
  var doc=document.documentElement;
  var reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
  var qs=new URLSearchParams(location.search);
  if(qs.get("mode")==="final") doc.setAttribute("data-mode","final");
  var final=function(){return doc.getAttribute("data-mode")==="final";};

  /* ---------- keep ?mode=final on internal navigation (re-run after language swaps) ---------- */
  function keepMode(){
    if(qs.get("mode")!=="final") return;
    document.querySelectorAll('a[href]').forEach(function(a){
      var h=a.getAttribute("href");
      if(!h||/^(https?:|mailto:|tel:|#)/.test(h)||a.hasAttribute("download")||!/\.html(#|$)/.test(h)||/mode=final/.test(h)) return;
      var i=h.indexOf("#"), path=i<0?h:h.slice(0,i), hash=i<0?"":h.slice(i);
      a.setAttribute("href",path+(path.indexOf("?")<0?"?":"&")+"mode=final"+hash);
    });
  }

  /* ---------- language (home + chrome; project bodies stay English until data-zh is added) ---------- */
  var lang="zh"; try{lang=localStorage.getItem("lang")||"zh";}catch(e){}
  function applyLang(l){
    lang=l;
    document.querySelectorAll("[data-zh]").forEach(function(el){
      if(el.dataset.en===undefined) el.dataset.en=el.innerHTML;
      el.innerHTML = l==="zh" ? el.dataset.zh : el.dataset.en;
    });
    var isHome=document.body.hasAttribute("data-home");
    if(isHome) doc.lang = l==="zh"?"zh-CN":"en";
    var b=document.getElementById("langBtn"); if(b){b.textContent=l==="zh"?"EN":"中文"; b.setAttribute("aria-label",l==="zh"?"Switch to English":"切换为中文");}
    try{localStorage.setItem("lang",l);}catch(e){}
    keepMode();
  }
  var lb=document.getElementById("langBtn");
  if(lb) lb.addEventListener("click",function(){applyLang(lang==="zh"?"en":"zh");});
  applyLang(lang);

  /* ---------- mobile menu ---------- */
  var mb=document.querySelector(".menu-btn"), nav=document.querySelector(".nav");
  if(mb&&nav){
    mb.addEventListener("click",function(){var o=nav.classList.toggle("open");mb.setAttribute("aria-expanded",o);});
    nav.addEventListener("click",function(e){if(e.target.closest("a")){nav.classList.remove("open");mb.setAttribute("aria-expanded","false");}});
    document.addEventListener("keydown",function(e){if(e.key==="Escape"){nav.classList.remove("open");mb.setAttribute("aria-expanded","false");}});
  }

  /* ---------- image slots: show dashed placeholder in review mode, hide in final ---------- */
  var slots=[].slice.call(document.querySelectorAll(".slot"));
  function slotState(s){
    var img=s.querySelector("img"); if(!img) return;
    var bad=function(){s.classList.add("missing");check();};
    var ok=function(){s.classList.remove("missing");check();};
    if(img.complete){ img.naturalWidth===0?bad():ok(); }
    img.addEventListener("error",bad); img.addEventListener("load",ok);
  }
  function check(){
    var hero=document.querySelector(".hero");
    var ph=document.querySelector(".hero .photo");
    if(hero&&ph) hero.classList.toggle("nophoto", ph.classList.contains("missing")&&final());
    document.querySelectorAll("[data-needs-img]").forEach(function(sec){
      var any=sec.querySelector(".slot:not(.missing)");
      sec.classList.toggle("pending", !any);
    });
  }
  slots.forEach(slotState); check();

  /* ---------- lightbox ---------- */
  var dlg=document.createElement("dialog"); dlg.className="lb"; dlg.setAttribute("aria-label","Image viewer");
  dlg.innerHTML='<button type="button" aria-label="Close">Close ✕</button><img alt=""><p></p>';
  document.body.appendChild(dlg);
  var dimg=dlg.querySelector("img"), dcap=dlg.querySelector("p");
  dlg.querySelector("button").addEventListener("click",function(){dlg.close();});
  dlg.addEventListener("click",function(e){if(e.target===dlg)dlg.close();});
  var lastFocus=null;
  dlg.addEventListener("close",function(){if(lastFocus)lastFocus.focus();});
  document.addEventListener("click",function(e){
    var z=e.target.closest(".zoom"); if(!z) return;
    var im=z.querySelector("img"); if(!im||!dlg.showModal) return;
    lastFocus=z; dimg.src=im.currentSrc||im.src; dimg.alt=im.alt;
    var f=z.closest("figure"); var c=f&&f.querySelector("figcaption"); dcap.textContent=c?c.textContent:im.alt;
    dlg.showModal();
  });

  /* ---------- charts ---------- */
  var D=window.DATA||{};
  var pct=function(v,d){return (v*100).toFixed(d==null?1:d).replace(/\.0$/,"")+"%";};
  var el=function(h){var t=document.createElement("div");t.innerHTML=h.trim();return t.firstChild;};
  var charts={
    coverage:function(host){
      var a=D.alibaba, p=a.labelledRows/a.totalRows*100;
      host.innerHTML='<div class="stack" role="img" aria-label="Age-matched records are '+p.toFixed(1)+' percent of all records"><div style="background:var(--accent)" data-w="'+Math.max(p,3.2)+'">'+p.toFixed(1)+'%</div></div>'+
        '<p class="small muted" style="margin:0">'+a.labelledRows.toLocaleString()+' of '+a.totalRows.toLocaleString()+' transaction records had a usable child-age label (users: '+a.labelledUsers+' of '+a.totalUsers.toLocaleString()+').</p>';
    },
    ageDist:function(host){
      var rows=D.alibaba.ageDist, max=Math.max.apply(null,rows.map(function(r){return r.n;}));
      host.innerHTML=rows.map(function(r){
        return '<div class="hb"><span>'+r.l+'</span><div class="track"><div class="fill'+(r.flag?' lite':'')+'" data-w="'+(r.n/max*100)+'"></div></div><span class="val">n='+r.n+(r.flag?' *':'')+'</span></div>';
      }).join("")+'<p class="small muted" style="margin:.6rem 0 0">* very small groups: interpret with caution.</p>';
    },
    models:function(host){
      var m=D.alibaba.models;
      host.innerHTML='<div class="legend"><span><i style="background:var(--data)"></i>Accuracy</span><span><i style="background:var(--accent)"></i>Macro F1</span></div>'+
        '<div class="gb">'+m.map(function(x){return '<div class="g"><div class="bars"><div class="bar" data-h="'+x.acc/0.8*100+'"><span>'+x.acc.toFixed(3)+'</span></div><div class="bar c2" data-h="'+x.f1/0.8*100+'"><span>'+x.f1.toFixed(3)+'</span></div></div></div>';}).join("")+'</div>'+
        '<div class="gb-labels">'+m.map(function(x){return '<div>'+x.name+'</div>';}).join("")+'</div>';
    },
    recall:function(host){
      var a=D.alibaba, ser=["","c1","c2","c3"];
      host.innerHTML='<div class="legend">'+a.models.map(function(x,i){return '<span><i class="'+ser[i]+'" style="background:'+['var(--data)','var(--data2)','var(--accent)','#C9A24B'][i]+'"></i>'+x.name+'</span>';}).join("")+'</div>'+
        '<div class="gb">'+a.classes.map(function(c,ci){return '<div class="g"><div class="bars">'+a.models.map(function(x,i){return '<div class="bar '+ser[i]+'" data-h="'+x.recall[ci]*100+'" style="'+(i===0?'background:var(--data)':'')+'"><span>'+x.recall[ci].toFixed(2)+'</span></div>';}).join("")+'</div></div>';}).join("")+'</div>'+
        '<div class="gb-labels">'+a.classes.map(function(c,i){return '<div>'+c+'<small>test n='+a.support[i]+'</small></div>';}).join("")+'</div>';
    },
    hit:function(host){
      var h=D.alibaba.hit;
      host.innerHTML='<div class="legend"><span><i style="background:var(--data)"></i>Age-based Top-K</span><span><i style="background:var(--data2)"></i>Global-popularity baseline</span></div>'+
        '<div class="gb">'+h.k.map(function(k,i){return '<div class="g"><div class="bars"><div class="bar" data-h="'+h.age[i]/0.6*100+'"><span>'+h.age[i].toFixed(3)+'</span></div><div class="bar c1" data-h="'+h.base[i]/0.6*100+'"><span>'+h.base[i].toFixed(3)+'</span></div></div></div>';}).join("")+'</div>'+
        '<div class="gb-labels">'+h.k.map(function(k,i){var d=(h.age[i]-h.base[i])*100;return '<div>Top-'+k+'<small>'+(d>=0?'+':'')+d.toFixed(1)+' pp</small></div>';}).join("")+'</div>';
    },
    continued:function(host){
      var p=D.calm.continuedLonger;
      host.innerHTML='<div class="stack" role="img" aria-label="'+p+' percent reported often continuing longer than intended"><div style="background:var(--data)" data-w="'+p+'">'+p+'%</div></div>'+
        '<p class="small muted" style="margin:0">Survey respondents who reported often continuing to use the phone longer than intended after checking (n='+D.calm.surveyN+', exploratory).</p>';
    },
    dots6:function(host){
      host.innerHTML='<div class="dots" role="img" aria-label="6 of 6 participants">'+'<i></i>'.repeat(6)+'</div><p class="small muted" style="margin:0">6 of 6 participants rated concept understanding 4–5 (usability test, n=6).</p>';
    }
  };
  document.querySelectorAll("[data-chart]").forEach(function(h){var f=charts[h.dataset.chart]; if(f) f(h);});
  function grow(scope){
    scope.querySelectorAll(".bar[data-h]").forEach(function(b){b.style.height=b.dataset.h+"%";});
    scope.querySelectorAll(".fill[data-w]").forEach(function(b){b.style.width=b.dataset.w+"%";});
    scope.querySelectorAll(".stack div[data-w]").forEach(function(b){b.style.width=b.dataset.w+"%";});
  }

  /* Content and chart values are visible by default; no scroll-triggered hiding. */
  grow(document);


  /* ---------- video captions (JS overlay: <track> does not load on file://) ---------- */
  document.querySelectorAll("video[data-cap]").forEach(function(v){
    var caps=(window.DATA&&DATA.captions&&DATA.captions[v.dataset.cap])||[]; if(!caps.length)return;
    var fig=v.closest(".nvid"), box=fig.querySelector(".capline"), btn=fig.querySelector(".cc"), on=true;
    var wrap=document.createElement("div"); wrap.className="vwrap"; v.parentNode.insertBefore(wrap,v); wrap.appendChild(v); wrap.appendChild(box);
    function upd(){var t=v.currentTime,txt="";if(on)for(var i=0;i<caps.length;i++){if(t>=caps[i][0]&&t<=caps[i][1]){txt=caps[i][2];break;}}box.textContent=txt;box.hidden=!txt;}
    v.addEventListener("timeupdate",upd);v.addEventListener("seeked",upd);v.addEventListener("ended",upd);
    btn.addEventListener("click",function(){on=!on;btn.setAttribute("aria-pressed",on);upd();});
    var pb=document.createElement("button");pb.type="button";pb.className="vplay";pb.setAttribute("aria-label","Play video");pb.innerHTML="<span aria-hidden=\"true\">▶</span>";wrap.appendChild(pb);
    pb.addEventListener("click",function(){var r=v.play();if(r&&r.catch)r.catch(function(){pb.hidden=false;});});
    v.addEventListener("play",function(){pb.hidden=true;});v.addEventListener("ended",function(){pb.hidden=false;});
    v.addEventListener("pause",function(){if(v.currentTime===0)pb.hidden=false;});
  });
  /* ---------- table-of-contents highlight ---------- */
  var toc=[].slice.call(document.querySelectorAll(".toc a"));
  if(toc.length&&"IntersectionObserver" in window){
    var map={}; toc.forEach(function(a){map[a.getAttribute("href").slice(1)]=a;});
    var so=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){toc.forEach(function(a){a.removeAttribute("aria-current");});var a=map[e.target.id]; if(a)a.setAttribute("aria-current","true");}});},{rootMargin:"-20% 0px -70% 0px"});
    Object.keys(map).forEach(function(id){var s=document.getElementById(id); if(s)so.observe(s);});
  }
})();
