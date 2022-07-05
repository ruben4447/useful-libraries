/** [!] http://www.mymathlib.com/functions/fresnel_sin_cos_integrals.html */

import { chebyshevFirstSeries } from "./chebyshev-polynomials";

const epsilon = 2.2204460492503131e-16;

/**
 * Evaluates the Fresnel Auxiliary Sine Integral, g(x)
 * 
 * g(x) = integrate sqrt(2/pi) exp(-2xt) sin(t^2) between 0->inf, x >= 0
 */
export function fresnelAuxiliarySinIntegral(x: number) {
  if (x === 0) return 0.5;
  if (x <= 1) return g_chebyshevExpansion_0_1(x);
  if (x <= 3) return g_chebyshevExpansion_1_3(x);
  if (x <= 5) return g_chebyshevExpansion_3_5(x);
  if (x <= 7) return g_chebyshevExpansion_5_7(x);
  return g_asymptoticSeries(x);
}

/**
 * Evaluates the Fresnel Sine Integral, S(x)
 * 
 * S(x) = integrate sqrt(2/pi) sin(t^2) between 0->x
 */
export function fresnelSinIntegral(x: number) {
  if (Math.abs(x) < 0.5) return s_powerSeries(x);
  let f = fresnelAuxiliaryCosIntegral(x);
  let g = fresnelAuxiliarySinIntegral(x);
  let x2 = x * x;
  let s = 0.5 - Math.cos(x2) * f - Math.sin(x2) * g;
  return x < 0 ? -s : s;
}

/**
 * Evaluates the Fresnel Auxiliary Cosine Integral, f(x)
 * 
 * f(x) = integrate sqrt(2/pi) exp(-2xt) cos(t^2) between 0->inf, x >= 0
 */
export function fresnelAuxiliaryCosIntegral(x: number) {
  if (x === 0) return 0.5;
  if (x <= 1) return f_chebyshevExpansion_0_1(x);
  if (x <= 3) return f_chebyshevExpansion_1_3(x);
  if (x <= 5) return f_chebyshevExpansion_3_5(x);
  if (x <= 7) return f_chebyshevExpansion_5_7(x);
  return f_asymptoticSeries(x);
}

/**
 * Evaluates the Fresnel Sine Integral, C(x)
 * 
 * C(x) = integrate sqrt(2/pi) cos(t^2) between 0->x
 */
export function fresnelCosIntegral(x: number) {
  if (Math.abs(x) < 0.5) return c_powerSeries(x);
  let f = fresnelAuxiliaryCosIntegral(x);
  let g = fresnelAuxiliarySinIntegral(x);
  let x2 = x * x;
  let c = 0.5 + Math.sin(x2) * f - Math.cos(x2) * g;
  return x < 0 ? -c : c;
}

// .helpers
/** Evaluates the Fresnel Auxiliary Sine Integral 0 < x <= 1 */
function g_chebyshevExpansion_0_1(x: number) {
  const c = [
    + 2.560134650043040830997e-1, -1.993005146464943284549e-1,
    +4.025503636721387266117e-2, -4.459600454502960250729e-3,
    +6.447097305145147224459e-5, +7.544218493763717599380e-5,
    -1.580422720690700333493e-5, +1.755845848573471891519e-6,
    -9.289769688468301734718e-8, -5.624033192624251079833e-9,
    +1.854740406702369495830e-9, -2.174644768724492443378e-10,
    +1.392899828133395918767e-11, -6.989216003725983789869e-14,
    -9.959396121060010838331e-14, +1.312085140393647257714e-14,
    -9.240470383522792593305e-16, +2.472168944148817385152e-17,
    +2.834615576069400293894e-18, -4.650983461314449088349e-19,
    +3.544083040732391556797e-20
  ];
  return chebyshevFirstSeries((x - 0.5) * 2, c, c.length - 1);
}

