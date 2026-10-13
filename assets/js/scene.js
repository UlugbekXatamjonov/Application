// QALQON — WebGL sahna: fon (topografik shader), yulduzlar, realistik ko'k Yer va hujum yoylari.
import * as THREE from '../vendor/three.module.min.js';
import { CITIES, ATTACK_TYPES, HOME } from './data.js';

const TEX = 'assets/textures/';
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- yordamchilar ---------- */
export function latLonToVec3(lat, lon, r = 1) {
  const phi = (90 - lat) * Math.PI / 180;
  const theta = (lon + 180) * Math.PI / 180;
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}
const ease = {
  outCubic: t => 1 - Math.pow(1 - t, 3),
  inOutCubic: t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  outExpo: t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
};
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (a, b) => a + Math.random() * (b - a);
const pick = arr => arr[(Math.random() * arr.length) | 0];

/* ---------- shaderlar ---------- */
const NOISE = /* glsl */`
  vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
  vec2 mod289(vec2 x){return x-floor(x*(1./289.))*289.;}
  vec3 permute(vec3 x){return mod289(((x*34.)+1.)*x);}
  float snoise(vec2 v){
    const vec4 C=vec4(.211324865405187,.366025403784439,-.577350269189626,.024390243902439);
    vec2 i=floor(v+dot(v,C.yy)); vec2 x0=v-i+dot(i,C.xx);
    vec2 i1=(x0.x>x0.y)?vec2(1.,0.):vec2(0.,1.);
    vec4 x12=x0.xyxy+C.xxzz; x12.xy-=i1; i=mod289(i);
    vec3 p=permute(permute(i.y+vec3(0.,i1.y,1.))+i.x+vec3(0.,i1.x,1.));
    vec3 m=max(.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.); m=m*m; m=m*m;
    vec3 x=2.*fract(p*C.www)-1.; vec3 h=abs(x)-.5; vec3 ox=floor(x+.5); vec3 a0=x-ox;
    m*=1.79284291400159-.85373472095314*(a0*a0+h*h);
    vec3 g; g.x=a0.x*x0.x+h.x*x0.y; g.yz=a0.yz*x12.xz+h.yz*x12.yw;
    return 130.*dot(m,g);
  }
  float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*snoise(p);p*=2.02;a*=.5;}return s;}
`;

const BG_FRAG = /* glsl */`
  precision highp float;
  uniform vec2 uRes; uniform float uTime; uniform vec2 uMouse; uniform vec2 uGlobe;
  uniform float uAuth; uniform float uPulse;
  varying vec2 vUv;
  ${NOISE}
  float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
  void main(){
    vec2 frag=vUv*uRes;
    vec2 p=(frag-.5*uRes)/uRes.y;
    vec2 g=(uGlobe*uRes-.5*uRes)/uRes.y;
    vec2 m=(uMouse*uRes-.5*uRes)/uRes.y;
    float t=uTime;

    // domen-buralgan shovqin -> topografik relyef
    vec2 q=vec2(fbm(p*1.1+vec2(0.,t*.025)),fbm(p*1.1+vec2(5.2,1.3)-t*.02));
    float n=fbm(p*1.35+q*1.6+vec2(t*.01,0.));
    float f=n*16.;
    float lineW=max(fwidth(f),1e-4);
    float line=1.-min(min(fract(f),1.-fract(f))/lineW,1.);
    float major=1.-step(.5,mod(floor(f+.5),5.));

    float dg=length(p-g);
    float dm=length(p-m);

    // asosiy rang: chuqur kosmik ko'k -> globus atrofida porlash
    vec3 col=mix(vec3(.006,.012,.035),vec3(.012,.028,.075),smoothstep(1.4,-.2,p.y));
    vec3 glowC=mix(vec3(.05,.22,.55),vec3(.22,.12,.55),uAuth);
    col+=glowC*.55*exp(-dg*dg*2.2);
    col+=vec3(.0,.18,.32)*.18*exp(-dm*dm*6.);

    // kontur chiziqlar: kursor atrofida "fonar" kabi ochiladi
    float reveal=.05+.9*exp(-dm*dm*7.)+.3*exp(-dg*dg*1.5);
    vec3 lineC=mix(vec3(.22,.75,1.),vec3(.62,.48,1.),uAuth*.8+.2*sin(n*3.+t*.2));
    col+=lineC*line*(.03+.06*major)*reveal*1.8;

    // radar to'lqini globus markazidan
    float ang=atan(p.y-g.y,p.x-g.x);
    float sweep=fract((ang/6.28318)+t*.06);
    float rad=smoothstep(.0,.9,sweep)*smoothstep(1.,.97,sweep);
    col+=vec3(.15,.55,1.)*pow(rad,8.)*.06*smoothstep(1.8,.4,dg)*(line*.8+.2);

    // tashqi zarba to'lqini (ro'yxatdan o'tganda)
    float ring=abs(dg-uPulse*2.2);
    col+=vec3(.25,1.,.75)*exp(-ring*ring*400.)*(1.-uPulse)*.9;

    // nuqtali to'r
    vec2 gp=frag/22.;
    vec2 gf=abs(fract(gp)-.5);
    float dot_=1.-smoothstep(.0,.08,length(gf));
    col+=vec3(.3,.6,1.)*dot_*.05*reveal;

    // vinyetka + plyonka shovqini
    col*=1.-.55*smoothstep(.55,1.35,length(p*vec2(.9,1.1)));
    col+=(hash(frag+fract(t)*100.)-.5)*.022;
    gl_FragColor=vec4(col,1.);
  }
`;

