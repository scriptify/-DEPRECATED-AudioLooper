!function(e){function n(r){if(t[r])return t[r].exports;var i=t[r]={exports:{},id:r,loaded:!1};return e[r].call(i.exports,i,i.exports,n),i.loaded=!0,i.exports}var t={};return n.m=e,n.c=t,n.p="",n(0)}([function(e,n,t){"use strict";function r(e,n){var t=[];u(function(r){var i=e.find(function(e){return e.isFirstTrack});i&&(i.currentPercentualTime+=r/1e3/i.duration,t.push(s(e,n,t)))})}function i(e,n,t){var r=0===e.length,i=1;if(!r){var a=e.find(function(e){return e.isFirstTrack});i=Math.ceil(a.duration/100*n)}e.push({id:t,duration:n,isFirstTrack:r,shouldPlay:!0,currentPercentualTime:0,maxPercentualTime:i})}var a=t(1),u=function(e){var n=Date.now();setInterval(function(){var t=Date.now(),r=t-n;n=t,e(r)},0)},c=[],s=function(e,n){var t=arguments.length>2&&void 0!==arguments[2]?arguments[2]:[],r=e.find(function(e){return e.isFirstTrack}),i=Math.round(100*r.currentPercentualTime)/100;return Number.isInteger(i)&&!t.includes(i)&&e.forEach(function(e){i%e.maxPercentualTime===0&&e.shouldPlay&&n(e.id)}),i};self.addEventListener("message",function(e){var n=e.data,t=n.type,r=n.id,u=n.duration;switch(t){case a.ADD_TRACK:i(c,u,r);break;case a.REMOVE_TRACK:c.splice(c.find(function(e){return e.id===r}),1);break;case a.PLAY:var s=c.find(function(e){return e.id===r});s.shouldPlay=!0;break;case a.STOP:c.find(function(e){return e.id===r});s.shouldPlay=!1,self.postMessage({type:a.STOP,id:r})}}),r(c,function(e){self.postMessage({type:a.PLAY,id:e})})},function(e,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0});n.ADD_TRACK="ADD_TRACK",n.REMOVE_TRACK="REMOVE_TRACK",n.PLAY="PLAY",n.STOP="STOP"}]);