/** Evaluates the Fresnel Auxiliary Sine Integral 1 < x <= 3 */
function g_chebyshevExpansion_1_3(x: number) {
  const c = [
    +3.470341566046115476477e-2, -3.855580521778624043304e-2,
    +1.420604309383996764083e-2, -4.037349972538938202143e-3,
    +9.292478174580997778194e-4, -1.742730601244797978044e-4,
    +2.563352976720387343201e-5, -2.498437524746606551732e-6,
    -1.334367201897140224779e-8, +7.436854728157752667212e-8,
    -2.059620371321272169176e-8, +3.753674773239250330547e-9,
    -5.052913010605479996432e-10, +4.580877371233042345794e-11,
    -7.664740716178066564952e-13, -7.200170736686941995387e-13,
    +1.812701686438975518372e-13, -2.799876487275995466163e-14,
    +3.048940815174731772007e-15, -1.936754063718089166725e-16,
    -7.653673328908379651914e-18, +4.534308864750374603371e-18,
    -8.011054486030591219007e-19, +9.374587915222218230337e-20,
    -7.144943099280650363024e-21, +1.105276695821552769144e-22,
    +6.989334213887669628647e-23
  ];
  return chebyshevFirstSeries(x - 2, c, c.length - 1);
}

/** Evaluates the Fresnel Auxiliary Sine Integral 3 < x <= 5 */
function g_chebyshevExpansion_3_5(x: number) {
  const c = [
    +3.684922395955255848372e-3, -2.624595437764014386717e-3,
    +6.329162500611499391493e-4, -1.258275676151483358569e-4,
    +2.207375763252044217165e-5, -3.521929664607266176132e-6,
    +5.186211398012883705616e-7, -7.095056569102400546407e-8,
    +9.030550018646936241849e-9, -1.066057806832232908641e-9,
    +1.157128073917012957550e-10, -1.133877461819345992066e-11,
    +9.633572308791154852278e-13, -6.336675771012312827721e-14,
    +1.634407356931822107368e-15, +3.944542177576016972249e-16,
    -9.577486627424256130607e-17, +1.428772744117447206807e-17,
    -1.715342656474756703926e-18, +1.753564314320837957805e-19,
    -1.526125102356904908532e-20, +1.070275366865736879194e-21,
    -4.783978662888842165071e-23
  ];
  return chebyshevFirstSeries(x - 4, c, c.length - 1);
}

/** Evaluates the Fresnel Auxiliary Sine Integral 5 < x <= 7 */
function g_chebyshevExpansion_5_7(x: number) {
  const c = [
    +1.000801217561417083840e-3, -4.915205279689293180607e-4,
    +8.133163567827942356534e-5, -1.120758739236976144656e-5,
    +1.384441872281356422699e-6, -1.586485067224130537823e-7,
    +1.717840749804993618997e-8, -1.776373217323590289701e-9,
    +1.765399783094380160549e-10, -1.692470022450343343158e-11,
    +1.568238301528778401489e-12, -1.405356860742769958771e-13,
    +1.217377701691787512346e-14, -1.017697418261094517680e-15,
    +8.186068056719295045596e-17, -6.305153620995673221364e-18,
    +4.614110100197028845266e-19, -3.165914620159266813849e-20,
    +1.986716456911232767045e-21, -1.078418278174434671506e-22,
    +4.255983404468350776788e-24
  ];
  return chebyshevFirstSeries(x - 6, c, c.length - 1);
}

/**
 * Evaluates the Fresnel Auxiliary Sine Integral for large value of x
 * 
 * g(x) ~ 1/(x^3 * sqrt(8pi))[1 - 15/4x^4 + 945/16x^8 + ... + (4j+1)!!/(-4x^4)^j + ... ]
 */