const EARTH_VERT = /* glsl */`
  varying vec2 vUv; varying vec3 vN; varying vec3 vView;
  void main(){
    vUv=uv;
    vec4 mv=modelViewMatrix*vec4(position,1.);
    vN=normalize(normalMatrix*normal);
    vView=normalize(-mv.xyz);
    gl_Position=projectionMatrix*mv;
  }
`;
const EARTH_FRAG = /* glsl */`
  precision highp float;
  uniform sampler2D uDay, uNight, uWater, uTopo;
  uniform vec3 uLight; uniform float uTime;
  varying vec2 vUv; varying vec3 vN; varying vec3 vView;
  float H(vec2 uv){return texture2D(uTopo,uv).r;}
  float W(vec2 uv){return texture2D(uWater,uv).r;}
  void main(){
    vec3 N=normalize(vN); vec3 V=normalize(vView); vec3 L=normalize(uLight);
    float water=smoothstep(.35,.65,W(vUv));
    float land=1.-water;
    float lum=texture2D(uDay,vUv).r;
    float lights=texture2D(uNight,vUv).r;

    // relyef soyasi (topografiya xaritasidan)
    vec2 e=vec2(1./2048.,1./1024.);
    float hx=H(vUv+vec2(e.x,0.))-H(vUv-vec2(e.x,0.));
    float hy=H(vUv+vec2(0.,e.y))-H(vUv-vec2(0.,e.y));
    float shade=clamp(1.+(-hx+hy)*3.5,.7,1.35);

    // qirg'oq chizig'i
    float wx=W(vUv+vec2(e.x*1.5,0.))-W(vUv-vec2(e.x*1.5,0.));
    float wy=W(vUv+vec2(0.,e.y*1.5))-W(vUv-vec2(0.,e.y*1.5));
    float coast=smoothstep(.15,.9,length(vec2(wx,wy)));

    // okean: chuqurlikka qarab to'q ko'k
    vec3 ocean=mix(vec3(.004,.018,.06),vec3(.02,.09,.22),smoothstep(.02,.25,lum));
    // quruqlik: haqiqiy yorug'likni ko'k palitraga o'tkazamiz
    vec3 l0=vec3(.03,.11,.30), l1=vec3(.09,.36,.78), l2=vec3(.42,.80,1.), l3=vec3(.86,.95,1.);
    float k=clamp(lum*1.15,0.,1.);
    vec3 landC=mix(l0,l1,smoothstep(.0,.35,k));
    landC=mix(landC,l2,smoothstep(.35,.75,k));
    landC=mix(landC,l3,smoothstep(.8,1.,k));
    landC*=shade;

    vec3 col=mix(landC,ocean,water);

    float diff=max(dot(N,L),0.);
    float light=.38+.85*diff;
    col*=light;

    // tungi shahar chiroqlari (soya tomonda yorqinroq)
    float night=smoothstep(.25,-.1,dot(N,L));
    col+=vec3(.45,.82,1.)*pow(lights,1.6)*(.18+.9*night)*land;

    // qirg'oq porlashi
    col+=vec3(.25,.85,1.)*coast*.55*(.4+.6*light);

    // kenglik/uzunlik to'ri
    vec2 gq=vUv*vec2(36.,18.);
    vec2 gd=min(fract(gq),1.-fract(gq))/max(fwidth(gq),vec2(1e-4));
    float grid=1.-min(min(gd.x,gd.y),1.);
    col+=vec3(.2,.55,1.)*grid*.07;

    // okean ustidagi yaltirash
    vec3 Hh=normalize(L+V);
    col+=vec3(.55,.8,1.)*pow(max(dot(N,Hh),0.),60.)*water*.55;

    // fresnel (atmosfera ichki halqasi)
    float fr=pow(1.-max(dot(N,V),0.),3.2);
    col+=vec3(.25,.65,1.)*fr*.9;

    gl_FragColor=vec4(col,1.);
  }
`;

