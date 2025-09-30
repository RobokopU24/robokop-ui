var Ft=Object.defineProperty;var Ot=(t,e,n)=>e in t?Ft(t,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):t[e]=n;var G=(t,e,n)=>Ot(t,typeof e!="symbol"?e+"":e,n);import{r as a,R as H,j as R,k as At}from"./main-Bxfe4Qal.js";import{_ as _t,g as ct,d as et,e as nt,f as F,h as v,i as j,j as ut,m as pt,L as q,k as Kt,M as Rt}from"./createSimplePaletteValueFilter-BgnxeUzB.js";import{i as gt}from"./isFocusVisible-B8k4qzLc.js";const Yt=typeof window<"u"?a.useLayoutEffect:a.useEffect;function Q(t){const e=a.useRef(t);return Yt(()=>{e.current=t}),a.useRef((...n)=>(0,e.current)(...n)).current}const bt={};function vt(t,e){const n=a.useRef(bt);return n.current===bt&&(n.current=t(e)),n}const Wt=[];function Xt(t){a.useEffect(t,Wt)}class ft{constructor(){G(this,"currentId",null);G(this,"clear",()=>{this.currentId!==null&&(clearTimeout(this.currentId),this.currentId=null)});G(this,"disposeEffect",()=>this.clear)}static create(){return new ft}start(e,n){this.clear(),this.currentId=setTimeout(()=>{this.currentId=null,n()},e)}}function Gt(){const t=vt(ft.create).current;return Xt(t.disposeEffect),t}function yt(...t){const e=a.useRef(void 0),n=a.useCallback(r=>{const o=t.map(s=>{if(s==null)return null;if(typeof s=="function"){const i=s,l=i(r);return typeof l=="function"?l:()=>{i(null)}}return s.current=r,()=>{s.current=null}});return()=>{o.forEach(s=>s==null?void 0:s())}},t);return a.useMemo(()=>t.every(r=>r==null)?null:r=>{e.current&&(e.current(),e.current=void 0),r!=null&&(e.current=n(r))},t)}function Ht(t,e){if(t==null)return{};var n={};for(var r in t)if({}.hasOwnProperty.call(t,r)){if(e.indexOf(r)!==-1)continue;n[r]=t[r]}return n}function ot(t,e){return ot=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(n,r){return n.__proto__=r,n},ot(t,e)}function qt(t,e){t.prototype=Object.create(e.prototype),t.prototype.constructor=t,ot(t,e)}const St=H.createContext(null);function Zt(t){if(t===void 0)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}function dt(t,e){var n=function(s){return e&&a.isValidElement(s)?e(s):s},r=Object.create(null);return t&&a.Children.map(t,function(o){return o}).forEach(function(o){r[o.key]=n(o)}),r}function Jt(t,e){t=t||{},e=e||{};function n(h){return h in e?e[h]:t[h]}var r=Object.create(null),o=[];for(var s in t)s in e?o.length&&(r[s]=o,o=[]):o.push(s);var i,l={};for(var u in e){if(r[u])for(i=0;i<r[u].length;i++){var p=r[u][i];l[r[u][i]]=n(p)}l[u]=n(u)}for(i=0;i<o.length;i++)l[o[i]]=n(o[i]);return l}function U(t,e,n){return n[e]!=null?n[e]:t.props[e]}function Qt(t,e){return dt(t.children,function(n){return a.cloneElement(n,{onExited:e.bind(null,n),in:!0,appear:U(n,"appear",t),enter:U(n,"enter",t),exit:U(n,"exit",t)})})}function te(t,e,n){var r=dt(t.children),o=Jt(e,r);return Object.keys(o).forEach(function(s){var i=o[s];if(a.isValidElement(i)){var l=s in e,u=s in r,p=e[s],h=a.isValidElement(p)&&!p.props.in;u&&(!l||h)?o[s]=a.cloneElement(i,{onExited:n.bind(null,i),in:!0,exit:U(i,"exit",t),enter:U(i,"enter",t)}):!u&&l&&!h?o[s]=a.cloneElement(i,{in:!1}):u&&l&&a.isValidElement(p)&&(o[s]=a.cloneElement(i,{onExited:n.bind(null,i),in:p.props.in,exit:U(i,"exit",t),enter:U(i,"enter",t)}))}}),o}var ee=Object.values||function(t){return Object.keys(t).map(function(e){return t[e]})},ne={component:"div",childFactory:function(e){return e}},ht=function(t){qt(e,t);function e(r,o){var s;s=t.call(this,r,o)||this;var i=s.handleExited.bind(Zt(s));return s.state={contextValue:{isMounting:!0},handleExited:i,firstRender:!0},s}var n=e.prototype;return n.componentDidMount=function(){this.mounted=!0,this.setState({contextValue:{isMounting:!1}})},n.componentWillUnmount=function(){this.mounted=!1},e.getDerivedStateFromProps=function(o,s){var i=s.children,l=s.handleExited,u=s.firstRender;return{children:u?Qt(o,l):te(o,i,l),firstRender:!1}},n.handleExited=function(o,s){var i=dt(this.props.children);o.key in i||(o.props.onExited&&o.props.onExited(s),this.mounted&&this.setState(function(l){var u=_t({},l.children);return delete u[o.key],{children:u}}))},n.render=function(){var o=this.props,s=o.component,i=o.childFactory,l=Ht(o,["component","childFactory"]),u=this.state.contextValue,p=ee(this.state.children).map(i);return delete l.appear,delete l.enter,delete l.exit,s===null?H.createElement(St.Provider,{value:u},p):H.createElement(St.Provider,{value:u},H.createElement(s,l,p))},e}(H.Component);ht.propTypes={};ht.defaultProps=ne;function re(t){return ct("MuiSvgIcon",t)}et("MuiSvgIcon",["root","colorPrimary","colorSecondary","colorAction","colorError","colorDisabled","fontSizeInherit","fontSizeSmall","fontSizeMedium","fontSizeLarge"]);const oe=t=>{const{color:e,fontSize:n,classes:r}=t,o={root:["root",e!=="inherit"&&`color${j(e)}`,`fontSize${j(n)}`]};return ut(o,re,r)},se=F("svg",{name:"MuiSvgIcon",slot:"Root",overridesResolver:(t,e)=>{const{ownerState:n}=t;return[e.root,n.color!=="inherit"&&e[`color${j(n.color)}`],e[`fontSize${j(n.fontSize)}`]]}})(pt(({theme:t})=>{var e,n,r,o,s,i,l,u,p,h,f,b,y,m;return{userSelect:"none",width:"1em",height:"1em",display:"inline-block",flexShrink:0,transition:(o=(e=t.transitions)==null?void 0:e.create)==null?void 0:o.call(e,"fill",{duration:(r=(n=(t.vars??t).transitions)==null?void 0:n.duration)==null?void 0:r.shorter}),variants:[{props:g=>!g.hasSvgAsChild,style:{fill:"currentColor"}},{props:{fontSize:"inherit"},style:{fontSize:"inherit"}},{props:{fontSize:"small"},style:{fontSize:((i=(s=t.typography)==null?void 0:s.pxToRem)==null?void 0:i.call(s,20))||"1.25rem"}},{props:{fontSize:"medium"},style:{fontSize:((u=(l=t.typography)==null?void 0:l.pxToRem)==null?void 0:u.call(l,24))||"1.5rem"}},{props:{fontSize:"large"},style:{fontSize:((h=(p=t.typography)==null?void 0:p.pxToRem)==null?void 0:h.call(p,35))||"2.1875rem"}},...Object.entries((t.vars??t).palette).filter(([,g])=>g&&g.main).map(([g])=>{var S,x;return{props:{color:g},style:{color:(x=(S=(t.vars??t).palette)==null?void 0:S[g])==null?void 0:x.main}}}),{props:{color:"action"},style:{color:(b=(f=(t.vars??t).palette)==null?void 0:f.action)==null?void 0:b.active}},{props:{color:"disabled"},style:{color:(m=(y=(t.vars??t).palette)==null?void 0:y.action)==null?void 0:m.disabled}},{props:{color:"inherit"},style:{color:void 0}}]}})),st=a.forwardRef(function(e,n){const r=nt({props:e,name:"MuiSvgIcon"}),{children:o,className:s,color:i="inherit",component:l="svg",fontSize:u="medium",htmlColor:p,inheritViewBox:h=!1,titleAccess:f,viewBox:b="0 0 24 24",...y}=r,m=a.isValidElement(o)&&o.type==="svg",g={...r,color:i,component:l,fontSize:u,instanceFontSize:e.fontSize,inheritViewBox:h,viewBox:b,hasSvgAsChild:m},S={};h||(S.viewBox=b);const x=oe(g);return R.jsxs(se,{as:l,className:v(x.root,s),focusable:"false",color:p,"aria-hidden":f?void 0:!0,role:f?"img":void 0,ref:n,...S,...y,...m&&o.props,ownerState:g,children:[m?o.props.children:o,f?R.jsx("title",{children:f}):null]})});st.muiName="SvgIcon";function ze(t,e){function n(r,o){return R.jsx(st,{"data-testid":void 0,ref:o,...r,children:t})}return n.muiName=st.muiName,a.memo(a.forwardRef(n))}let Mt=0;function ie(t){const[e,n]=a.useState(t),r=t||e;return a.useEffect(()=>{e==null&&(Mt+=1,n(`mui-${Mt}`))},[e]),r}const ae={...At},xt=ae.useId;function je(t){if(xt!==void 0){const e=xt();return t??e}return ie(t)}class tt{constructor(){G(this,"mountEffect",()=>{this.shouldMount&&!this.didMount&&this.ref.current!==null&&(this.didMount=!0,this.mounted.resolve())});this.ref={current:null},this.mounted=null,this.didMount=!1,this.shouldMount=!1,this.setShouldMount=null}static create(){return new tt}static use(){const e=vt(tt.create).current,[n,r]=a.useState(!1);return e.shouldMount=n,e.setShouldMount=r,a.useEffect(e.mountEffect,[n]),e}mount(){return this.mounted||(this.mounted=ce(),this.shouldMount=!0,this.setShouldMount(this.shouldMount)),this.mounted}start(...e){this.mount().then(()=>{var n;return(n=this.ref.current)==null?void 0:n.start(...e)})}stop(...e){this.mount().then(()=>{var n;return(n=this.ref.current)==null?void 0:n.stop(...e)})}pulsate(...e){this.mount().then(()=>{var n;return(n=this.ref.current)==null?void 0:n.pulsate(...e)})}}function le(){return tt.use()}function ce(){let t,e;const n=new Promise((r,o)=>{t=r,e=o});return n.resolve=t,n.reject=e,n}function ue(t){const{className:e,classes:n,pulsate:r=!1,rippleX:o,rippleY:s,rippleSize:i,in:l,onExited:u,timeout:p}=t,[h,f]=a.useState(!1),b=v(e,n.ripple,n.rippleVisible,r&&n.ripplePulsate),y={width:i,height:i,top:-(i/2)+s,left:-(i/2)+o},m=v(n.child,h&&n.childLeaving,r&&n.childPulsate);return!l&&!h&&f(!0),a.useEffect(()=>{if(!l&&u!=null){const g=setTimeout(u,p);return()=>{clearTimeout(g)}}},[u,l,p]),R.jsx("span",{className:b,style:y,children:R.jsx("span",{className:m})})}const C=et("MuiTouchRipple",["root","ripple","rippleVisible","ripplePulsate","child","childLeaving","childPulsate"]),it=550,pe=80,fe=q`
  0% {
    transform: scale(0);
    opacity: 0.1;
  }

  100% {
    transform: scale(1);
    opacity: 0.3;
  }
`,de=q`
  0% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
`,he=q`
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(0.92);
  }

  100% {
    transform: scale(1);
  }
`,me=F("span",{name:"MuiTouchRipple",slot:"Root"})({overflow:"hidden",pointerEvents:"none",position:"absolute",zIndex:0,top:0,right:0,bottom:0,left:0,borderRadius:"inherit"}),ge=F(ue,{name:"MuiTouchRipple",slot:"Ripple"})`
  opacity: 0;
  position: absolute;

  &.${C.rippleVisible} {
    opacity: 0.3;
    transform: scale(1);
    animation-name: ${fe};
    animation-duration: ${it}ms;
    animation-timing-function: ${({theme:t})=>t.transitions.easing.easeInOut};
  }

  &.${C.ripplePulsate} {
    animation-duration: ${({theme:t})=>t.transitions.duration.shorter}ms;
  }

  & .${C.child} {
    opacity: 1;
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: currentColor;
  }

  & .${C.childLeaving} {
    opacity: 0;
    animation-name: ${de};
    animation-duration: ${it}ms;
    animation-timing-function: ${({theme:t})=>t.transitions.easing.easeInOut};
  }

  & .${C.childPulsate} {
    position: absolute;
    /* @noflip */
    left: 0px;
    top: 0;
    animation-name: ${he};
    animation-duration: 2500ms;
    animation-timing-function: ${({theme:t})=>t.transitions.easing.easeInOut};
    animation-iteration-count: infinite;
    animation-delay: 200ms;
  }
`,be=a.forwardRef(function(e,n){const r=nt({props:e,name:"MuiTouchRipple"}),{center:o=!1,classes:s={},className:i,...l}=r,[u,p]=a.useState([]),h=a.useRef(0),f=a.useRef(null);a.useEffect(()=>{f.current&&(f.current(),f.current=null)},[u]);const b=a.useRef(!1),y=Gt(),m=a.useRef(null),g=a.useRef(null),S=a.useCallback(d=>{const{pulsate:P,rippleX:E,rippleY:A,rippleSize:V,cb:_}=d;p(k=>[...k,R.jsx(ge,{classes:{ripple:v(s.ripple,C.ripple),rippleVisible:v(s.rippleVisible,C.rippleVisible),ripplePulsate:v(s.ripplePulsate,C.ripplePulsate),child:v(s.child,C.child),childLeaving:v(s.childLeaving,C.childLeaving),childPulsate:v(s.childPulsate,C.childPulsate)},timeout:it,pulsate:P,rippleX:E,rippleY:A,rippleSize:V},h.current)]),h.current+=1,f.current=_},[s]),x=a.useCallback((d={},P={},E=()=>{})=>{const{pulsate:A=!1,center:V=o||P.pulsate,fakeElement:_=!1}=P;if((d==null?void 0:d.type)==="mousedown"&&b.current){b.current=!1;return}(d==null?void 0:d.type)==="touchstart"&&(b.current=!0);const k=_?null:g.current,w=k?k.getBoundingClientRect():{width:0,height:0,left:0,top:0};let $,I,D;if(V||d===void 0||d.clientX===0&&d.clientY===0||!d.clientX&&!d.touches)$=Math.round(w.width/2),I=Math.round(w.height/2);else{const{clientX:K,clientY:B}=d.touches&&d.touches.length>0?d.touches[0]:d;$=Math.round(K-w.left),I=Math.round(B-w.top)}if(V)D=Math.sqrt((2*w.width**2+w.height**2)/3),D%2===0&&(D+=1);else{const K=Math.max(Math.abs((k?k.clientWidth:0)-$),$)*2+2,B=Math.max(Math.abs((k?k.clientHeight:0)-I),I)*2+2;D=Math.sqrt(K**2+B**2)}d!=null&&d.touches?m.current===null&&(m.current=()=>{S({pulsate:A,rippleX:$,rippleY:I,rippleSize:D,cb:E})},y.start(pe,()=>{m.current&&(m.current(),m.current=null)})):S({pulsate:A,rippleX:$,rippleY:I,rippleSize:D,cb:E})},[o,S,y]),N=a.useCallback(()=>{x({},{pulsate:!0})},[x]),O=a.useCallback((d,P)=>{if(y.clear(),(d==null?void 0:d.type)==="touchend"&&m.current){m.current(),m.current=null,y.start(0,()=>{O(d,P)});return}m.current=null,p(E=>E.length>0?E.slice(1):E),f.current=P},[y]);return a.useImperativeHandle(n,()=>({pulsate:N,start:x,stop:O}),[N,x,O]),R.jsx(me,{className:v(C.root,s.root,i),ref:g,...l,children:R.jsx(ht,{component:null,exit:!0,children:u})})});function ye(t){return ct("MuiButtonBase",t)}const Se=et("MuiButtonBase",["root","disabled","focusVisible"]),Me=t=>{const{disabled:e,focusVisible:n,focusVisibleClassName:r,classes:o}=t,i=ut({root:["root",e&&"disabled",n&&"focusVisible"]},ye,o);return n&&r&&(i.root+=` ${r}`),i},xe=F("button",{name:"MuiButtonBase",slot:"Root"})({display:"inline-flex",alignItems:"center",justifyContent:"center",position:"relative",boxSizing:"border-box",WebkitTapHighlightColor:"transparent",backgroundColor:"transparent",outline:0,border:0,margin:0,borderRadius:0,padding:0,cursor:"pointer",userSelect:"none",verticalAlign:"middle",MozAppearance:"none",WebkitAppearance:"none",textDecoration:"none",color:"inherit","&::-moz-focus-inner":{borderStyle:"none"},[`&.${Se.disabled}`]:{pointerEvents:"none",cursor:"default"},"@media print":{colorAdjust:"exact"}}),Ne=a.forwardRef(function(e,n){const r=nt({props:e,name:"MuiButtonBase"}),{action:o,centerRipple:s=!1,children:i,className:l,component:u="button",disabled:p=!1,disableRipple:h=!1,disableTouchRipple:f=!1,focusRipple:b=!1,focusVisibleClassName:y,LinkComponent:m="a",onBlur:g,onClick:S,onContextMenu:x,onDragLeave:N,onFocus:O,onFocusVisible:d,onKeyDown:P,onKeyUp:E,onMouseDown:A,onMouseLeave:V,onMouseUp:_,onTouchEnd:k,onTouchMove:w,onTouchStart:$,tabIndex:I=0,TouchRippleProps:D,touchRippleRef:K,type:B,...Y}=r,W=a.useRef(null),M=le(),Ct=yt(M.ref,K),[L,Z]=a.useState(!1);p&&L&&Z(!1),a.useImperativeHandle(o,()=>({focusVisible:()=>{Z(!0),W.current.focus()}}),[]);const Et=M.shouldMount&&!h&&!p;a.useEffect(()=>{L&&b&&!h&&M.pulsate()},[h,b,L,M]);const Pt=T(M,"start",A,f),kt=T(M,"stop",x,f),It=T(M,"stop",N,f),Tt=T(M,"stop",_,f),wt=T(M,"stop",c=>{L&&c.preventDefault(),V&&V(c)},f),$t=T(M,"start",$,f),Dt=T(M,"stop",k,f),zt=T(M,"stop",w,f),jt=T(M,"stop",c=>{gt(c.target)||Z(!1),g&&g(c)},!1),Nt=Q(c=>{W.current||(W.current=c.currentTarget),gt(c.target)&&(Z(!0),d&&d(c)),O&&O(c)}),rt=()=>{const c=W.current;return u&&u!=="button"&&!(c.tagName==="A"&&c.href)},Vt=Q(c=>{b&&!c.repeat&&L&&c.key===" "&&M.stop(c,()=>{M.start(c)}),c.target===c.currentTarget&&rt()&&c.key===" "&&c.preventDefault(),P&&P(c),c.target===c.currentTarget&&rt()&&c.key==="Enter"&&!p&&(c.preventDefault(),S&&S(c))}),Bt=Q(c=>{b&&c.key===" "&&L&&!c.defaultPrevented&&M.stop(c,()=>{M.pulsate(c)}),E&&E(c),S&&c.target===c.currentTarget&&rt()&&c.key===" "&&!c.defaultPrevented&&S(c)});let J=u;J==="button"&&(Y.href||Y.to)&&(J=m);const X={};J==="button"?(X.type=B===void 0?"button":B,X.disabled=p):(!Y.href&&!Y.to&&(X.role="button"),p&&(X["aria-disabled"]=p));const Lt=yt(n,W),mt={...r,centerRipple:s,component:u,disabled:p,disableRipple:h,disableTouchRipple:f,focusRipple:b,tabIndex:I,focusVisible:L},Ut=Me(mt);return R.jsxs(xe,{as:J,className:v(Ut.root,l),ownerState:mt,onBlur:jt,onClick:S,onContextMenu:kt,onFocus:Nt,onKeyDown:Vt,onKeyUp:Bt,onMouseDown:Pt,onMouseLeave:wt,onMouseUp:Tt,onDragLeave:It,onTouchEnd:Dt,onTouchMove:zt,onTouchStart:$t,ref:Lt,tabIndex:p?-1:I,type:B,...X,...Y,children:[i,Et?R.jsx(be,{ref:Ct,center:s,...D}):null]})});function T(t,e,n,r=!1){return Q(o=>(n&&n(o),r||t[e](o),!0))}function Re(t){return ct("MuiCircularProgress",t)}et("MuiCircularProgress",["root","determinate","indeterminate","colorPrimary","colorSecondary","svg","circle","circleDeterminate","circleIndeterminate","circleDisableShrink"]);const z=44,at=q`
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
`,lt=q`
  0% {
    stroke-dasharray: 1px, 200px;
    stroke-dashoffset: 0;
  }

  50% {
    stroke-dasharray: 100px, 200px;
    stroke-dashoffset: -15px;
  }

  100% {
    stroke-dasharray: 1px, 200px;
    stroke-dashoffset: -126px;
  }
`,ve=typeof at!="string"?Rt`
        animation: ${at} 1.4s linear infinite;
      `:null,Ce=typeof lt!="string"?Rt`
        animation: ${lt} 1.4s ease-in-out infinite;
      `:null,Ee=t=>{const{classes:e,variant:n,color:r,disableShrink:o}=t,s={root:["root",n,`color${j(r)}`],svg:["svg"],circle:["circle",`circle${j(n)}`,o&&"circleDisableShrink"]};return ut(s,Re,e)},Pe=F("span",{name:"MuiCircularProgress",slot:"Root",overridesResolver:(t,e)=>{const{ownerState:n}=t;return[e.root,e[n.variant],e[`color${j(n.color)}`]]}})(pt(({theme:t})=>({display:"inline-block",variants:[{props:{variant:"determinate"},style:{transition:t.transitions.create("transform")}},{props:{variant:"indeterminate"},style:ve||{animation:`${at} 1.4s linear infinite`}},...Object.entries(t.palette).filter(Kt()).map(([e])=>({props:{color:e},style:{color:(t.vars||t).palette[e].main}}))]}))),ke=F("svg",{name:"MuiCircularProgress",slot:"Svg"})({display:"block"}),Ie=F("circle",{name:"MuiCircularProgress",slot:"Circle",overridesResolver:(t,e)=>{const{ownerState:n}=t;return[e.circle,e[`circle${j(n.variant)}`],n.disableShrink&&e.circleDisableShrink]}})(pt(({theme:t})=>({stroke:"currentColor",variants:[{props:{variant:"determinate"},style:{transition:t.transitions.create("stroke-dashoffset")}},{props:{variant:"indeterminate"},style:{strokeDasharray:"80px, 200px",strokeDashoffset:0}},{props:({ownerState:e})=>e.variant==="indeterminate"&&!e.disableShrink,style:Ce||{animation:`${lt} 1.4s ease-in-out infinite`}}]}))),Ve=a.forwardRef(function(e,n){const r=nt({props:e,name:"MuiCircularProgress"}),{className:o,color:s="primary",disableShrink:i=!1,size:l=40,style:u,thickness:p=3.6,value:h=0,variant:f="indeterminate",...b}=r,y={...r,color:s,disableShrink:i,size:l,thickness:p,value:h,variant:f},m=Ee(y),g={},S={},x={};if(f==="determinate"){const N=2*Math.PI*((z-p)/2);g.strokeDasharray=N.toFixed(3),x["aria-valuenow"]=Math.round(h),g.strokeDashoffset=`${((100-h)/100*N).toFixed(3)}px`,S.transform="rotate(-90deg)"}return R.jsx(Pe,{className:v(m.root,o),style:{width:l,height:l,...S,...u},ownerState:y,ref:n,role:"progressbar",...x,...b,children:R.jsx(ke,{className:m.svg,ownerState:y,viewBox:`${z/2} ${z/2} ${z} ${z}`,children:R.jsx(Ie,{className:m.circle,style:g,ownerState:y,cx:z,cy:z,r:(z-p)/2,fill:"none",strokeWidth:p})})})});export{Ne as B,Ve as C,ft as T,qt as _,je as a,Q as b,ze as c,yt as d,Gt as e,Zt as f,Ht as g,St as h,Yt as u};
