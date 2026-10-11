/* Shared behaviour for case pages and the home page: image slots, lightbox, charts, video captions, contents highlight.
   Language and entry state live in i18n.js. Every string built here is bilingual (I18N.B) and rebuilt on "statechange". */
(function(){
  "use strict";
  var doc=document.documentElement, I=window.I18N, B=I?I.B:function(z,e){return e;};
  var qs=new URLSearchParams(location.search);
  if(qs.get("mode")==="final") doc.setAttribute("data-mode","final");

  /* ---------- image slots: hidden when the file is missing ---------- */
  var slots=[].slice.call(document.querySelectorAll(".slot"));
  function slotState(s){
    var img=s.querySelector("img"); if(!img) return;
    var bad=function(){s.classList.add("missing");check();};
    var ok=function(){s.classList.remove("missing");check();};
    if(img.complete){ img.naturalWidth===0?bad():ok(); }
    img.addEventListener("error",bad); img.addEventListener("load",ok);
  }
  function check(){
    document.querySelectorAll("[data-needs-img]").forEach(function(sec){
      sec.classList.toggle("pending", !sec.querySelector(".slot:not(.missing)"));
    });
  }
  slots.forEach(slotState); check();

  /* ---------- lightbox ---------- */
  var dlg=document.createElement("dialog"); dlg.className="lb";
  dlg.innerHTML='<button type="button"></button><img alt=""><p></p>';
  document.body.appendChild(dlg);
  var dimg=dlg.querySelector("img"), dcap=dlg.querySelector("p"), dbtn=dlg.querySelector("button");
  function lbText(){dlg.setAttribute("aria-label",I.lang==="en"?"Image viewer":"图片查看器");dbtn.setAttribute("aria-label",I.lang==="en"?"Close":"关闭");dbtn.textContent=I.lang==="en"?"Close ×":"关闭 ×";}
  lbText();
  dbtn.addEventListener("click",function(){dlg.close();});
  dlg.addEventListener("click",function(e){if(e.target===dlg)dlg.close();});
  var lastFocus=null;
  dlg.addEventListener("close",function(){if(lastFocus)lastFocus.focus();});
  document.addEventListener("click",function(e){
    var z=e.target.closest(".zoom"); if(!z) return;
    var im=z.querySelector("img"); if(!im||!dlg.showModal) return;
    lastFocus=z; dimg.src=im.currentSrc||im.src; dimg.alt=im.alt;
    var f=z.closest("figure"); var c=f&&f.querySelector("figcaption");
    dcap.textContent=c?(c.innerText||c.textContent):im.alt;
    dlg.showModal();
  });

  /* ---------- charts (values from DATA; all labels bilingual) ---------- */
  var D=window.DATA||{};
  var n0=function(n){return n.toLocaleString("en-US");};
  var CLASS_ZH={"0–3 yr":"0–3 岁","3–6 yr":"3–6 岁","6–18 yr":"6–18 岁"};
  var AGE_ZH={"0–1 yr":"0–1 岁","1–3 yr":"1–3 岁","3–6 yr":"3–6 岁","6–12 yr":"6–12 岁","12–18 yr":"12–18 岁"};
  var MODEL_ZH={"Dummy (most frequent)":"基线（总猜最多的一类）","Logistic regression":"逻辑回归","Logistic, class-weighted":"逻辑回归（类别加权）","Random forest":"随机森林"};
  var MODEL_SHORT_ZH={"Dummy (most frequent)":"基线","Logistic regression":"逻辑回归","Logistic, class-weighted":"加权逻辑回归","Random forest":"随机森林"};
  var MODEL_SHORT_EN={"Dummy (most frequent)":"Dummy","Logistic regression":"Logistic","Logistic, class-weighted":"Logistic, weighted","Random forest":"Random forest"};
  window.SITE_L={CLASS_ZH:CLASS_ZH,MODEL_ZH:MODEL_ZH,AGE_ZH:AGE_ZH,MODEL_SHORT_ZH:MODEL_SHORT_ZH,MODEL_SHORT_EN:MODEL_SHORT_EN};
  var cb=function(c){return B(CLASS_ZH[c]||c,c);};
  var charts={
    coverage:function(host){
      var a=D.alibaba, p=a.labelledRows/a.totalRows*100, ps=p.toFixed(1);
      host.innerHTML='<div class="stack" role="img" aria-label="'+(I.lang==="en"?"Age-matched records are "+ps+" percent of all records":"带年龄标签的记录占全部记录的 "+ps+"%")+'"><div style="background:var(--accent)" data-w="'+Math.max(p,3.2)+'"></div><span class="stack-lab">'+ps+'%</span></div>'+
        '<p class="small muted" style="margin:0">'+B(n0(a.totalRows)+' 条交易记录中，有 '+n0(a.labelledRows)+' 条带可用的孩子年龄标签（用户：'+n0(a.totalUsers)+' 人中的 '+a.labelledUsers+' 人）。',n0(a.labelledRows)+' of '+n0(a.totalRows)+' transaction records had a usable child-age label (users: '+a.labelledUsers+' of '+n0(a.totalUsers)+').')+'</p>';
    },
    ageDist:function(host){
      var rows=D.alibaba.ageDist, max=Math.max.apply(null,rows.map(function(r){return r.n;}));
      host.innerHTML=rows.map(function(r){
        return '<div class="hb"><span>'+B(AGE_ZH[r.l]||r.l,r.l)+'</span><div class="track"><div class="fill'+(r.flag?' lite':'')+'" data-w="'+(r.n/max*100)+'"></div></div><span class="val">n='+r.n+(r.flag?' *':'')+'</span></div>';
      }).join("")+'<p class="small muted" style="margin:.6rem 0 0">'+B('* 样本量很小：解读时需谨慎。','* very small groups: interpret with caution.')+'</p>';
    },
    models:function(host){
      var m=D.alibaba.models;
      host.innerHTML='<div class="legend"><span><i style="background:var(--data)"></i>'+B('准确率','Accuracy')+'</span><span><i style="background:var(--accent)"></i>'+B('宏平均 F1','Macro F1')+'</span></div>'+
        '<div class="gb">'+m.map(function(x){return '<div class="g"><div class="bars"><div class="bar" data-h="'+x.acc/0.8*100+'"><span>'+x.acc.toFixed(3)+'</span></div><div class="bar c2" data-h="'+x.f1/0.8*100+'"><span>'+x.f1.toFixed(3)+'</span></div></div></div>';}).join("")+'</div>'+
        '<div class="gb-labels">'+m.map(function(x){return '<div>'+B(MODEL_SHORT_ZH[x.name]||x.name,MODEL_SHORT_EN[x.name]||x.name)+'</div>';}).join("")+'</div>';
    },
    recall:function(host){
      var a=D.alibaba, ser=["","c1","c2","c3"];
      host.innerHTML='<div class="legend">'+a.models.map(function(x,i){return '<span><i class="'+ser[i]+'" style="background:'+['var(--data)','var(--data2)','var(--accent)','#C9A24B'][i]+'"></i>'+B(MODEL_SHORT_ZH[x.name]||x.name,MODEL_SHORT_EN[x.name]||x.name)+'</span>';}).join("")+'</div>'+
        '<div class="gb">'+a.classes.map(function(c,ci){return '<div class="g"><div class="bars">'+a.models.map(function(x,i){return '<div class="bar '+ser[i]+'" data-h="'+x.recall[ci]*100+'" style="'+(i===0?'background:var(--data)':'')+'"><span>'+x.recall[ci].toFixed(2)+'</span></div>';}).join("")+'</div></div>';}).join("")+'</div>'+
        '<div class="gb-labels">'+a.classes.map(function(c,i){return '<div>'+cb(c)+'<small>'+B('测试 n=','test n=')+a.support[i]+'</small></div>';}).join("")+'</div>';
    },
    hit:function(host){
      var h=D.alibaba.hit;
      host.innerHTML='<div class="legend"><span><i style="background:var(--data)"></i>'+B('按年龄的 Top-K','Age-based Top-K')+'</span><span><i style="background:var(--data2)"></i>'+B('全局热门基线','Global-popularity baseline')+'</span></div>'+
        '<div class="gb">'+h.k.map(function(k,i){return '<div class="g"><div class="bars"><div class="bar" data-h="'+h.age[i]/0.6*100+'"><span>'+h.age[i].toFixed(3)+'</span></div><div class="bar c1" data-h="'+h.base[i]/0.6*100+'"><span>'+h.base[i].toFixed(3)+'</span></div></div></div>';}).join("")+'</div>'+
        '<div class="gb-labels">'+h.k.map(function(k,i){var d=(h.age[i]-h.base[i])*100;return '<div>Top-'+k+'<small>'+(d>=0?'+':'')+d.toFixed(1)+B(' 个百分点',' pp')+'</small></div>';}).join("")+'</div>';
    },
    continued:function(host){
      var p=D.calm.continuedLonger;
      host.innerHTML='<div class="stack" role="img" aria-label="'+(I.lang==="en"?p+" percent reported often continuing longer than intended":p+"% 的受访者表示经常比原本打算的用得更久")+'"><div style="background:var(--data)" data-w="'+p+'">'+p+'%</div></div>'+
        '<p class="small muted" style="margin:0">'+B('问卷受访者中，称查看手机后经常比原本打算的用得更久的比例（n='+D.calm.surveyN+'，探索性）。','Survey respondents who reported often continuing to use the phone longer than intended after checking (n='+D.calm.surveyN+', exploratory).')+'</p>';
    },
    dots6:function(host){
      host.innerHTML='<div class="dots" role="img" aria-label="'+(I.lang==="en"?"6 of 6 participants":"6 位参与者中的 6 位")+'">'+'<i></i>'.repeat(6)+'</div><p class="small muted" style="margin:0">'+B('6 位参与者全部将概念理解度评为 4–5（可用性测试，n=6）。','6 of 6 participants rated concept understanding 4–5 (usability test, n=6).')+'</p>';
    }
  };
  function grow(scope){
    scope.querySelectorAll(".bar[data-h]").forEach(function(b){b.style.height=b.dataset.h+"%";});
    scope.querySelectorAll(".fill[data-w]").forEach(function(b){b.style.width=b.dataset.w+"%";});
    scope.querySelectorAll(".stack div[data-w]").forEach(function(b){b.style.width=b.dataset.w+"%";});
  }
  function drawCharts(){
    document.querySelectorAll("[data-chart]").forEach(function(h){var f=charts[h.dataset.chart]; if(f&&D.alibaba){f(h);} });
    grow(document);
  }
  drawCharts();
  doc.addEventListener("statechange",function(){drawCharts();lbText();});

  /* ---------- video: custom play button, captions overlay (JS overlay: <track> does not load on file://) ---------- */
  document.querySelectorAll("video[data-cap]").forEach(function(v){
    var caps=(D.captions&&D.captions[v.dataset.cap])||[]; if(!caps.length) return;
    var capsZh=(D.captionsZh&&D.captionsZh[v.dataset.cap])||[];
    var fig=v.closest(".nvid"), box=fig.querySelector(".capline"), btn=fig.querySelector(".cc"), on=true;
    var wrap=document.createElement("div"); wrap.className="vwrap"; v.parentNode.insertBefore(wrap,v); wrap.appendChild(v); wrap.appendChild(box);
    function upd(){
      var t=v.currentTime,txt="",i,k=-1;
      if(on)for(i=0;i<caps.length;i++){if(t>=caps[i][0]&&t<=caps[i][1]){txt=caps[i][2];k=i;break;}}
      box.textContent="";
      if(txt){
        var e=document.createElement("span");e.lang="en";e.className="cap-en";e.textContent=txt;box.appendChild(e);
        if(I.lang!=="en"&&capsZh[k]){var z=document.createElement("span");z.lang="zh-CN";z.className="cap-zh";z.textContent=capsZh[k];box.appendChild(z);}
      }
      box.hidden=!txt;
    }
    v.addEventListener("timeupdate",upd);v.addEventListener("seeked",upd);v.addEventListener("ended",upd);
    doc.addEventListener("statechange",upd);
    btn.addEventListener("click",function(){on=!on;btn.setAttribute("aria-pressed",on);upd();});
    var pb=document.createElement("button");pb.type="button";pb.className="vplay";pb.innerHTML="<span aria-hidden=\"true\">▶</span>";wrap.appendChild(pb);
    function pbLabel(){pb.setAttribute("aria-label",I.lang==="en"?"Play video":"播放视频");}
    pbLabel(); doc.addEventListener("statechange",pbLabel);
    pb.addEventListener("click",function(){var r=v.play();if(r&&r.catch)r.catch(function(){pb.hidden=false;});});
    v.addEventListener("play",function(){pb.hidden=true;});v.addEventListener("ended",function(){pb.hidden=false;});
    v.addEventListener("pause",function(){if(v.currentTime===0)pb.hidden=false;});
  });

  /* ---------- contents highlight ---------- */
  var toc=[].slice.call(document.querySelectorAll(".toc a"));
  if(toc.length&&"IntersectionObserver" in window){
    var map={}; toc.forEach(function(a){map[a.getAttribute("href").slice(1)]=a;});
    var so=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){toc.forEach(function(a){a.removeAttribute("aria-current");});var a=map[e.target.id]; if(a)a.setAttribute("aria-current","true");}});},{rootMargin:"-20% 0px -70% 0px"});
    Object.keys(map).forEach(function(id){var s=document.getElementById(id); if(s)so.observe(s);});
  }
})();