const ATMO_VERT = /* glsl */`
  varying vec3 vN; varying vec3 vView;
  void main(){
    vec4 mv=modelViewMatrix*vec4(position,1.);
    vN=normalize(normalMatrix*normal); vView=normalize(-mv.xyz);
    gl_Position=projectionMatrix*mv;
  }
`;
const ATMO_FRAG = /* glsl */`
  uniform vec3 uColor; uniform float uPower; uniform float uK;
  varying vec3 vN; varying vec3 vView;
  void main(){
    float i=pow(max(uK-dot(normalize(vN),normalize(vView)),0.),uPower);
    gl_FragColor=vec4(uColor*i,i);
  }
`;

const CLOUD_FRAG = /* glsl */`
  uniform sampler2D uClouds; uniform vec3 uLight;
  varying vec2 vUv; varying vec3 vN; varying vec3 vView;
  void main(){
    float c=texture2D(uClouds,vUv).r;
    float d=max(dot(normalize(vN),normalize(uLight)),0.);
    float a=smoothstep(.25,.95,c)*(.03+.16*d);
    gl_FragColor=vec4(vec3(.75,.9,1.),a);
  }
`;

const ARC_VERT = /* glsl */`
  varying vec2 vUv;
  void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }
`;
const ARC_FRAG = /* glsl */`
  uniform vec3 uColor; uniform float uHead; uniform float uTail; uniform float uFade; uniform float uCut;
  varying vec2 vUv;
  void main(){
    float x=vUv.x;
    if(x>uCut) discard;
    float d=uHead-x;
    float trail=(d>=0.&&d<uTail)?pow(1.-d/uTail,2.2):0.;
    float head=exp(-d*d*9000.)*step(0.,d+.01);
    float ghost=step(x,uHead)*.10;
    float a=(trail+head*1.4+ghost)*uFade;
    vec3 c=mix(uColor,vec3(1.),head*.8+trail*.15);
    gl_FragColor=vec4(c*a,a);
  }
`;

const RING_FRAG = /* glsl */`
  uniform vec3 uColor; uniform float uT;
  varying vec2 vUv;
  void main(){
    float r=length(vUv-.5)*2.;
    float w=.10+.1*(1.-uT);
    float ring=smoothstep(1.,1.-w,r)*smoothstep(1.-w*2.6,1.-w,r);
    float core=smoothstep(.35,0.,r)*(1.-uT)*1.2;
    float a=(ring+core)*(1.-uT);
    gl_FragColor=vec4(uColor*a,a);
  }
`;

const DOT_VERT = /* glsl */`
  attribute float aSize; attribute vec3 aColor; attribute float aPhase;
  uniform float uTime; uniform float uPx;
  varying vec3 vColor; varying float vFacing; varying float vTw;
  void main(){
    vec4 mv=modelViewMatrix*vec4(position,1.);
    vec3 n=normalize(normalMatrix*normalize(position));
    vFacing=smoothstep(-.05,.25,dot(n,normalize(-mv.xyz)));
    vColor=aColor;
    vTw=.65+.35*sin(uTime*2.+aPhase);
    gl_PointSize=aSize*uPx*(4.2/-mv.z);
    gl_Position=projectionMatrix*mv;
  }
`;
const DOT_FRAG = /* glsl */`
  varying vec3 vColor; varying float vFacing; varying float vTw;
  void main(){
    float d=length(gl_PointCoord-.5);
    float a=smoothstep(.5,.0,d);
    a=pow(a,2.2)*vFacing*vTw;
    gl_FragColor=vec4(vColor*a,a);
  }
`;

const STAR_VERT = /* glsl */`
  attribute float aSize; attribute float aPhase;
  uniform float uTime; uniform float uPx;
  varying float vA;
  void main(){
    vec4 mv=modelViewMatrix*vec4(position,1.);
    vA=.45+.55*sin(uTime*(.6+aPhase*.4)+aPhase*20.);
    gl_PointSize=aSize*uPx;
    gl_Position=projectionMatrix*mv;
  }
`;
const STAR_FRAG = /* glsl */`
  varying float vA;
  void main(){
    float d=length(gl_PointCoord-.5);
    float a=smoothstep(.5,0.,d); a*=a*vA;
    gl_FragColor=vec4(vec3(.7,.85,1.)*a,a);
  }
`;

const BEAM_FRAG = /* glsl */`
  uniform vec3 uColor; uniform float uTime;
  varying vec2 vUv;
  void main(){
    float y=vUv.y;
    float a=(1.-y)*(.55+.45*sin(uTime*3.-y*12.));
    gl_FragColor=vec4(uColor*a,a);
  }
`;

