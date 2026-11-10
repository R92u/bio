const audio=document.querySelector('#audio'),player=document.querySelector('.player'),play=document.querySelector('#play'),seek=document.querySelector('#seek'),volume=document.querySelector('#volume'),mute=document.querySelector('#mute'),repeat=document.querySelector('#repeat'),error=document.querySelector('#error');
let dragging=false,animation=0,lastVolume=.8;
audio.volume=.8;
const format=s=>Number.isFinite(s)?`${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`:'0:00';
function render(){const duration=audio.duration||0;const position=dragging?Number(seek.value)/1000*duration:audio.currentTime;player.style.setProperty('--progress',`${duration?position/duration*100:0}%`);document.querySelector('#elapsed').textContent=format(position);document.querySelector('#duration').textContent=format(duration);if(!dragging)seek.value=duration?position/duration*1000:0;}
function tick(){render();if(!audio.paused)animation=requestAnimationFrame(tick)}
play.addEventListener('click',async()=>{error.hidden=true;if(!audio.paused){audio.pause();return}player.classList.add('loading');try{await audio.play()}catch(e){player.classList.remove('loading');error.textContent='Не удалось включить трек. Попробуй ещё раз.';error.hidden=false;}});
audio.addEventListener('play',()=>{player.classList.add('playing');play.setAttribute('aria-label','Пауза');cancelAnimationFrame(animation);tick()});
audio.addEventListener('pause',()=>{player.classList.remove('playing','loading');play.setAttribute('aria-label','Воспроизвести');cancelAnimationFrame(animation);render()});
audio.addEventListener('playing',()=>player.classList.remove('loading'));
audio.addEventListener('waiting',()=>{if(!audio.paused)player.classList.add('loading')});
audio.addEventListener('canplay',()=>player.classList.remove('loading'));
['loadedmetadata','durationchange','timeupdate','seeked','ended'].forEach(event=>audio.addEventListener(event,render));
seek.addEventListener('input',()=>{dragging=true;render()});
function finishSeek(){if(dragging&&Number.isFinite(audio.duration)){audio.currentTime=Number(seek.value)/1000*audio.duration;dragging=false;render()}}
seek.addEventListener('change',finishSeek);seek.addEventListener('blur',finishSeek);
document.querySelector('#restart').addEventListener('click',()=>{audio.currentTime=0;render()});
repeat.addEventListener('click',()=>{audio.loop=!audio.loop;repeat.setAttribute('aria-pressed',String(audio.loop))});
function updateVolume(){const value=audio.muted?0:audio.volume;volume.value=value;volume.style.background=`linear-gradient(to right,#a58bc4 ${value*100}%,#ffffff20 ${value*100}%)`;mute.classList.toggle('muted',!value);mute.setAttribute('aria-label',value?'Выключить звук':'Включить звук')}
volume.addEventListener('input',()=>{audio.volume=Number(volume.value);audio.muted=false;if(audio.volume)lastVolume=audio.volume;updateVolume()});
mute.addEventListener('click',()=>{if(audio.muted||audio.volume===0){audio.muted=false;audio.volume=lastVolume||.8}else{lastVolume=audio.volume;audio.muted=true}updateVolume()});
audio.addEventListener('error',()=>{player.classList.remove('loading','playing');error.textContent='Трек не загрузился. Обнови страницу и попробуй ещё раз.';error.hidden=false});
document.addEventListener('keydown',event=>{if(event.code==='Space'&&!['INPUT','BUTTON'].includes(event.target.tagName)){event.preventDefault();play.click()}});
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(animation)}else if(!audio.paused){cancelAnimationFrame(animation);tick()}});
render();updateVolume();