function g_asymptoticSeries(x: number) {
  let x2 = x * x, x4 = -4 * x2 * x2, xn = 1;
  let factorial = 1;
  const term: number[] = [];
  let ep = epsilon / 4;
  let j = 5, i = 0;
  term[0] = 1;
  term[35] = 0;
  for (i = 1; i < 35; i++) {
    factorial *= j * (j - 2);
    xn *= x4;
    term[i] = factorial / xn;
    j += 4;
    if (Math.abs(term[i]) >= Math.abs(term[i - 1])) {
      i--;
      break;
    }
    if (Math.abs(term[i]) <= ep) break;
  }
  let g = 0;
  for (; i >= 0; i--) g += term[i];
  g /= x * sqrt_2pi;
  return g / (x2 + x2);
}

/** Evaluates the Fresnel Auxiliary Cosine Integral 0 < x <= 1 */
function f_chebyshevExpansion_0_1(x: number) {
  const c = [
    +4.200987560240514577713e-1, -9.358785913634965235904e-2,
    -7.642539415723373644927e-3, +4.958117751796130135544e-3,
    -9.750236036106120253456e-4, +1.075201474958704192865e-4,
    -4.415344769301324238886e-6, -7.861633919783064216022e-7,
    +1.919240966215861471754e-7, -2.175775608982741065385e-8,
    +1.296559541430849437217e-9, +2.207205095025162212169e-11,
    -1.479219615873704298874e-11, +1.821350127295808288614e-12,
    -1.228919312990171362342e-13, +2.227139250593818235212e-15,
    +5.734729405928016301596e-16, -8.284965573075354177016e-17,
    +6.067422701530157308321e-18, -1.994908519477689596319e-19,
    -1.173365630675305693390e-20
  ];
  return chebyshevFirstSeries((x - 0.5) * 2, c, c.length - 1);
}

/** Evaluates the Fresnel Auxiliary Cosine Integral 1 < x <= 3 */
function f_chebyshevExpansion_1_3(x: number) {
  const c = [
    +2.098677278318224971989e-1, -9.314234883154103266195e-2,
    +1.739905936938124979297e-2, -2.454274824644285136137e-3,
    +1.589872606981337312438e-4, +4.203943842506079780413e-5,
    -2.018022256093216535093e-5, +5.125709636776428285284e-6,
    -9.601813551752718650057e-7, +1.373989484857155846826e-7,
    -1.348105546577211255591e-8, +2.745868700337953872632e-10,
    +2.401655517097260106976e-10, -6.678059547527685587692e-11,
    +1.140562171732840809159e-11, -1.401526517205212219089e-12,
    +1.105498827380224475667e-13, +2.040731455126809208066e-16,
    -1.946040679213045143184e-15, +4.151821375667161733612e-16,
    -5.642257647205149369594e-17, +5.266176626521504829010e-18,
    -2.299025577897146333791e-19, -2.952226367506641078731e-20,
    +8.760405943193778149078e-21
  ];
  return chebyshevFirstSeries(x - 2, c, c.length - 1);
}

/** Evaluates the Fresnel Auxiliary Cosine Integral 3 < x <= 5 */
function f_chebyshevExpansion_3_5(x: number) {
  const c = [
    +1.025703371090289562388e-1, -2.569833023232301400495e-2,
    +3.160592981728234288078e-3, -3.776110718882714758799e-4,
    +4.325593433537248833341e-5, -4.668447489229591855730e-6,
    +4.619254757356785108280e-7, -3.970436510433553795244e-8,
    +2.535664754977344448598e-9, -2.108170964644819803367e-11,
    -2.959172018518707683013e-11, +6.727219944906606516055e-12,
    -1.062829587519902899001e-12, +1.402071724705287701110e-13,
    -1.619154679722651005075e-14, +1.651319588396970446858e-15,
    -1.461704569438083772889e-16, +1.053521559559583268504e-17,
    -4.760946403462515858756e-19, -1.803784084922403924313e-20,
    +7.873130866418738207547e-21
  ];
  return chebyshevFirstSeries(x - 4, c, c.length - 1);
}

