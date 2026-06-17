/* spectator-utils.js — shared utilities for Spectator tools */

/* ── Clipboard ───────────────────────────────────────────────────────────────
   Copy text to clipboard with button feedback.
   Falls back to selecting the #link input when the Clipboard API is unavailable. */
function clipCopy(text, btn, label){
  var orig = btn.textContent;
  function done(){ btn.textContent = label; setTimeout(function(){ btn.textContent = orig; }, 1300); }
  function fallback(){
    var el = document.getElementById('link');
    if(!el) return;
    var prev = el.value; el.value = text; el.focus(); el.select();
    try{ document.execCommand('copy'); }catch(e){}
    el.value = prev;
  }
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(text).then(done, function(){ fallback(); done(); });
  } else { fallback(); done(); }
}

/* ── Symlog scale helpers ────────────────────────────────────────────────────
   Hybrid linear-log for Chart.js axes where values cluster near zero.
   |x| ≤ SYMLOG_LIN_MAX  →  f(x) = x            (identity; equal pixel per unit)
   |x| >  SYMLOG_LIN_MAX  →  f(x) = sign · (LIN_MAX + LIN_K · log₁₀(|x|/LIN_MAX))
   LIN_K = LIN_MAX·ln10 gives C¹ continuity at the transition. */
var SYMLOG_LIN_MAX = 0.005;
var SYMLOG_LIN_K   = SYMLOG_LIN_MAX * Math.LN10;
/* Fine ticks inside the linear region, coarser log ticks outside */
var SYMLOG_NICE = [-0.2,-0.1,-0.05,-0.02,-0.01,
                   -0.005,-0.004,-0.003,-0.002,-0.001,
                    0,
                    0.001,0.002,0.003,0.004,0.005,
                    0.01,0.02,0.05,0.1,0.2];
function symlog(x){
  if(x===0) return 0;
  var s=x>0?1:-1, a=Math.abs(x);
  return a<=SYMLOG_LIN_MAX ? x : s*(SYMLOG_LIN_MAX + SYMLOG_LIN_K*Math.log10(a/SYMLOG_LIN_MAX));
}
function symexp(y){
  if(y===0) return 0;
  var s=y>0?1:-1, a=Math.abs(y);
  return a<=SYMLOG_LIN_MAX ? y : s*SYMLOG_LIN_MAX*Math.pow(10,(a-SYMLOG_LIN_MAX)/SYMLOG_LIN_K);
}
function fmtSymlog(symVal){
  var orig = symexp(symVal);
  if(Math.abs(orig)<1e-9) return '0';
  var abs=Math.abs(orig);
  if(abs < SYMLOG_LIN_MAX - 1e-9) return null;
  var str=abs>=0.1?abs.toFixed(2):abs.toFixed(3);
  return orig<0?'-'+str:str;
}

/* ── Dumbbell Chart.js plugin ────────────────────────────────────────────────
   Draws endpoint dots on floating-bar datasets that have dumbbell:true.
   - ds.backgroundColor: color per bar (array) for the solid endpoint dots (r=5)
   - ds.sellData: optional array of y-values for hollow mid dots (r=4, white fill) */
var DUMBBELL_PLUGIN = {
  id: 'dumbbell',
  afterDatasetsDraw: function(ch){
    var ctx = ch.ctx;
    ch.data.datasets.forEach(function(ds, di){
      if(!ds.dumbbell) return;
      var meta = ch.getDatasetMeta(di);
      var colors = ds.backgroundColor;
      meta.data.forEach(function(bar, i){
        var col = Array.isArray(colors) ? colors[i] : colors;
        if(!col) return;
        var p = bar.getProps(['x','y','base'], true);
        ctx.save();
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.arc(p.x, p.y,   5, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(p.x, p.base, 5, 0, Math.PI*2); ctx.fill();
        if(ds.sellData && ds.sellData[i] != null){
          var sy = ch.scales.y.getPixelForValue(ds.sellData[i]);
          ctx.beginPath(); ctx.arc(p.x, sy, 4, 0, Math.PI*2);
          ctx.fillStyle = '#fff';
          ctx.strokeStyle = col;
          ctx.lineWidth = 2;
          ctx.fill();
          ctx.stroke();
        }
        ctx.restore();
      });
    });
  }
};