const SHIELD_FRAG = /* glsl */`
  uniform vec3 uColor; uniform float uT; uniform float uTime;
  varying vec3 vN; varying vec3 vView; varying vec2 vUv;
  void main(){
    float fr=pow(1.-abs(dot(normalize(vN),normalize(vView))),2.);
    vec2 g=vUv*vec2(48.,24.);
    vec2 f=abs(fract(g)-.5);
    float grid=smoothstep(.46,.5,max(f.x,f.y));
    float scan=smoothstep(.0,.02,abs(fract(vUv.y*3.-uTime*.8)-.5)-.47);
    float a=(fr*.9+grid*.25+scan*.25)*uT;
    gl_FragColor=vec4(uColor*a,a);
  }
`;
const SHIELD_VERT = /* glsl */`
  varying vec3 vN; varying vec3 vView; varying vec2 vUv;
  void main(){
    vUv=uv;
    vec4 mv=modelViewMatrix*vec4(position,1.);
    vN=normalize(normalMatrix*normal); vView=normalize(-mv.xyz);
    gl_Position=projectionMatrix*mv;
  }
`;

/* =====================================================================
   Asosiy sahna
   ===================================================================== */
export class ThreatScene {
  constructor(canvas, { onAttack, onImpact } = {}) {
    this.canvas = canvas;
    this.onAttack = onAttack || (() => {});
    this.onImpact = onImpact || (() => {});
    this.clock = new THREE.Clock();
    this.mouse = new THREE.Vector2(.5, .5);
    this.mouseSmooth = new THREE.Vector2(.5, .5);
    this.layout = { shift: 0, shiftTarget: 0, dist: 11, distTarget: 11, auth: 0, authTarget: 0, vy: 0, vyTarget: 0 };
    this.arcs = [];
    this.rings = [];
    this.timers = [];
    this.spawnAcc = 0;
    this.shield = null;
    this.pulse = 1;
    this.rate = REDUCED ? 0.6 : 2.6; // soniyasiga hujum

    this._initRenderer();
    this._initBackground();
    this._initStars();
    this._initGlobe();
    this._initInteraction();
    this.resize();
    addEventListener('resize', () => this.resize());
  }