/** Evaluates the Fresnel Auxiliary Cosine Integral 7 < x <= 7 */
function f_chebyshevExpansion_5_7(x: number) {
  const c = [
    +6.738667333400589274018e-2, -1.128146832637904868638e-2,
    +9.408843234170404670278e-4, -7.800074103496165011747e-5,
    +6.409101169623350885527e-6, -5.201350558247239981834e-7,
    +4.151668914650221476906e-8, -3.242202015335530552721e-9,
    +2.460339340900396789789e-10, -1.796823324763304661865e-11,
    +1.244108496436438952425e-12, -7.950417122987063540635e-14,
    +4.419142625999150971878e-15, -1.759082736751040110146e-16,
    -1.307443936270786700760e-18, +1.362484141039320395814e-18,
    -2.055236564763877250559e-19, +2.329142055084791308691e-20,
    -2.282438671525884861970e-21
  ];
  return chebyshevFirstSeries(x - 6, c, c.length - 1);
}

/**
 * Evaluates the Fresnel Auxiliary Cosine Integral for large value of x
 * 
 * f(x) ~ 1/(x*sqrt(2pi))[1 - 3/4x^4 + 105/16x^8 + ... + (4j-1)!!/(-4x^4)^j + ... ]
 */
function f_asymptoticSeries(x: number) {
  let x2 = x * x, x4 = -4 * x2 * x2, xn = 1;
  let factorial = 1;
  const term: number[] = [];
  let ep = epsilon / 4;
  let j = 3, i = 0;
  term[0] = 1;
  term[35] = 0;
  for (i = 1; i < 35; i++) {
    factorial *= j * (j - 2);
    xn *= x4;
    term[i] = factorial / xn;
    j += 4;
    if (Math.abs(term[i]) >= Math.abs(term[i - 1])) {
      i--;
      break;
    }
    if (Math.abs(term[i]) <= ep) break;
  }
  let f = 0;
  for (; i >= 0; i--) f += term[i];
  return f / (x * sqrt_2pi);
}

/**
 * Evaluates the Fresnel Sine Integral for |x| < 0.5
 */
function s_powerSeries(x: number) {
  if (x === 0) return 0;
  let x2 = x * x, x3 = x * x2, x4 = - x2 * x2;
  let xn = 1;
  let Sn = 1 / 3;
  let Sm1 = 0;
  let factorial = 1;
  let sqrt_2_o_pi = 7.978845608028653558798921198687637369517e-1;
  let y = 0;
  let term: number;
  while (Math.abs(Sn - Sm1) > epsilon * Math.abs(Sm1)) {
    Sm1 = Sn;
    y += 1;
    factorial *= 2 * y;
    factorial *= 2 * y + 1;
    xn *= x4;
    term = xn / factorial;
    term /= 4 * y + 3;
    Sn += term;
  }
  return x3 * sqrt_2_o_pi * Sn;
}

/**
 * Evaluates the Fresnel Cosine Integral for |x| < 0.5
 */
function c_powerSeries(x: number) {
  if (x === 0) return 0;
  let x2 = x * x, x3 = x * x2, x4 = - x2 * x2;
  let xn = 1;
  let Sn = 1;
  let Sm1 = 0;
  let factorial = 1;
  let sqrt_2_o_pi = 7.978845608028653558798921198687637369517e-1;
  let y = 0;
  let term: number;
  while (Math.abs(Sn - Sm1) > epsilon * Math.abs(Sm1)) {
    Sm1 = Sn;
    y += 1;
    factorial *= 2 * y;
    factorial *= 2 * y - 1;
    xn *= x4;
    term = xn / factorial;
    term /= 4 * y + 1;
    Sn += term;
  }
  return x * sqrt_2_o_pi * Sn;
}

// .data
const sqrt_2pi = 2.506628274631000502415765284811045253006;