  _initRenderer() {
    const r = this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, powerPreference: 'high-performance' });
    r.setPixelRatio(Math.min(devicePixelRatio, 2));
    r.autoClear = false;
    r.setClearColor(0x02060f, 1);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(35, 1, .1, 200);
    this.camera.position.set(0, 0, this.layout.dist);
  }

  _initBackground() {
    this.bgScene = new THREE.Scene();
    this.bgCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.bgU = {
      uRes: { value: new THREE.Vector2(1, 1) }, uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(.5, .5) }, uGlobe: { value: new THREE.Vector2(.7, .5) },
      uAuth: { value: 0 }, uPulse: { value: 1 },
    };
    const m = new THREE.ShaderMaterial({
      uniforms: this.bgU, depthWrite: false, depthTest: false,
      vertexShader: 'varying vec2 vUv; void main(){vUv=uv; gl_Position=vec4(position.xy,0.,1.);}',
      fragmentShader: BG_FRAG,
    });
    this.bgScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), m));
  }

  _initStars() {
    const N = 1800, pos = new Float32Array(N * 3), size = new Float32Array(N), ph = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const v = new THREE.Vector3().randomDirection().multiplyScalar(rand(40, 70));
      pos.set([v.x, v.y, v.z], i * 3);
      size[i] = Math.random() < .04 ? rand(2.2, 3.4) : rand(.6, 1.6);
      ph[i] = Math.random();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
    g.setAttribute('aPhase', new THREE.BufferAttribute(ph, 1));
    this.starU = { uTime: { value: 0 }, uPx: { value: 1 } };
    this.stars = new THREE.Points(g, new THREE.ShaderMaterial({
      uniforms: this.starU, vertexShader: STAR_VERT, fragmentShader: STAR_FRAG,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    }));
    this.scene.add(this.stars);
  }

  _initGlobe() {
    const loader = new THREE.TextureLoader();
    const load = (f, srgb) => {
      const t = loader.load(TEX + f, () => this._texLoaded());
      t.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
      t.colorSpace = THREE.NoColorSpace;
      return t;
    };
    this._texPending = 5;
    const day = load('earth-day.jpg'), night = load('earth-night.jpg'),
      water = load('earth-water.jpg'), topo = load('earth-topo.jpg'), clouds = load('clouds.jpg');

    this.tilt = new THREE.Group();        // eksa og'ishi
    this.tilt.rotation.z = THREE.MathUtils.degToRad(-12);
    this.tilt.rotation.x = THREE.MathUtils.degToRad(14);
    this.scene.add(this.tilt);
    this.globe = new THREE.Group();       // aylanadigan qism
    this.tilt.add(this.globe);

    this.lightDir = new THREE.Vector3(-.6, .45, .75).normalize();
    this.earthU = {
      uDay: { value: day }, uNight: { value: night }, uWater: { value: water }, uTopo: { value: topo },
      uLight: { value: this.lightDir }, uTime: { value: 0 },
    };
    this.earth = new THREE.Mesh(
      new THREE.SphereGeometry(1, 160, 120),
      new THREE.ShaderMaterial({ uniforms: this.earthU, vertexShader: EARTH_VERT, fragmentShader: EARTH_FRAG })
    );
    this.globe.add(this.earth);

    this.clouds = new THREE.Mesh(
      new THREE.SphereGeometry(1.012, 96, 72),
      new THREE.ShaderMaterial({
        uniforms: { uClouds: { value: clouds }, uLight: { value: this.lightDir } },
        vertexShader: EARTH_VERT, fragmentShader: CLOUD_FRAG,
        transparent: true, depthWrite: false,
      })
    );
    this.globe.add(this.clouds);

    // tashqi atmosfera (kamera tomondan doimiy turadi)
    const atmo = new THREE.Mesh(
      new THREE.SphereGeometry(1, 96, 72),
      new THREE.ShaderMaterial({
        uniforms: { uColor: { value: new THREE.Color(0.18, 0.5, 1.0) }, uPower: { value: 4.0 }, uK: { value: .62 } },
        vertexShader: ATMO_VERT, fragmentShader: ATMO_FRAG,
        side: THREE.BackSide, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      })
    );
    atmo.scale.setScalar(1.16);
    this.tilt.add(atmo);
    this.atmo = atmo;

    // shahar nuqtalari
    const n = CITIES.length, pos = new Float32Array(n * 3), size = new Float32Array(n),
      col = new Float32Array(n * 3), ph = new Float32Array(n);
    CITIES.forEach((c, i) => {
      const v = latLonToVec3(c.lat, c.lon, 1.004);
      pos.set([v.x, v.y, v.z], i * 3);
      const home = c.name === HOME.name;
      size[i] = home ? 26 : rand(10, 15);
      const cc = new THREE.Color(home ? 0x5dffc0 : 0x7fd8ff);
      col.set([cc.r, cc.g, cc.b], i * 3);
      ph[i] = Math.random() * 6.28;
      c.vec = latLonToVec3(c.lat, c.lon, 1);
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
    g.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
    g.setAttribute('aPhase', new THREE.BufferAttribute(ph, 1));
    this.dotU = { uTime: { value: 0 }, uPx: { value: 1 } };
    this.globe.add(new THREE.Points(g, new THREE.ShaderMaterial({
      uniforms: this.dotU, vertexShader: DOT_VERT, fragmentShader: DOT_FRAG,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    })));

    // Toshkent: yorug'lik ustuni
    this.home = CITIES.find(c => c.name === HOME.name);
    this.beamU = { uColor: { value: new THREE.Color(0x5dffc0) }, uTime: { value: 0 } };
    const beamGeo = new THREE.CylinderGeometry(.0045, .0015, .32, 12, 1, true);
    beamGeo.translate(0, .16, 0);
    const beam = new THREE.Mesh(beamGeo, new THREE.ShaderMaterial({
      uniforms: this.beamU, vertexShader: ARC_VERT, fragmentShader: BEAM_FRAG,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    }));
    beam.position.copy(this.home.vec);
    beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), this.home.vec.clone().normalize());
    this.globe.add(beam);

    // boshlang'ich burchak: Markaziy Osiyo ko'rinsin
    this.rot = { y: this._yawFor(this.home.lon) + .35, x: 0, vy: 0, vx: 0 };
    this.globe.rotation.y = this.rot.y;

    this.arcGeoCache = new Map();
    this.ringGeo = new THREE.PlaneGeometry(1, 1);
  }

  _yawFor(lon) {
    // lon nuqtasini kamera tomonga (+z) buradigan burchak
    return Math.PI / 2 - (lon + 180) * Math.PI / 180;
  }

  _texLoaded() {
    if (--this._texPending === 0) this.canvas.dispatchEvent(new CustomEvent('ready'));
  }

  _initInteraction() {
    let dragging = false, lx = 0, ly = 0, lastT = 0;
    this.idle = 0;
    const BLOCK = 'a,button,input,select,textarea,label,.panel,.card,.no-drag';
    const down = e => {
      // faqat sichqoncha bilan, bo'sh joyda va globus ustida bosilsa aylantiramiz
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      if (e.target.closest?.(BLOCK)) return;
      if (!this._hitGlobe(e.clientX, e.clientY)) return;
      e.preventDefault();
      dragging = true; lx = e.clientX; ly = e.clientY; lastT = performance.now();
      document.body.classList.add('is-dragging');
    };
    const move = e => {
      this.mouse.set(e.clientX / innerWidth, 1 - e.clientY / innerHeight);
      document.body.classList.toggle('over-globe', !dragging && e.pointerType === 'mouse' && !e.target.closest?.(BLOCK) && this._hitGlobe(e.clientX, e.clientY));
      if (!dragging) return;
      const dx = e.clientX - lx, dy = e.clientY - ly;
      const now = performance.now(), dt = Math.max(now - lastT, 1);
      lx = e.clientX; ly = e.clientY; lastT = now;
      const k = 0.0055;
      this.rot.y += dx * k; this.rot.x += dy * k;
      this.rot.vy = dx * k / dt * 16; this.rot.vx = dy * k / dt * 16;
      this.idle = 0;
    };
    const up = () => { dragging = false; document.body.classList.remove('is-dragging'); };
    addEventListener('pointerdown', down);
    addEventListener('pointermove', move, { passive: true });
    addEventListener('pointerup', up);
    addEventListener('pointercancel', up);
  }

  _hitGlobe(x, y) {
    const c = this._screenCenter();
    const r = this._screenRadius();
    return Math.hypot(x - c.x, y - c.y) < r * 1.05;
  }
  _screenCenter() {
    return { x: innerWidth / 2 + this.layout.shift * innerWidth, y: innerHeight / 2 - this._vshift() * innerHeight };
  }
  _screenRadius() {
    const fov = this.camera.fov * Math.PI / 180;
    const d = this.camera.position.z;
    return (1 / Math.tan(fov / 2) / Math.sqrt(d * d - 1)) * innerHeight / 2;
  }
  _vshift() { return this.layout.vy; }

  /* ----- joylashuv: har bir bo'lim o'z "kadr"ini beradi -----
     shift: gorizontal siljish (ekran eniga nisbatan), r/rw: radius (balandlik/en ulushi),
     vy: vertikal siljish (+ yuqoriga), aux: fon rangi (0 ko'k → 1 binafsha) */
  setPreset(p) {
    this.preset = p;
    const w = innerWidth, h = innerHeight;
    this.mobile = w < 900;
    const R = Math.min(p.r * h, (p.rw ?? 9) * w);
    const tanA = (R / (h / 2)) * Math.tan(this.camera.fov * Math.PI / 360);
    this.layout.distTarget = Math.sqrt(1 + 1 / (tanA * tanA));
    this.layout.shiftTarget = p.shift || 0;
    this.layout.vyTarget = p.vy || 0;
    this.layout.authTarget = p.aux || 0;
  }

  resize() {
    const w = innerWidth, h = innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    const pr = this.renderer.getPixelRatio();
    this.bgU.uRes.value.set(w * pr, h * pr);
    this.starU.uPx.value = pr;
    this.dotU.uPx.value = pr * Math.min(h / 900, 1.3);
    if (this.preset) this.setPreset(this.preset);
  }

  /* ----- hujumlar ----- */
  _arcCurve(a, b) {
    const angle = a.angleTo(b);
    const alt = .06 + .42 * (angle / Math.PI);
    const pts = [];
    const qa = a.clone().normalize(), qb = b.clone().normalize();
    const N = 48;
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      // sferik interpolyatsiya (slerp)
      const s = Math.sin(angle);
      const p = s < 1e-5 ? qa.clone()
        : qa.clone().multiplyScalar(Math.sin((1 - t) * angle) / s).add(qb.clone().multiplyScalar(Math.sin(t * angle) / s));
      p.multiplyScalar(1.003 + alt * Math.sin(Math.PI * t));
      pts.push(p);
    }
    return new THREE.CatmullRomCurve3(pts);
  }

  launch({ from, to, type, blocked = false, dur } = {}) {
    if (this.arcs.length > 46) return;
    from = from || pick(CITIES);
    if (!to) {
      to = Math.random() < .2 ? this.home : pick(CITIES);
    }
    if (from === to) return;
    type = type || pick(ATTACK_TYPES);
    const curve = this._arcCurve(from.vec, to.vec);
    const len = curve.getLength();
    const geo = new THREE.TubeGeometry(curve, 96, blocked ? .0055 : .0032 + Math.random() * .0018, 6, false);
    const color = new THREE.Color(blocked ? 0x5dffc0 : type.color);
    const u = {
      uColor: { value: color }, uHead: { value: 0 }, uTail: { value: .32 },
      uFade: { value: 1 }, uCut: { value: blocked ? .78 : 1.01 },
    };
    const mesh = new THREE.Mesh(geo, new THREE.ShaderMaterial({
      uniforms: u, vertexShader: ARC_VERT, fragmentShader: ARC_FRAG,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    }));
    this.globe.add(mesh);
    const d = dur || (1.1 + len * .55) * (blocked ? 1.1 : 1);
    const arc = { mesh, u, t: 0, dur: d, from, to, type, blocked, hit: false };
    this.arcs.push(arc);
    this._ring(from.vec, color, .07, .9);
    this.onAttack(arc);
    return arc;
  }

  _ring(vec, color, size = .16, life = 1.4, delay = 0) {
    const m = new THREE.Mesh(this.ringGeo, new THREE.ShaderMaterial({
      uniforms: { uColor: { value: color.clone ? color.clone() : new THREE.Color(color) }, uT: { value: 0 } },
      vertexShader: ARC_VERT, fragmentShader: RING_FRAG,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    }));
    const n = vec.clone().normalize();
    m.position.copy(n.clone().multiplyScalar(1.006));
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n);
    m.scale.setScalar(.0001);
    this.globe.add(m);
    this.rings.push({ m, t: -delay, life, size });
  }

  _impact(arc) {
    const c = arc.blocked ? new THREE.Color(0x5dffc0) : new THREE.Color(arc.type.color);
    if (arc.blocked) {
      const p = arc.mesh.geometry.parameters.path.getPointAt(arc.u.uCut.value);
      this._ring(p, c, .12, 1.0);
    } else {
      this._ring(arc.to.vec, c, .2, 1.5);
      this._ring(arc.to.vec, c, .12, 1.2, .18);
    }
    // ekrandagi joylashuv (yorliq uchun)
    const p = (arc.blocked ? arc.mesh.geometry.parameters.path.getPointAt(arc.u.uCut.value) : arc.to.vec.clone());
    arc.screen = this.project(p);
    this.onImpact(arc);
  }

  project(localVec) {
    const v = localVec.clone();
    this.globe.updateMatrixWorld();
    v.applyMatrix4(this.globe.matrixWorld);
    const facing = v.clone().normalize().dot(this.camera.position.clone().sub(v).normalize());
    v.project(this.camera);
    return { x: (v.x * .5 + .5) * innerWidth, y: (-v.y * .5 + .5) * innerHeight, visible: facing > .05 };
  }

  homeScreen() { return this.project(this.home.vec.clone().multiplyScalar(1.0)); }

  /* ----- himoya qalqoni (ro'yxatdan o'tgandan keyin) ----- */
  activateShield() {
    if (this.shield) { this.globe.remove(this.shield.mesh); }
    const g = new THREE.SphereGeometry(1, 64, 48);
    const u = { uColor: { value: new THREE.Color(0x5dffc0) }, uT: { value: 0 }, uTime: { value: 0 } };
    const mesh = new THREE.Mesh(g, new THREE.ShaderMaterial({
      uniforms: u, vertexShader: SHIELD_VERT, fragmentShader: SHIELD_FRAG,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    }));
    mesh.position.copy(this.home.vec);
    mesh.scale.setScalar(.0001);
    this.globe.add(mesh);
    this.shield = { mesh, u, t: 0 };
    this.pulse = 0;
    // globusni Toshkentga burish
    this.focusLon = this.home.lon;
    // bloklanadigan hujumlar to'lqini
    for (let i = 0; i < 14; i++) {
      this.timers.push({ at: .6 + i * .22, fn: () => {
        let from; do { from = pick(CITIES); } while (from === this.home);
        this.launch({ from, to: this.home, blocked: true });
      } });
    }
    for (let i = 0; i < 3; i++) this._ring(this.home.vec, new THREE.Color(0x5dffc0), .5 + i * .2, 2.2, i * .35);
  }

  /* ----- kadr ----- */
  start() {
    const loop = () => { this._frame(); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }

  _frame() {
    const dt = Math.min(this.clock.getDelta(), .05);
    const t = this.clock.elapsedTime;
    const L = this.layout;
    const k = 1 - Math.pow(.0016, dt); // silliq yaqinlashish

    L.shift = lerp(L.shift, L.shiftTarget, k);
    L.dist = lerp(L.dist, L.distTarget, k);
    L.auth = lerp(L.auth, L.authTarget, k);
    L.vy = lerp(L.vy, L.vyTarget, k);

    // kamera siljishi (globusni chap/o'ngga surish)
    const w = innerWidth, h = innerHeight;
    this.camera.position.z = L.dist;
    this.camera.setViewOffset(w, h, -L.shift * w, this._vshift() * h, w, h);

    // aylanish + inersiya
    this.idle += dt;
    if (this.focusLon !== undefined) {
      const target = this._yawFor(this.focusLon) + .2;
      let d = ((target - this.rot.y) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI;
      this.rot.y += d * Math.min(dt * 2.2, 1);
      this.rot.x = lerp(this.rot.x, 0, dt * 2);
      if (Math.abs(d) < .01) this.focusLon = undefined;
    } else {
      this.rot.vy *= Math.pow(.05, dt); this.rot.vx *= Math.pow(.05, dt);
      if (!document.body.classList.contains('is-dragging')) {
        this.rot.y += this.rot.vy; this.rot.x += this.rot.vx;
        const auto = REDUCED ? .02 : .07;
        this.rot.y += dt * auto * Math.min(this.idle / 2, 1);
        this.rot.x = lerp(this.rot.x, 0, dt * .25 * Math.min(this.idle / 3, 1));
      }
    }
    this.rot.x = THREE.MathUtils.clamp(this.rot.x, -.9, .9);
    this.globe.rotation.y = this.rot.y;
    this.tilt.rotation.x = THREE.MathUtils.degToRad(14) + this.rot.x;
    this.clouds.rotation.y += dt * .012;

    // sichqoncha paralaksi
    this.mouseSmooth.lerp(this.mouse, k * .6);
    this.stars.rotation.y = t * .004 + (this.mouseSmooth.x - .5) * .08;
    this.stars.rotation.x = (this.mouseSmooth.y - .5) * .06;

    // yangi hujumlar
    this.spawnAcc += dt * this.rate * (document.hidden ? 0 : 1);
    while (this.spawnAcc > 1) { this.spawnAcc -= 1 + (Math.random() - .5) * .6; this.launch(); }

    for (let i = this.timers.length - 1; i >= 0; i--) {
      const tm = this.timers[i]; tm.at -= dt;
      if (tm.at <= 0) { this.timers.splice(i, 1); tm.fn(); }
    }

    for (let i = this.arcs.length - 1; i >= 0; i--) {
      const a = this.arcs[i];
      a.t += dt / a.dur;
      const end = a.blocked ? a.u.uCut.value : 1;
      a.u.uHead.value = Math.min(a.t * (1 + a.u.uTail.value), 1 + a.u.uTail.value);
      if (!a.hit && a.u.uHead.value >= end) { a.hit = true; this._impact(a); }
      if (a.u.uHead.value >= end) a.u.uFade.value = Math.max(0, a.u.uFade.value - dt * (a.blocked ? 2.5 : 1.4));
      if (a.u.uFade.value <= 0 || a.t > 2) {
        this.globe.remove(a.mesh); a.mesh.geometry.dispose(); a.mesh.material.dispose();
        this.arcs.splice(i, 1);
      }
    }
    for (let i = this.rings.length - 1; i >= 0; i--) {
      const r = this.rings[i];
      r.t += dt;
      const p = Math.max(r.t / r.life, 0);
      r.m.scale.setScalar(Math.max(ease.outExpo(Math.min(p, 1)) * r.size, .0001));
      r.m.material.uniforms.uT.value = Math.min(p, 1);
      if (p >= 1) { this.globe.remove(r.m); r.m.material.dispose(); this.rings.splice(i, 1); }
    }

    if (this.shield) {
      const s = this.shield; s.t += dt;
      const grow = ease.outCubic(Math.min(s.t / 1.4, 1));
      s.mesh.scale.setScalar(.0001 + grow * .42);
      const fade = s.t < 6 ? 1 : Math.max(0, 1 - (s.t - 6) / 2);
      s.u.uT.value = grow * fade * .9;
      s.u.uTime.value = t;
      if (fade <= 0) { this.globe.remove(s.mesh); s.mesh.material.dispose(); this.shield = null; }
    }
    this.pulse = Math.min(this.pulse + dt * .45, 1);

    // uniformlar
    this.starU.uTime.value = t;
    this.dotU.uTime.value = t;
    this.beamU.uTime.value = t;
    this.bgU.uTime.value = t;
    this.bgU.uMouse.value.copy(this.mouseSmooth);
    this.bgU.uAuth.value = L.auth;
    this.bgU.uPulse.value = this.pulse;
    const c = this._screenCenter();
    this.bgU.uGlobe.value.set(c.x / w, 1 - c.y / h);

    const r = this.renderer;
    r.clear();
    r.render(this.bgScene, this.bgCam);
    r.render(this.scene, this.camera);
  }
}
